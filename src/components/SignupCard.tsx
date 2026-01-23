// import { useState } from "react";
// import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Link } from "react-router-dom";

// const SignupCard = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle signup logic here
//     console.log("Signup attempt with:", { name, email });
//   };

//   return (
//     <div className="glass-card p-8 sm:p-10 w-full max-w-md animate-slide-up">
//       {/* Header */}
//       <div className="text-center mb-8">
//         <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-2">
//           Register.
//         </h2>
//         <p className="text-muted-foreground text-sm">
//           Claim your access credentials.
//         </p>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="space-y-5">
//         {/* Name Field */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//             Full Name
//           </label>
//           <div className="relative">
//             <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//             <Input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="John Doe"
//               className="input-dark pl-11 h-12 rounded-xl text-foreground placeholder:text-muted-foreground w-full"
//               required
//             />
//           </div>
//         </div>

//         {/* Email Field */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//             Email Address
//           </label>
//           <div className="relative">
//             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//             <Input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="you@company.com"
//               className="input-dark pl-11 h-12 rounded-xl text-foreground placeholder:text-muted-foreground w-full"
//               required
//             />
//           </div>
//         </div>

//         {/* Password Field */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//             Master Credential
//           </label>
//           <div className="relative">
//             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//             <Input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Create a password"
//               className="input-dark pl-11 pr-11 h-12 rounded-xl text-foreground placeholder:text-muted-foreground w-full"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//             >
//               {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//             </button>
//           </div>
//         </div>

//         {/* Confirm Password Field */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//             Confirm Credential
//           </label>
//           <div className="relative">
//             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//             <Input
//               type={showConfirmPassword ? "text" : "password"}
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="Confirm your password"
//               className="input-dark pl-11 pr-11 h-12 rounded-xl text-foreground placeholder:text-muted-foreground w-full"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//             >
//               {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//             </button>
//           </div>
//         </div>

//         {/* Signup Button */}
//         <Button
//           type="submit"
//           className="w-full btn-gradient text-primary-foreground font-semibold text-sm tracking-wide btn-primary-glow mt-6 hover:opacity-90"
//         >
//           CREATE ACCOUNT
//         </Button>
//       </form>

//       {/* Links */}
//       <div className="flex items-center justify-center gap-1 mt-8 text-sm">
//         <span className="text-muted-foreground">Already have an account?</span>
//         <Link
//           to="/"
//           className="text-primary hover:text-primary/80 transition-colors font-medium"
//         >
//           Login here
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default SignupCard;
// import { useState } from "react";
// import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Link } from "react-router-dom";

// import { supabase } from "@/lib/supabaseClient";

// import { resolveTenant } from "@/lib/tenant";

// const SignupCard = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     try {
//       setLoading(true);

//       // 1️⃣ Try resolving tenant (OPTIONAL)
//       let tenantId: string | null = null;

//       try {
//         const tenant = await resolveTenant();
//         tenantId = tenant?.nr_id ?? null;
//       } catch {
//         // Ignore tenant resolution failure
//         tenantId = null;
//       }

//       // 2️⃣ Insert signup request (NO AUTH CREATION)
//       const { error } = await supabase
//         .from("nr_signup_requests")
//         .insert({
//           nr_tenant_id: tenantId, // SAFE: nullable
//           nr_name: name,
//           nr_email: email,
//           nr_role: "user",
//           nr_status: "PENDING",
//         });

//       if (error) {
//         console.error(error);
//         alert(error.message);
//         return;
//       }

//       alert(
//         "Signup request submitted successfully. An admin will review and notify you by email."
//       );

//       // Reset form
//       setName("");
//       setEmail("");
//       setPassword("");
//       setConfirmPassword("");
//     } catch (err: any) {
//       alert(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="glass-card p-8 sm:p-10 w-full max-w-md animate-slide-up">
//       <div className="text-center mb-8">
//         <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-2">
//           Register.
//         </h2>
//         <p className="text-muted-foreground text-sm">
//           Claim your access credentials.
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-5">
//         {/* Name */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//             Full Name
//           </label>
//           <div className="relative">
//             <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//             <Input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="input-dark pl-11 h-12 rounded-xl"
//               required
//             />
//           </div>
//         </div>

//         {/* Email */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//             Email Address
//           </label>
//           <div className="relative">
//             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//             <Input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="input-dark pl-11 h-12 rounded-xl"
//               required
//             />
//           </div>
//         </div>

//         {/* Password */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//             Master Credential
//           </label>
//           <div className="relative">
//             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
//             <Input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="input-dark pl-11 pr-11 h-12 rounded-xl"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-4 top-1/2 -translate-y-1/2"
//             >
//               {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//             </button>
//           </div>
//         </div>

//         {/* Confirm Password */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
//             Confirm Credential
//           </label>
//           <div className="relative">
//             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
//             <Input
//               type={showConfirmPassword ? "text" : "password"}
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className="input-dark pl-11 pr-11 h-12 rounded-xl"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//               className="absolute right-4 top-1/2 -translate-y-1/2"
//             >
//               {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//             </button>
//           </div>
//         </div>

