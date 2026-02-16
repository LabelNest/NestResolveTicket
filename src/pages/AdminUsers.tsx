
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, X } from "lucide-react";


type User = {
  nr_id: string;
  nr_name: string;
  nr_email: string;
  nr_role: string;
  nr_status: string;
  nr_created_at: string;
};


const AdminUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");

  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    init();
  }, []);

 
  const init = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return navigate("/");

    const { data: admin } = await supabase
      .from("nr_admins_list")
      .select("nr_email")
      .eq("nr_email", data.session.user.email)
      .maybeSingle();

    if (!admin) return navigate("/");

    await loadUsers();
  };


  const loadUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("nr_users")
      .select("*")
      .order("nr_created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    setUsers(data || []);
    setLoading(false);
  };

  
  const toggleStatus = async (user: User) => {
    setUpdating(true);

    const newStatus = user.nr_status === "active" ? "inactive" : "active";

    const { error } = await supabase
      .from("nr_users")
      .update({ nr_status: newStatus })
      .eq("nr_id", user.nr_id);

    if (error) {
      toast.error("Failed to update status");
      setUpdating(false);
      return;
    }

    toast.success(`User marked as ${newStatus}`);

    setUsers(prev =>
      prev.map(u =>
        u.nr_id === user.nr_id ? { ...u, nr_status: newStatus } : u
      )
    );

    setUpdating(false);
  };

 
  const filteredUsers = users.filter(user => {
    if (filter === "all") return true;
    return user.nr_status === filter;
  });

 
  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-semibold">Users Management</h1>

     
      <div className="flex gap-3">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          variant={filter === "inactive" ? "default" : "outline"}
          onClick={() => setFilter("inactive")}
        >
          Inactive
        </Button>
      </div>

     
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.nr_id} className="border-t border-white/10">
                <td className="p-4 font-medium">{user.nr_name}</td>
                <td className="p-4">{user.nr_email}</td>
                <td className="p-4 capitalize">{user.nr_role}</td>

                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.nr_status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {user.nr_status}
                  </span>
                </td>

                <td className="p-4">
                  {new Date(user.nr_created_at).toLocaleDateString()}
                </td>

                <td className="p-4 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating}
                    onClick={() => toggleStatus(user)}
                  >
                    {user.nr_status === "active"
                      ? "Deactivate"
                      : "Activate"}
                  </Button>
                </td>
              </tr>
            ))}

            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
