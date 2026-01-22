import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ---------------- ENV ---------------- */
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY missing");

/* ---------------- CORS ---------------- */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* ---------------- BREVO EMAIL ---------------- */
async function sendBrevoEmail(
  to: string,
  subject: string,
  html: string
) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "LabelNest",
        email: "suhas.bhat@labelnest.in", // ✅ VERIFIED SENDER ONLY
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Brevo email failed:", text);
    // ❗ Do NOT throw — approval must still succeed
  }
}

/* ---------------- FUNCTION ---------------- */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, signupRequestId, reject } = await req.json();

    if (!email || !signupRequestId) {
      return new Response(
        JSON.stringify({ error: "Missing email or signupRequestId" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /* ---------------- REJECT ---------------- */
    if (reject === true) {
      await supabaseAdmin
        .from("nr_signup_requests")
        .update({ nr_status: "REJECTED" })
        .eq("nr_id", signupRequestId);

      await supabaseAdmin.from("nr_signup_audit").insert({
        nr_email: email,
        nr_action: "REJECTED",
      });

      await sendBrevoEmail(
        email,
        "Signup Request Rejected – LabelNest",
        `
          <p>Hello,</p>
          <p>Your signup request for <b>LabelNest</b> was rejected.</p>
          <p>You may reapply by visiting our website.</p>
          <p>— LabelNest Team</p>
        `
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: corsHeaders,
      });
    }

    /* ---------------- APPROVE ---------------- */

    // ✅ Idempotency guard
    const { data } = await supabaseAdmin
      .from("nr_signup_requests")
      .select("nr_status")
      .eq("nr_id", signupRequestId)
      .single();

    if (data.nr_status === "APPROVED") {
      return new Response(JSON.stringify({ success: true }), {
        headers: corsHeaders,
      });
    }

    // ✅ Create auth user (no password)
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (error && !error.message.includes("already")) {
      throw error;
    }

    // ✅ Update DB
    await supabaseAdmin
      .from("nr_signup_requests")
      .update({ nr_status: "APPROVED" })
      .eq("nr_id", signupRequestId);

    await supabaseAdmin.from("nr_signup_audit").insert({
      nr_email: email,
      nr_action: "APPROVED",
    });

    // ✅ BREVO NOTIFICATION ONLY (NO PASSWORD LINK)
    await sendBrevoEmail(
      email,
      "🎉 Account Approved – LabelNest",
      `
        <p>Hello,</p>

        <p>Your <b>LabelNest</b> account has been approved.</p>

        <p><b>Next steps:</b></p>
        <ol>
          <li>Go to the <b>LabelNest Login page</b></li>
          <li>Click <b>“Forgot Password”</b></li>
          <li>Set your password and login</li>
        </ol>

        <p>— LabelNest Team</p>
      `
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
