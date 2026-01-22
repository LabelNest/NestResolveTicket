// import Navbar from "@/components/Navbar";
// import HeroSection from "@/components/HeroSection";
// import LoginCard from "@/components/LoginCard";

// const Index = () => {
//   return (
//     <div className="min-h-screen relative overflow-hidden">
//       {/* Background Decorative Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         {/* Gradient Orbs */}
//         <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
//         <div className="absolute -bottom-20 right-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl"></div>
        
//         {/* Grid Pattern */}
//         <div 
//           className="absolute inset-0 opacity-[0.02]"
//           style={{
//             backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
//                               linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
//             backgroundSize: '60px 60px'
//           }}
//         ></div>
//       </div>

//       {/* Navbar */}
//       <Navbar />

//       {/* Main Content */}
//       <main className="relative z-10 min-h-screen flex items-center px-6 lg:px-12 pt-20">
//         <div className="max-w-7xl mx-auto w-full">
//           <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
//             {/* Left Side - Hero */}
//             <div className="order-2 lg:order-1">
//               <HeroSection />
//             </div>

//             {/* Right Side - Login Card */}
//             <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
//               <LoginCard />
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer Note */}
//       <footer className="absolute bottom-0 left-0 right-0 py-6 px-6 lg:px-12">
//         <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
//           <p>© 2026 Intelligence Refinery. All rights reserved.</p>
//           <div className="flex items-center gap-6">
//             <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
//             <a href="#" className="hover:text-foreground transition-colors">Terms</a>
//             <a href="#" className="hover:text-foreground transition-colors">Security</a>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Index;

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LoginCard from "@/components/LoginCard";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />

      <main className="relative z-10 min-h-screen flex items-center px-6 lg:px-12 pt-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <HeroSection />
            </div>

            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <LoginCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
