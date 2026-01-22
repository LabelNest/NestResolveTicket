// // import { useState } from "react";
// // import { Eye, EyeOff, Mail, Lock } from "lucide-react";
// // import { Button } from "./ui/button";
// // import { Input } from "./ui/input";
// // import { Link } from "react-router-dom";

// // const LoginCard = () => {
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");

// //   const handleSubmit = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     // Handle login logic here
// //     console.log("Login attempt with:", { email });
// //   };

// //   return (
// //     <div className="glass-card p-8 sm:p-10 w-full max-w-md animate-slide-up">
// //       {/* Header */}
// //       <div className="text-center mb-8">
// //         <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-2">
// //           Authorize.
// //         </h2>
// //         <p className="text-muted-foreground text-sm">
// //           Access the master engine.
// //         </p>
// //       </div>

// //       {/* Form */}
// //       <form onSubmit={handleSubmit} className="space-y-5">
// //         {/* Email Field */}
// //         <div className="space-y-2">
// //           <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
// //             Email Address
// //           </label>
// //           <div className="relative">
// //             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
// //             <Input
// //               type="email"
// //               value={email}
// //               onChange={(e) => setEmail(e.target.value)}
// //               placeholder="you@company.com"
// //               className="input-dark pl-11 h-12 rounded-xl text-foreground placeholder:text-muted-foreground w-full"
// //               required
// //             />
// //           </div>
// //         </div>

// //         {/* Password Field */}
// //         <div className="space-y-2">
// //           <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
// //             Master Credential
// //           </label>
// //           <div className="relative">
// //             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
// //             <Input
// //               type={showPassword ? "text" : "password"}
// //               value={password}
// //               onChange={(e) => setPassword(e.target.value)}
// //               placeholder="Enter your password"
// //               className="input-dark pl-11 pr-11 h-12 rounded-xl text-foreground placeholder:text-muted-foreground w-full"
// //               required
// //             />
// //             <button
// //               type="button"
// //               onClick={() => setShowPassword(!showPassword)}
// //               className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
// //             >
// //               {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
// //             </button>
// //           </div>
// //         </div>

// //         {/* Login Button */}
// //         <Button
// //           type="submit"
// //           className="w-full btn-gradient text-primary-foreground font-semibold text-sm tracking-wide btn-primary-glow mt-6 hover:opacity-90"
// //         >
// //           LOGIN
// //         </Button>
// //       </form>

// //       {/* Links */}
// //       <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 text-sm">
// //         <Link
// //           to="/signup"
// //           className="text-muted-foreground hover:text-primary transition-colors"
// //         >
// //           Need to claim your profile?
// //         </Link>
// //         <span className="hidden sm:inline text-border">|</span>
// //         <a
// //           href="#"
// //           className="text-muted-foreground hover:text-primary transition-colors"
// //         >
// //           Forgot master credential?
// //         </a>
// //       </div>
// //     </div>
// //   );
// // };

// // export default LoginCard;
// import { useState } from "react";
// import { Eye, EyeOff, Mail, Lock } from "lucide-react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Link } from "react-router-dom";
// import { supabase } from "@/lib/supabaseClient";


// const LoginCard = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     setLoading(false);

//     if (error) {
//       alert(error.message);
//       return;
//     }