//         <Button
//           type="submit"
//           disabled={loading}
//           className="w-full btn-gradient mt-6"
//         >
//           {loading ? "SUBMITTING..." : "CREATE ACCOUNT"}
//         </Button>
//       </form>

//       <div className="flex justify-center gap-1 mt-8 text-sm">
//         <span className="text-muted-foreground">Already have an account?</span>
//         <Link to="/" className="text-primary font-medium">
//           Login here
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default SignupCard;

// import { useState } from "react";
// import { Mail, User } from "lucide-react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Link } from "react-router-dom";
// import { supabase } from "@/lib/supabaseClient";

// const SignupCard = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       /* ---------------------------
//          1️⃣ CHECK AUTH USERS
//          --------------------------- */
//       const { data: authUser } = await supabase
//         .from("auth.users")
//         .select("id")
//         .eq("email", email)
//         .maybeSingle();

//       if (authUser) {
//         alert("Account already exists. Please login.");
//         return;
//       }

//       /* ---------------------------
//          2️⃣ CHECK SIGNUP REQUESTS
//          --------------------------- */
//       const { data: requests } = await supabase
//         .from("nr_signup_requests")
//         .select("nr_status")
//         .eq("nr_email", email);

//       if (requests && requests.length > 0) {
//         const hasPending = requests.some(r => r.nr_status === "PENDING");
//         const hasApproved = requests.some(r => r.nr_status === "APPROVED");

//         if (hasPending) {
//           alert("Signup request already submitted. Please wait for admin approval.");
//           return;
//         }

//         if (hasApproved) {
//           alert("Your account is already approved. Please login.");
//           return;
//         }

//         // ❗ If only REJECTED → allow (do nothing here)
//       }

//       /* ---------------------------
//          3️⃣ INSERT NEW REQUEST
//          --------------------------- */
//       const { error } = await supabase
//         .from("nr_signup_requests")
//         .insert({
//           nr_name: name,
//           nr_email: email,
//           nr_status: "PENDING",
//         });

//       if (error) throw error;

//       alert(
//         "Signup request submitted successfully. Please wait for admin approval."
//       );

//       setName("");
//       setEmail("");
//     } catch (err: any) {
//       alert(err.message || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="glass-card p-8 sm:p-10 w-full max-w-md animate-slide-up">
//       <div className="text-center mb-8">
//         <h2 className="font-serif text-3xl sm:text-4xl font-semibold">
//           Register.
//         </h2>
//         <p className="text-muted-foreground text-sm">
//           Claim your access credentials.
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-5">
//         {/* Name */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium uppercase tracking-wide">
//             Full Name
//           </label>
//           <div className="relative">
//             <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
//             <Input
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="input-dark pl-11 h-12"
//               required
//             />
//           </div>
//         </div>

//         {/* Email */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium uppercase tracking-wide">
//             Email Address
//           </label>
//           <div className="relative">
//             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
//             <Input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="input-dark pl-11 h-12"
//               required
//             />
//           </div>
//         </div>

//         <Button disabled={loading} className="w-full btn-gradient mt-6">
//           {loading ? "SUBMITTING..." : "REQUEST ACCESS"}
//         </Button>
//       </form>

//       <div className="flex justify-center gap-1 mt-8 text-sm">
//         <span className="text-muted-foreground">Already have an account?</span>
//         <Link to="/" className="text-primary font-medium">
//           Login here
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default SignupCard;

import { useState } from "react";
import { Mail, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const SignupCard = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* ------------------------------------
         1️⃣ CHECK USER STATUS (EDGE FUNCTION)
         ------------------------------------ */
      const { data, error } = await supabase.functions.invoke(
        "check-user-exists",
        { body: { email } }
      );

      if (error) throw error;

      switch (data.status) {
        case "AUTH_EXISTS":
          alert("Account already exists. Please login.");
          return;

        case "PENDING":
          alert("Signup request already submitted. Please wait for admin approval.");
          return;

        case "APPROVED":
          alert("Your account is already approved. Please login.");
          return;

        case "NEW":
          break; // ✅ allow signup
      }

      /* ------------------------------------
         2️⃣ INSERT SIGNUP REQUEST
         ------------------------------------ */
      const { error: insertError } = await supabase
        .from("nr_signup_requests")
        .insert({
          nr_name: name,
          nr_email: email,
          nr_status: "PENDING",
        });

      if (insertError) throw insertError;

      alert("Signup request submitted successfully. Please wait for admin approval.");

      setName("");
      setEmail("");
    } catch (err: any) {
      alert(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI (UNCHANGED) ================= */
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
        {/* Name */}
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

        {/* Email */}
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
        <span className="text-muted-foreground">Already have an account?</span>
        <Link to="/" className="text-primary font-medium">
          Login here
        </Link>
      </div>
    </div>
  );
};

export default SignupCard;


