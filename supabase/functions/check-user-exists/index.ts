// // supabase/functions/check-user-exists/index.ts
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// serve(async (req) => {
//   const { email } = await req.json();

//   const supabaseAdmin = createClient(
//     Deno.env.get("SUPABASE_URL")!,
//     Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
//   );

//   const { data } = await supabaseAdmin.auth.admin.getUserByEmail(email);

//   return new Response(
//     JSON.stringify({ exists: !!data }),
//     { headers: { "Content-Type": "application/json" } }
//   );
// });

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /* ---------- 1️⃣ CHECK AUTH USERS ---------- */
    const { data, error } =
      await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (error) {
      console.error("Auth lookup error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (data?.user) {
      return new Response(
        JSON.stringify({ status: "AUTH_EXISTS" }),
        { status: 200, headers: corsHeaders }
      );
    }

    /* ---------- 2️⃣ CHECK SIGNUP REQUESTS ---------- */
    const { data: requests, error: reqError } = await supabaseAdmin
      .from("nr_signup_requests")
      .select("nr_status")
      .eq("nr_email", email);

    if (reqError) {
      console.error("Request lookup error:", reqError);
      return new Response(
        JSON.stringify({ error: reqError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (requests && requests.length > 0) {
      const hasPending = requests.some(
        (r) => r.nr_status === "PENDING"
      );
      const hasApproved = requests.some(
        (r) => r.nr_status === "APPROVED"
      );

      if (hasPending) {
        return new Response(
          JSON.stringify({ status: "PENDING" }),
          { status: 200, headers: corsHeaders }
        );
      }

      if (hasApproved) {
        return new Response(
          JSON.stringify({ status: "APPROVED" }),
          { status: 200, headers: corsHeaders }
        );
      }
      // only REJECTED → fall through
    }

    /* ---------- 3️⃣ NEW USER ---------- */
    return new Response(
      JSON.stringify({ status: "NEW" }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Function crashed:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
