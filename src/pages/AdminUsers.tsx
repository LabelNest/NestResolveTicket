import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, X } from "lucide-react";

/* ================= TYPES ================= */
type User = {
  nr_id: string;
  nr_name: string;
  nr_email: string;
  nr_role: string;
  nr_status: string;
  nr_created_at: string;
};

/* ================= COMPONENT ================= */
const AdminUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    init();
  }, []);

  /* ================= INIT ================= */
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

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("nr_users")
      .select("*")
      .eq("nr_status", "active")
      .order("nr_created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load users");
      console.error(error);
      setLoading(false);
      return;
    }

    setUsers(data || []);
    setLoading(false);
  };

  /* ================= DELETE USER (SOFT DELETE) ================= */
  const deleteUser = async () => {
    if (!confirmUser) return;

    setDeleting(true);

    const { error, data } = await supabase
      .from("nr_users")
      .update({ nr_status: "inactive" })
      .eq("nr_id", confirmUser.nr_id)
      .select("nr_id"); // ✅ ENSURES ROW WAS REALLY UPDATED

    if (error || !data || data.length === 0) {
      toast.error("Failed to remove user from database");
      console.error(error);
      setDeleting(false);
      return;
    }

    // ✅ UPDATE UI IMMEDIATELY
    setUsers(prev =>
      prev.filter(u => u.nr_id !== confirmUser.nr_id)
    );

    toast.success("User removed successfully");

    setConfirmUser(null);
    setDeleting(false);
  };

  /* ================= UI ================= */
  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-semibold">Users Management</h1>

      {/* USERS TABLE */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr
                key={user.nr_id}
                className="border-t border-white/10"
              >
                <td className="p-4 font-medium">
                  {user.nr_name}
                </td>
                <td className="p-4">{user.nr_email}</td>
                <td className="p-4 capitalize">{user.nr_role}</td>
                <td className="p-4">
                  {new Date(user.nr_created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-center">
                  <Button
                    variant="ghost"
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => setConfirmUser(user)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}

            {!loading && users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-muted-foreground"
                >
                  No active users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= CONFIRM MODAL ================= */}
      {confirmUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] rounded-xl w-[380px] p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Remove User
              </h2>
              <button
                onClick={() => setConfirmUser(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-300">
              Are you sure you want to remove
              <span className="font-medium text-white">
                {" "}
                {confirmUser.nr_email}
              </span>
              ?
            </p>

            <p className="text-xs text-gray-400 mt-2">
              This will disable the user’s access immediately.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setConfirmUser(null)}
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
                onClick={deleteUser}
              >
                {deleting ? "Removing..." : "Remove User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
