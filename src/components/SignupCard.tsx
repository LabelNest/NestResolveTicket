import { useState } from "react";
import { Mail, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const SignupCard = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      const { data: admin } = await supabase
        .from("nr_admins")
        .select("nr_id")
        .eq("nr_email", email)
        .maybeSingle();

      if (admin) {
        toast.info("Account already exists. Please login.");
        return;
      }

      const { error: authProbeError } =
        await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false },
        });

      if (!authProbeError) {
        toast.info("Account already exists. Please login.");
        return;
      }


      const { data: existingUser, error: userError } = await supabase
        .from("nr_users")
        .select("nr_id")
        .eq("nr_email", email)
        .maybeSingle();

      if (userError) throw userError;

      if (existingUser) {
        toast.info("Account already exists. Please login.");
        return;
      }


      const { data: requests, error: reqError } = await supabase
        .from("nr_signup_requests")
        .select("nr_status")
        .eq("nr_email", email);

      if (reqError) throw reqError;

      if (requests && requests.length > 0) {
        const hasPending = requests.some(
          (r) => r.nr_status === "PENDING"
        );
        const hasApproved = requests.some(
          (r) => r.nr_status === "APPROVED"
        );

        if (hasPending) {
          toast.warning(
            "Signup request already submitted. Please wait for admin approval."
          );
          return;
        }

        if (hasApproved) {
          toast.success(
            "Your account is already approved. Please login."
          );
          return;
        }

        
      }


      const { error: insertError } = await supabase
        .from("nr_signup_requests")
        .insert({
          nr_name: name,
          nr_email: email,
          nr_status: "PENDING",
        });

      if (insertError) throw insertError;


      await fetch(
        "https://evugaodpzepyjonlrptn.supabase.co/functions/v1/notify-admin-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
          }),
        }
      );

      toast.success(
        "Signup request submitted successfully. Please wait for admin approval."
      );

      setName("");
      setEmail("");

    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="glass-card p-8 sm:p-10 w-full max-w-md animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold">
          Register.
        </h2>
        <p className="text-muted-foreground text-sm">
          Claim your access credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-dark pl-11 h-12"
              required
            />
          </div>
        </div>

       
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark pl-11 h-12"
              required
            />
          </div>
        </div>

        <Button disabled={loading} className="w-full btn-gradient mt-6">
          {loading ? "SUBMITTING..." : "REQUEST ACCESS"}
        </Button>
      </form>

      <div className="flex justify-center gap-1 mt-8 text-sm">
        <span className="text-muted-foreground">
          Already have an account?
        </span>
        <Link to="/" className="text-primary font-medium">
          Login here
        </Link>
      </div>
    </div>
  );
};

export default SignupCard;
