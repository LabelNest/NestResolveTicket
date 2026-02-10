import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { supabase } from "../lib/supabaseClient";


import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import RaiseTicket from "./pages/RaiseTicket";
import NotFound from "./pages/NotFound";


import AdminLayout from "./components/AdminLayout";
import AdminApprovals from "./pages/AdminApprovals";
import AdminSignupAnalytics from "./pages/AdminSignupAnalytics";
import AdminTickets from "./pages/AdminTickets";
import AdminAudit from "./pages/AdminAudit";
import AdminTenants from "./pages/AdminTenants";

import ResolveApp from "./raiseticket/App";




const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AUTH EVENT:", event);
      console.log("SESSION:", session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/raise-ticket" element={<RaiseTicket />} />

            
            <Route path="/admin" element={<AdminLayout />}>
             
              <Route index element={<AdminApprovals />} />

             
              <Route path="approvals" element={<AdminApprovals />} />
              <Route path="signup-analytics" element={<AdminSignupAnalytics />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="audit" element={<AdminAudit />} />
              <Route path="admin-tenants" element={<AdminTenants />} />
            </Route>
            <Route path="/resolve" element={<ResolveApp />} />

            <Route path="/resolve" element={<ResolveApp />} />
             




            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;









