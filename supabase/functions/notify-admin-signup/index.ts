import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function adminSignupTemplate(name: string, email: string) {
  return `
  <div style="font-family:Arial;padding:40px;background:#f4f6f8">
    <div style="max-width:520px;margin:auto;background:white;padding:30px;border-radius:8px">
      <h2>🔔 New Signup Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p>Please review and approve in Admin Panel.</p>
    </div>
  </div>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email } = await req.json();

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "LabelNest",
          email: "contact@labelnest.in",
        },
        to: [{ email: "ankit@labelnest.in" }], // 🔥 change to your admin email
        subject: "🔔 New Signup Waiting Approval",
        htmlContent: adminSignupTemplate(name, email),
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send admin notification");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});