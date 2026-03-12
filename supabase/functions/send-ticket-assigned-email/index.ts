import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/* ================= ENV ================= */

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

if (!BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY missing");
}

/* ================= CORS ================= */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* ================= BREVO EMAIL ================= */

async function sendBrevoEmail(
  to: string,
  subject: string,
  html: string
) {

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "LabelNest Support",
        email: "contact@labelnest.in", // must be verified in Brevo
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const text = await res.text();

  console.log("BREVO RESPONSE:", text);

  if (!res.ok) {
    console.error("BREVO ERROR:", text);
    throw new Error("Failed to send email");
  }

}

/* ================= FUNCTION ================= */

serve(async (req) => {

  /* ===== CORS PREFLIGHT ===== */

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {

    console.log("EMAIL FUNCTION TRIGGERED");

    /* ===== PARSE BODY ===== */

    const body = await req.json();

    const email = body.email;
    const name = body.name;
    const ticketId = body.ticketId;
    const priority = body.priority;

    if (!email || !ticketId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    /* ===== EMAIL TEMPLATE ===== */

    const html = `
      <div style="font-family:Arial;padding:20px">

        <h2>🎫 New Ticket Assigned</h2>

        <p>Hello <b>${name || "User"}</b>,</p>

        <p>You have been assigned a new ticket in <b>NestResolve</b>.</p>

        <p>
          <b>Ticket ID:</b> ${ticketId}<br/>
          <b>Priority:</b> ${priority || "N/A"}
        </p>

        <p>Please login to the dashboard and start resolving it.</p>

        <br/>

        <p>— LabelNest Support Team</p>

      </div>
    `;

    /* ===== SEND EMAIL ===== */

    await sendBrevoEmail(
      email,
      "🎫 Ticket Assigned – NestResolve",
      html
    );

    console.log("EMAIL SENT SUCCESSFULLY");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully"
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );

  } catch (err: any) {

    console.error("EMAIL FUNCTION ERROR:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );

  }

});