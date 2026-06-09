import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const text = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(text);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );

  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const generatedSignature = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return generatedSignature === signature;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("--- Razorpay Endpoint Triggered ---")
    
    // 1. Get Auth Header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error("No Authorization header provided")
    }

    // 2. Initialize client-scoped Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ""
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get user details to authenticate request
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized user" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log("Authenticated User ID:", user.id)

    // 3. Parse request payload
    const body = await req.json()
    const { action } = body

    // 4. Retrieve credentials from environment secrets
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("CRITICAL: Razorpay keys are not configured in Supabase environment secrets!")
      return new Response(
        JSON.stringify({ error: "Razorpay credentials are not configured on the server." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: CREATE ORDER
    if (action === "create_order") {
      const { billingCycle } = body
      if (billingCycle !== "monthly" && billingCycle !== "yearly") {
        throw new Error("Invalid billing cycle (must be monthly or yearly)")
      }

      // Calculate amount in paise:
      // Monthly = ₹149 => 14900 paise
      // Yearly = ₹1,499 => 149900 paise
      const amount = billingCycle === "monthly" ? 14900 : 149900
      console.log(`Creating Razorpay Order for cycle: ${billingCycle}, amount: ${amount} paise`)

      const receipt = `rcpt_${user.id.substring(0, 8)}_${Date.now()}`

      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt,
          notes: {
            userId: user.id,
            billingCycle
          }
        })
      })

      const orderData = await rzpResponse.json()
      if (!rzpResponse.ok) {
        console.error("Razorpay API Error Response:", JSON.stringify(orderData))
        throw new Error(orderData.error?.description || "Failed to create order on Razorpay")
      }

      console.log("Successfully created Razorpay order:", orderData.id)

      return new Response(
        JSON.stringify({ 
          order_id: orderData.id,
          amount: orderData.amount,
          currency: orderData.currency,
          razorpay_key_id: RAZORPAY_KEY_ID
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: VERIFY PAYMENT
    if (action === "verify_payment") {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, billingCycle } = body
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !billingCycle) {
        throw new Error("Missing required checkout details for verification")
      }

      console.log(`Verifying payment signature for Order ID: ${razorpay_order_id}`)

      // Verify the signature
      const isSignatureValid = await verifySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        RAZORPAY_KEY_SECRET
      )

      if (!isSignatureValid) {
        console.error("Signature verification failed!")
        return new Response(
          JSON.stringify({ error: "Invalid payment signature verification failed." }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log("Signature verified successfully! Provisioning user plan...")

      // Initialize Supabase Admin (bypassing Row Level Security)
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

      // Calculate expiration date
      const expiresAt = new Date()
      if (billingCycle === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1)
      }

      console.log(`Setting plan tier to premium, expires_at: ${expiresAt.toISOString()}`)

      const { error: dbError } = await supabaseAdmin
        .from('user_plans')
        .upsert(
          {
            user_id: user.id,
            plan_tier: 'premium',
            billing_cycle: billingCycle,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )

      if (dbError) {
        console.error("Database update error:", dbError.message)
        throw new Error(`Failed to update user plan: ${dbError.message}`)
      }

      console.log("Successfully updated plan to premium for user:", user.id)

      // Send Upgrade Confirmation Email
      try {
        console.log("Fetching owner email for user_id:", user.id)
        const { data: userData, error: uErr } = await supabaseAdmin.auth.admin.getUserById(user.id)
        const ownerEmail = userData?.user?.email

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('brand_name, slug')
          .eq('user_id', user.id)
          .maybeSingle()

        if (ownerEmail) {
          const brandName = profile?.brand_name || 'Member'
          const expiresAtStr = expiresAt.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          
          console.log(`Sending Upgrade Confirmation Email to ${ownerEmail}...`)
          const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070708; padding: 50px 20px; color: #fafafa; margin: 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #0c0c0e; border: 1px solid #27272a; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #f97316 0%, #d97706 100%); padding: 40px 40px; text-align: center; position: relative;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 950; letter-spacing: -0.5px; text-transform: uppercase;">You're Pro! 🚀</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: bold;">Upgrade Confirmation</p>
                </div>
                
                <!-- Body -->
                <div style="padding: 40px;">
                  <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">Hello ${brandName},</h2>
                  
                  <p style="color: #d4d4d8; font-size: 15px; line-height: 26px; margin: 0 0 24px 0;">
                    Thank you for upgrading to the <strong>Portid Pro Plan</strong>! Your payment was processed successfully. 
                    Your account has been upgraded with all premium layout controls, transparent QR codes, custom themes, lead forms, and unlimited link capabilities.
                  </p>
                  
                  <!-- Expiry details box -->
                  <div style="background-color: #18181b; border: 1px solid #27272a; padding: 20px; border-radius: 16px; margin-bottom: 30px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                      <tr>
                        <td style="padding: 6px 0; color: #71717a; font-weight: bold;">Plan Level:</td>
                        <td style="padding: 6px 0; color: #f97316; font-weight: bold; text-transform: uppercase;">Pro Plan</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #71717a; font-weight: bold;">Billing Cycle:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-weight: bold; text-transform: capitalize;">${billingCycle} upgrade</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #71717a; font-weight: bold;">Expiration Time:</td>
                        <td style="padding: 6px 0; color: #ffffff; font-weight: bold;">${expiresAtStr}</td>
                      </tr>
                    </table>
                  </div>

                  <h3 style="color: #ffffff; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 12px; border-left: 3px solid #f97316; padding-left: 10px;">Pro Plan Benefits</h3>
                  <ul style="color: #a1a1aa; font-size: 13.5px; line-height: 22px; padding-left: 20px; margin: 0 0 30px 0;">
                    <li style="margin-bottom: 6px;">Add unlimited custom buttons and custom contact links.</li>
                    <li style="margin-bottom: 6px;">Upload images and video showcases in your media gallery.</li>
                    <li style="margin-bottom: 6px;">Access Design Studio and create custom theme styles.</li>
                    <li style="margin-bottom: 6px;">Enable lead contact forms and appointment booking.</li>
                    <li style="margin-bottom: 6px;">Remove the "Powered by Portid" logo watermark from your profile card.</li>
                  </ul>

                  <!-- Button CTA -->
                  <div style="text-align: center; margin-bottom: 10px;">
                    <a href="https://portid.in/dashboard" target="_blank" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 800; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                      Go to Your Dashboard
                    </a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #121214; padding: 24px; text-align: center; border-top: 1px solid #1f1f23;">
                  <p style="margin: 0; font-size: 11px; color: #71717a;">You received this because you upgraded your Portid subscription.</p>
                  <p style="margin: 6px 0 0 0; font-size: 11px; color: #71717a;">© ${new Date().getFullYear()} Portid. All rights reserved.</p>
                </div>
              </div>
            </div>
          `

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            },
            body: JSON.stringify({
              from: 'Portid Billing <info@portid.in>',
              to: [ownerEmail],
              subject: `Thank you for upgrading to Pro! 🚀`,
              html: htmlContent
            })
          })
          console.log("Upgrade Confirmation Email dispatched successfully to:", ownerEmail)
        }
      } catch (mailErr: any) {
        console.error("Failed to send upgrade confirmation email:", mailErr.message)
      }

      return new Response(
        JSON.stringify({ success: true, message: "Subscription activated successfully!" }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error(`Unsupported action type: ${action}`)
  } catch (err: any) {
    console.error("Error in razorpay function execution:", err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
