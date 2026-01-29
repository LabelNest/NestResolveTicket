import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";


const AuthCallback = () => {
  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        // alert("Authentication failed");
        toast.error("Authentication failed");
        return;
      }

      if (data.session) {
        // ✅ Session established → go to reset password page
        toast.success("Access verified. Please reset your password.");
        window.location.href = "/reset-password";
      } else {
        // alert("No session found");
        toast.error("No session found");
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Verifying access…</p>
    </div>
  );
};

export default AuthCallback;
