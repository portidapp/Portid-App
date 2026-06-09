import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    console.log("--- Welcome Email Webhook Triggered ---")
    const payload = await req.json()
    const { record } = payload

    if (!record) {
      throw new Error("No record found in payload")
    }

    console.log("New Profile Slug:", record.slug)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Fetch user email from auth
    console.log("Fetching auth user email for user_id:", record.user_id)
    const { data: userData, error: uErr } = await supabaseAdmin.auth.admin.getUserById(record.user_id)
    
    // Fallback to record.email if present, otherwise auth email
    const email = record.email || userData?.user?.email
    if (uErr || !email) {
      throw new Error(`User Email not found. Error: ${uErr?.message}`)
    }
    
    console.log("Target User Email:", email)
    const profileUrl = `https://portid.in/p/${record.slug}` // Customize as needed
    const billingUrl = `https://portid.in/pricing`

    // 2. Format HTML email template
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070708; padding: 50px 20px; color: #fafafa; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0c0c0e; border: 1px solid #1f1f23; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316 0%, #d97706 100%); padding: 40px 40px; text-align: center; position: relative;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">Welcome to Portid! 🎉</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0; font-size: 15px; font-weight: 600;">Your digital presence is live.</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 40px 30px 40px;">
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">Hello ${record.brand_name || 'there'}!</h2>
            
            <p style="color: #a1a1aa; font-size: 15px; line-height: 26px; margin: 0 0 24px 0;">
              Congratulations on setting up your digital business card and profile with Portid. You are now ready to share your brand, contacts, products, and links in one elegant card.
            </p>
            
            <!-- Link Box -->
            <div style="background-color: #18181b; border: 1px solid #27272a; padding: 20px; border-radius: 16px; margin-bottom: 30px; text-align: center;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #71717a; font-weight: 800; display: block; margin-bottom: 8px;">Your Live URL</span>
              <a href="${profileUrl}" target="_blank" style="font-size: 18px; color: #f97316; font-weight: 800; text-decoration: none; word-break: break-all;">portid.in/p/${record.slug}</a>
            </div>

            <!-- Features of Pro -->
            <h3 style="color: #ffffff; font-size: 16px; font-weight: 800; margin-top: 0; margin-bottom: 16px; border-left: 3px solid #f97316; padding-left: 12px;">Take it to the Next Level with Pro</h3>
            <p style="color: #a1a1aa; font-size: 14px; line-height: 24px; margin: 0 0 20px 0;">
              Upgrade to the <strong>Pro Plan</strong> today to unlock premium features and stand out from the competition:
            </p>

            <table style="width: 100%; margin-bottom: 32px;">
              <tr>
                <td style="padding: 8px 0; vertical-align: top; width: 24px; color: #f97316; font-weight: bold;">✓</td>
                <td style="padding: 8px 0 8px 10px; color: #d4d4d8; font-size: 14px; line-height: 20px;">
                  <strong>Media Gallery:</strong> Upload images and video showcases directly.
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; vertical-align: top; width: 24px; color: #f97316; font-weight: bold;">✓</td>
                <td style="padding: 8px 0 8px 10px; color: #d4d4d8; font-size: 14px; line-height: 20px;">
                  <strong>Custom Design Themes:</strong> Match your profile colors perfectly to your brand.
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; vertical-align: top; width: 24px; color: #f97316; font-weight: bold;">✓</td>
                <td style="padding: 8px 0 8px 10px; color: #d4d4d8; font-size: 14px; line-height: 20px;">
                  <strong>Lead Forms & Appointment Booking:</strong> Collect customer enquiries directly.
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; vertical-align: top; width: 24px; color: #f97316; font-weight: bold;">✓</td>
                <td style="padding: 8px 0 8px 10px; color: #d4d4d8; font-size: 14px; line-height: 20px;">
                  <strong>Branding Removal:</strong> Remove the "Powered by Portid" logo watermark.
                </td>
              </tr>
            </table>

            <!-- Button CTA -->
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${billingUrl}" target="_blank" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 800; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                Upgrade to Pro Plan 🚀
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #121214; padding: 24px; text-align: center; border-top: 1px solid #1f1f23;">
            <p style="margin: 0; font-size: 11px; color: #71717a;">You received this because you registered a profile on Portid.</p>
            <p style="margin: 6px 0 0 0; font-size: 11px; color: #71717a;">© ${new Date().getFullYear()} Portid. All rights reserved.</p>
          </div>
        </div>
      </div>
    `

    // 3. Send email via Resend
    console.log("Sending Welcome Email via Resend...")
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Portid <info@portid.in>',
        to: [email],
        subject: `Welcome to Portid, ${record.brand_name}! 🎉`,
        html: htmlContent
      })
    })

    const resData = await res.json()
    console.log("Resend API response:", JSON.stringify(resData))

    if (!res.ok) {
      throw new Error(`Resend Error: ${resData.message || "Failed to send email"}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error("Welcome email execution failed:", err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
