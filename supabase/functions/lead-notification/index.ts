// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"


// 1. Remove Deno.env.get and just leave the keys in quotes
// SECURE VERSION - It will now read from your Dashboard Secrets
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')


serve(async (req) => {
  try {
    console.log("--- New Lead Triggered ---")
    const payload = await req.json()
    const { record } = payload

    if (!record) throw new Error("No record found in payload")
    console.log("Lead Name:", record.name)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    // 1. Fetch Profile
    console.log("Fetching profile:", record.profile_id)
    const { data: profile, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('brand_name, user_id')
      .eq('id', record.profile_id)
      .single()
    if (pErr || !profile) throw new Error(`Profile Error: ${pErr?.message}`)
    console.log("Brand Found:", profile.brand_name)
    // 2. Fetch User Email
    console.log("Fetching owner email for user_id:", profile.user_id)
    const { data: userData, error: uErr } = await supabaseAdmin.auth.admin.getUserById(profile.user_id)
    const ownerEmail = userData?.user?.email
    if (uErr || !ownerEmail) throw new Error(`Owner Email Error: ${uErr?.message}`)
    console.log("Sending to email:", ownerEmail)
    // 3. Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Portid Leads <info@portid.in>',
        to: [ownerEmail],
        subject: `New Lead: ${record.name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <!-- Header -->
              <div style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">New Lead Alert 🎉</h1>
                <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 15px;">for ${profile.brand_name}</p>
              </div>
              
              <!-- Body -->
              <div style="padding: 40px;">
                <p style="color: #334155; font-size: 16px; line-height: 24px; margin: 0 0 32px 0;">You have received a new customer enquiry from your digital profile.</p>
                
                <!-- Details Table -->
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 16px; background-color: #f8fafc; border-radius: 8px 0 0 0; border-bottom: 2px solid #ffffff; width: 100px;">
                      <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">Name</span>
                    </td>
                    <td style="padding: 16px; background-color: #f8fafc; border-radius: 0 8px 0 0; border-bottom: 2px solid #ffffff;">
                      <span style="font-size: 16px; color: #0f172a; font-weight: 600;">${record.name}</span>
                    </td>
                  </tr>
                  ${record.email ? `
                  <tr>
                    <td style="padding: 16px; background-color: #f8fafc; border-bottom: 2px solid #ffffff;">
                      <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">Email</span>
                    </td>
                    <td style="padding: 16px; background-color: #f8fafc; border-bottom: 2px solid #ffffff;">
                      <a href="mailto:${record.email}" style="font-size: 16px; color: #3b82f6; text-decoration: none; font-weight: 500;">${record.email}</a>
                    </td>
                  </tr>
                  ` : ''}
                  ${record.phone ? `
                  <tr>
                    <td style="padding: 16px; background-color: #f8fafc; border-bottom: 2px solid #ffffff;">
                      <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">Phone</span>
                    </td>
                    <td style="padding: 16px; background-color: #f8fafc; border-bottom: 2px solid #ffffff;">
                      <a href="tel:${record.phone}" style="font-size: 16px; color: #0f172a; text-decoration: none; font-weight: 500;">${record.phone}</a>
                    </td>
                  </tr>
                  ` : ''}
                </table>
                
                ${record.requirement ? `
                <div style="margin-top: 24px;">
                  <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 8px;">Message</span>
                  <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #334155; font-size: 15px; line-height: 24px; white-space: pre-wrap;">${record.requirement}</p>
                  </div>
                </div>
                ` : ''}
                
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f1f5f9; padding: 24px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">Powered by <strong style="color: #64748b;">Portid</strong></p>
              </div>
            </div>
          </div>
        `
      })
    })
    const resData = await res.json()
    console.log("Resend Response:", JSON.stringify(resData))
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error("CRITICAL ERROR:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})