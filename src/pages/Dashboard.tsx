import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">
          Welcome to LabelNest
        </h1>

        <p className="text-muted-foreground mb-6">
          You are logged in as a user.
        </p>

        <Button onClick={handleLogout} className="btn-gradient">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
