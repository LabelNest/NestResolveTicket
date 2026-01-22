import { supabase } from "@/lib/supabaseClient";


export const resolveTenant = async () => {
  const subdomain = window.location.hostname.split(".")[0];

  const { data } = await supabase
    .from("nr_tenants")
    .select("*")
    .eq("nr_domain", subdomain)
    .single();

  return data;
};
