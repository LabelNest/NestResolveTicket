import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { auth_user_id } = await req.json();

  if (!auth_user_id) {
    return new Response("Missing auth_user_id", { status: 400 });
  }

  // 1️⃣ Delete from nr_users
  await supabaseAdmin
    .from("nr_users")
    .delete()
    .eq("nr_auth_user_id", auth_user_id);

  // 2️⃣ Delete from auth.users
  const { error } =
    await supabaseAdmin.auth.admin.deleteUser(auth_user_id);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } }
  );
});