//     if (data.session) {
//       window.location.href = "/admin/approvals";
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!email) {
//       alert("Please enter your email first");
//       return;
//     }

//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: `${window.location.origin}/reset-password`,
//     });

//     if (error) {
//       alert(error.message);
//     } else {
//       alert("Password reset email sent. Check your inbox.");
//     }
//   };

//   return (
//     <div className="glass-card p-8 sm:p-10 w-full max-w-md animate-slide-up">
//       <div className="text-center mb-8">
//         <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-2">
//           Authorize.
//         </h2>
//         <p className="text-muted-foreground text-sm">
//           Access the master engine.
//         </p>
//       </div>

//       <form onSubmit={handleLogin} className="space-y-5">
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

//         {/* Password */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium uppercase tracking-wide">
//             Master Credential
//           </label>
//           <div className="relative">
//             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
//             <Input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="input-dark pl-11 pr-11 h-12"
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

//         <Button type="submit" disabled={loading} className="w-full btn-gradient mt-6">
//           {loading ? "LOGGING IN..." : "LOGIN"}
//         </Button>
//       </form>

//       <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 text-sm">
//         <Link to="/signup" className="text-muted-foreground hover:text-primary">
//           Need to claim your profile?
//         </Link>
//         <span className="hidden sm:inline">|</span>
//         <button
//           type="button"
//           onClick={handleForgotPassword}
//           className="text-muted-foreground hover:text-primary"
//         >
//           Forgot master credential?
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LoginCard;
// import { useState } from "react";
// import { Eye, EyeOff, Mail, Lock } from "lucide-react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Link } from "react-router-dom";
// import { supabase } from "@/lib/supabaseClient";

// const LoginCard = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // 1️⃣ Supabase Auth login (THIS MUST PASS FIRST)
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         alert(error.message);
//         return;
//       }

//       if (!data.session) {
//         alert("Login failed. No session created.");
//         return;
//       }

//       // 2️⃣ Check if user is admin (FIXED COLUMN NAME)
//       const { data: admin, error: adminError } = await supabase
//         .from("nr_admins")
//         .select("nr_id")
//         .eq("nr_email", email)
//         .maybeSingle();

//       if (adminError) {
//         console.error(adminError);
//         alert("Admin check failed");
//         return;
//       }

//       // 3️⃣ Redirect based on role
//       if (admin) {
//         window.location.href = "/admin/approvals";
//       } else {
//         window.location.href = "/dashboard";
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!email) {
//       alert("Please enter your email first");
//       return;
//     }

//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: `${window.location.origin}/reset-password`,
//     });

//     if (error) {
//       alert(error.message);
//     } else {
//       alert("Password reset email sent. Check your inbox.");
//     }
//   };

//   return (
//     <div className="glass-card p-8 sm:p-10 w-full max-w-md animate-slide-up">
//       <div className="text-center mb-8">
//         <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-2">
//           Authorize.
//         </h2>
//         <p className="text-muted-foreground text-sm">
//           Access the master engine.
//         </p>
//       </div>

//       <form onSubmit={handleLogin} className="space-y-5">
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

//         {/* Password */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium uppercase tracking-wide">
//             Master Credential
//           </label>
//           <div className="relative">
//             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
//             <Input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="input-dark pl-11 pr-11 h-12"
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

//         <Button
//           type="submit"
//           disabled={loading}
//           className="w-full btn-gradient mt-6"
//         >
//           {loading ? "LOGGING IN..." : "LOGIN"}
//         </Button>
//       </form>

//       <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 text-sm">
//         <Link to="/signup" className="text-muted-foreground hover:text-primary">
//           Need to claim your profile?
//         </Link>
//         <span className="hidden sm:inline">|</span>
//         <button
//           type="button"
//           onClick={handleForgotPassword}
//           className="text-muted-foreground hover:text-primary"
//         >
//           Forgot master credential?
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LoginCard;

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const LoginCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOGIN ================= */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* 1️⃣ AUTH LOGIN */
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        alert(error?.message ?? "Invalid credentials");
        return;
      }

      const authUser = data.user;

      /* 2️⃣ ADMIN CHECK */
      const { data: admin, error: adminError } = await supabase
        .from("nr_admins")
        .select("nr_id")
        .eq("nr_email", authUser.email)
        .maybeSingle();

      if (adminError) {
        console.error(adminError);
        alert("Admin check failed");
        return;
      }

      if (admin) {
        window.location.href = "/admin/approvals";
        return;
      }

      /* 3️⃣ ENSURE USER PROFILE EXISTS */
      const { data: existingUser, error: userCheckError } = await supabase
        .from("nr_users")
        .select("nr_id")
        .eq("nr_auth_user_id", authUser.id)
        .maybeSingle();

      if (userCheckError) {
        console.error(userCheckError);
        alert("User lookup failed");
        return;
      }

      if (!existingUser) {
        const { error: insertError } = await supabase
          .from("nr_users")
          .insert({
            nr_auth_user_id: authUser.id,
            nr_email: authUser.email,
            nr_name:
              authUser.user_metadata?.full_name ??
              authUser.email ??
              "User",
            nr_role: "user",
            nr_status: "active",
            nr_tenant_id: null, // IMPORTANT: must be nullable in DB
          });

        if (insertError) {
          console.error(insertError);
          alert("Failed to create user profile");
          return;
        }
      }

      /* 4️⃣ REDIRECT USER */
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  };

  /* ================= FORGOT PASSWORD ================= */
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:8080/reset-password",
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password reset email sent. Check your inbox.");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="glass-card p-8 sm:p-10 w-full max-w-md animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-2">
          Authorize.
        </h2>
        <p className="text-muted-foreground text-sm">
          Access the master engine.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
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

        {/* Password */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide">
            Master Credential
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark pl-11 pr-11 h-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full btn-gradient mt-6"
        >
          {loading ? "LOGGING IN..." : "LOGIN"}
        </Button>
      </form>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 text-sm">
        <Link to="/signup" className="text-muted-foreground hover:text-primary">
          Need to claim your profile?
        </Link>
        <span className="hidden sm:inline">|</span>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-muted-foreground hover:text-primary"
        >
          Forgot master credential?
        </button>
      </div>
    </div>
  );
};

export default LoginCard;
