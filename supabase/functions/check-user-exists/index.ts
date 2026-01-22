// supabase/functions/check-user-exists/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { email } = await req.json();

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data } = await supabaseAdmin.auth.admin.getUserByEmail(email);

  return new Response(
    JSON.stringify({ exists: !!data }),
    { headers: { "Content-Type": "application/json" } }
  );
});
