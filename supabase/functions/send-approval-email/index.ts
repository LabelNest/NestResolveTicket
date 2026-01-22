import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { email, name } = await req.json();

    if (!email || !name) {
      return new Response("Missing email or name", { status: 400 });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response("RESEND_API_KEY not set", { status: 500 });
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Admin <no-reply@yourcompany.com>",
        to: email,
        subject: "Your account has been approved",
        html: `
          <p>Hi ${name},</p>
          <p>Your account has been <strong>approved</strong>.</p>
          <p>You can now log in.</p>
        `,
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});
