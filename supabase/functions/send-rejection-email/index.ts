import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { email, name } = await req.json();

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "LabelNest <no-reply@labelnest.in>",
      to: [email],
      subject: "Signup request rejected",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for your interest in LabelNest.</p>
        <p>Unfortunately, your signup request was not approved at this time.</p>
        <p>If you believe this is a mistake, please contact support.</p>
        <br/>
        <p>— LabelNest Team</p>
      `,
    }),
  });

  return new Response(
    JSON.stringify({ success: res.ok }),
    { headers: { "Content-Type": "application/json" } }
  );
});
