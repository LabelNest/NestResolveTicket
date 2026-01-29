import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !BREVO_API_KEY) {
  throw new Error("Missing environment variables");
}


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};


async function sendBrevoEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "LabelNest",
        email: "contact@labelnest.in",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    console.error("BREVO ERROR:", await res.text());
  }
}



const APPROVAL_EMAIL_HTML = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f6f8;padding:40px 0">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:10px;padding:32px;box-shadow:0 8px 24px rgba(0,0,0,.06)">
    <h2 style="margin:0 0 16px;font-size:22px;color:#111827">🎉 Account Approved</h2>
    <p style="font-size:15px;color:#374151;line-height:1.6">
      Your <strong>LabelNest</strong> account has been successfully approved.
    </p>
    <p style="font-size:15px;color:#374151;line-height:1.6">
      Please check your email for an <strong>invite link</strong> to set your password and access your account.
    </p>
    <div style="background:#f9fafb;border-left:4px solid #4f46e5;padding:12px 16px;border-radius:6px;margin:20px 0;font-size:14px;color:#1f2937">
      If you don’t see the invite, check your spam or promotions folder.
    </div>
    <p style="font-size:13px;color:#6b7280;margin:0">
      — Team LabelNest
    </p>
  </div>
</div>`; 
const REJECTION_EMAIL_HTML = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f6f8;padding:40px 0">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:10px;padding:32px;box-shadow:0 8px 24px rgba(0,0,0,.06)">
    <h2 style="margin:0 0 16px;font-size:22px;color:#991b1b">Signup Request Update</h2>
    <p style="font-size:15px;color:#374151;line-height:1.6">
      Thank you for your interest in <strong>LabelNest</strong>.
    </p>
    <p style="font-size:15px;color:#374151;line-height:1.6">
      Unfortunately, your signup request was not approved at this time.
      You may reapply in the future.
    </p>
    <p style="font-size:13px;color:#6b7280;margin:0">
      — Team LabelNest
    </p>
  </div>
</div>`; 


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const jwt = authHeader.replace("Bearer ", "");

    const { email, signupRequestId, reject } = await req.json();

    if (!email || !signupRequestId) {
      return new Response(
        JSON.stringify({ error: "Missing email or signupRequestId" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SERVICE_ROLE_KEY
    );

    
    const {
      data: { user: adminUser },
    } = await supabaseAdmin.auth.getUser(jwt);

    if (!adminUser?.email) {
      return new Response(
        JSON.stringify({ error: "Invalid admin session" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const adminEmail = adminUser.email;

  
    if (reject) {
      await supabaseAdmin
        .from("nr_signup_requests")
        .update({ nr_status: "REJECTED" })
        .eq("nr_id", signupRequestId);

      await supabaseAdmin.from("nr_signup_audit").insert({
        signup_request_id: signupRequestId,
        action: "REJECTED",
        acted_by: adminEmail,
      });

      await supabaseAdmin
        .from("nr_admin_approval_stats")
        .upsert(
          {
            admin_email: adminEmail,
            rejected: 1,
            total: 1,
            last_action_at: new Date().toISOString(),
          },
          {
            onConflict: "admin_email",
            increment: {
              rejected: 1,
              total: 1,
            },
          }
        );

      await sendBrevoEmail(
        email,
        "Signup Request Rejected – LabelNest",
        REJECTION_EMAIL_HTML
      );

      return new Response(
        JSON.stringify({ success: true }),
        { headers: corsHeaders }
      );
    }

    

    await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    await supabaseAdmin
      .from("nr_signup_requests")
      .update({ nr_status: "APPROVED" })
      .eq("nr_id", signupRequestId);

    await supabaseAdmin.from("nr_signup_audit").insert({
      signup_request_id: signupRequestId,
      action: "APPROVED",
      acted_by: adminEmail,
    });

    await supabaseAdmin
      .from("nr_admin_approval_stats")
      .upsert(
        {
          admin_email: adminEmail,
          approved: 1,
          total: 1,
          last_action_at: new Date().toISOString(),
        },
        {
          onConflict: "admin_email",
          increment: {
            approved: 1,
            total: 1,
          },
        }
      );

    await sendBrevoEmail(
      email,
      "🎉 Account Approved – LabelNest",
      APPROVAL_EMAIL_HTML
    );

    return new Response(
      JSON.stringify({ success: true }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("EDGE FUNCTION ERROR:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
