import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const LoginCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        toast.error(error?.message ?? "Invalid credentials");
        return;
      }

      const authUser = data.user;

      const { data: admin } = await supabase
        .from("nr_admins")
        .select("nr_id")
        .eq("nr_email", authUser.email)
        .maybeSingle();

      if (admin) {
        navigate("/admin");
        return;
      }

      const { data: existingUser } = await supabase
        .from("nr_users")
        .select("nr_id")
        .eq("nr_auth_user_id", authUser.id)
        .maybeSingle();

      if (!existingUser) {
        await supabase.from("nr_users").insert({
          nr_auth_user_id: authUser.id,
          nr_email: authUser.email,
          nr_name:
            authUser.user_metadata?.full_name ??
            authUser.email ??
            "User",
          nr_role: "user",
          nr_status: "active",
          nr_tenant_id: null,
        });
      }

      navigate("/resolve");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.warning("Please enter your email first");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent. Check your inbox.");
    }
  };

  return (
    <div className="glass-card p-8 sm:p-10 w-full max-w-md animate-slide-up">
      <form onSubmit={handleLogin} className="space-y-5">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? "LOGGING IN..." : "LOGIN"}
        </Button>
      </form>

      <button onClick={handleForgotPassword}>
        Forgot master credential?
      </button>
    </div>
  );
};

export default LoginCard;
