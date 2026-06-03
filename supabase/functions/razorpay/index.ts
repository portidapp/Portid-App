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
      // Yearly = ₹1,490 => 149000 paise
      const amount = billingCycle === "monthly" ? 14900 : 149000
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
        .upsert({
          user_id: user.id,
          plan_tier: 'premium',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })

      if (dbError) {
        console.error("Database update error:", dbError.message)
        throw new Error(`Failed to update user plan: ${dbError.message}`)
      }

      console.log("Successfully updated plan to premium for user:", user.id)

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
