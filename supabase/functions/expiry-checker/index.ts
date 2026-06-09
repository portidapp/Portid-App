import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const CRON_SECRET = "cron_trigger_secret_8e27e15c"

serve(async (req) => {
  // CORS check
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    console.log("--- Expiry Checker Triggered ---")

    // 1. Verify cron secret key for security
    const urlObj = new URL(req.url)
    const secret = urlObj.searchParams.get("secret")
    if (secret !== CRON_SECRET) {
      console.warn("Unauthorized trigger attempt on expiry-checker")
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // 2. Fetch all active premium user plans with expiration dates
    console.log("Scanning user plans...")
    const { data: plans, error: pErr } = await supabaseAdmin
      .from('user_plans')
      .select('user_id, plan_tier, expires_at, billing_cycle')
      .eq('plan_tier', 'premium')
      .not('expires_at', 'is', null)

    if (pErr) throw pErr

    const now = new Date()
    const warning3Days: any[] = []
    const warning1Day: any[] = []

    for (const plan of plans || []) {
      const expiresAt = new Date(plan.expires_at)
      const diffMs = expiresAt.getTime() - now.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)

      // Expiring in 2-3 days (exactly 3 days before, daily check catches it)
      if (diffDays >= 2.0 && diffDays <= 3.0) {
        warning3Days.push(plan)
      } 
      // Expiring in 0-1 day (exactly 1 day before)
      else if (diffDays >= 0.0 && diffDays <= 1.0) {
        warning1Day.push(plan)
      }
    }

    console.log(`Found ${warning3Days.length} plans expiring in 3 days, ${warning1Day.length} plans expiring tomorrow.`)

    const billingUrl = "https://portid.in/pricing"
    const results: string[] = []

    // Helper to send emails
    const sendExpiryEmail = async (plan: any, daysLeft: 1 | 3) => {
      try {
        // Fetch user auth details
        const { data: userData, error: uErr } = await supabaseAdmin.auth.admin.getUserById(plan.user_id)
        const email = userData?.user?.email
        if (uErr || !email) {
          console.error(`Skipping user_id: ${plan.user_id}. No email found.`)
          return
        }

        // Fetch brand profile details
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('brand_name, slug')
          .eq('user_id', plan.user_id)
          .maybeSingle()

        const brandName = profile?.brand_name || 'Premium Member'
        const expiresAtStr = new Date(plan.expires_at).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })

        const subject = daysLeft === 3
          ? `Action Required: Your Portid Pro Plan is expiring in 3 days! ⏳`
          : `Urgent: Your Portid Pro Plan expires tomorrow! ⚠️`

        const titleText = daysLeft === 3
          ? `Renew Your Pro Plan`
          : `Your Pro Plan Expires Tomorrow`

        const warningMessage = daysLeft === 3
          ? `Your Portid premium plan will expire on <strong>${expiresAtStr}</strong>. Renew your plan today to continue enjoying your premium setup without interruption.`
          : `Your premium plan expires tomorrow on <strong>${expiresAtStr}</strong>. Renew the plan now for continued setup and to maintain all of your premium layouts.`

        const htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070708; padding: 50px 20px; color: #fafafa; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0c0c0e; border: 1px solid #27272a; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
              <!-- Header -->
              <div style="background-color: #1c1917; border-bottom: 2px solid #f97316; padding: 32px 40px; text-align: center;">
                <h1 style="color: #f97316; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">${titleText}</h1>
              </div>
              
              <!-- Body -->
              <div style="padding: 40px;">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 16px;">Hello ${brandName},</h2>
                
                <p style="color: #d4d4d8; font-size: 15px; line-height: 26px; margin: 0 0 24px 0;">
                  ${warningMessage}
                </p>
                
                <!-- Box details -->
                <div style="background-color: #18181b; border: 1px solid #27272a; padding: 20px; border-radius: 16px; margin-bottom: 30px;">
                  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                    <tr>
                      <td style="padding: 6px 0; color: #71717a; font-weight: bold;">Current Tier:</td>
                      <td style="padding: 6px 0; color: #ffffff; font-weight: bold; text-transform: uppercase;">Pro Plan</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #71717a; font-weight: bold;">Billing Cycle:</td>
                      <td style="padding: 6px 0; color: #ffffff; font-weight: bold; text-transform: capitalize;">${plan.billing_cycle || 'manual'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #71717a; font-weight: bold;">Expiry Time:</td>
                      <td style="padding: 6px 0; color: #f97316; font-weight: bold;">${expiresAtStr}</td>
                    </tr>
                  </table>
                </div>

                <!-- Features reminder -->
                <p style="color: #a1a1aa; font-size: 14px; line-height: 24px; margin: 0 0 24px 0;">
                  If your subscription expires, your profile will revert to the Basic plan, meaning media galleries, custom layouts, contact collection, and your custom theme will be temporarily deactivated.
                </p>

                <!-- CTA Button -->
                <div style="text-align: center; margin-bottom: 10px;">
                  <a href="${billingUrl}" target="_blank" style="background-color: #f97316; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 800; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                    Renew Subscription Now 🚀
                  </a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #121214; padding: 24px; text-align: center; border-top: 1px solid #1f1f23;">
                <p style="margin: 0; font-size: 11px; color: #71717a;">This is an automated subscription reminder regarding your account.</p>
                <p style="margin: 6px 0 0 0; font-size: 11px; color: #71717a;">© ${new Date().getFullYear()} Portid. All rights reserved.</p>
              </div>
            </div>
          </div>
        `

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Portid Billing <info@portid.in>',
            to: [email],
            subject: subject,
            html: htmlContent
          })
        })

        const resData = await res.json()
        if (!res.ok) {
          throw new Error(`Resend Error: ${resData.message || "Failed to send"}`)
        }

        results.push(`Sent warning (${daysLeft} days) to user ${plan.user_id} (${email})`)
        console.log(`Successfully sent warning (${daysLeft} days) to user ${plan.user_id} (${email})`)
      } catch (err: any) {
        console.error(`Failed to send warning email to user ${plan.user_id}:`, err.message)
      }
    }

    // Run notifications sequentially
    for (const plan of warning3Days) {
      await sendExpiryEmail(plan, 3)
    }
    for (const plan of warning1Day) {
      await sendExpiryEmail(plan, 1)
    }

    return new Response(JSON.stringify({ success: true, processed: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error("Expiry checker failed:", err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
