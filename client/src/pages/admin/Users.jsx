import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loanCounts, setLoanCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH LOAN COUNTS ================= */
  const fetchLoanCounts = async () => {
    try {
      const counts = {};
      await Promise.all(
        users.map(async (user) => {
          const res = await axios.get(
            `${API_URL}/api/users/${user.id}/loans`
          );
          counts[user.id] = res.data.filter(
            (loan) => loan.status === "PENDING"
          ).length;
        })
      );
      setLoanCounts(counts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      fetchLoanCounts();
      const interval = setInterval(fetchLoanCounts, 10000);
      return () => clearInterval(interval);
    }
  }, [users]);

  /* ================= DELETE USER ================= */
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API_URL}/api/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert("User deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  /* ================= BLOCK / UNBLOCK ================= */
  const handleBlock = async (userId, blocked) => {
    try {
      await axios.patch(`${API_URL}/api/users/${userId}`, {
        blocked: !blocked,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, blocked: !blocked } : u
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading users...</p>;

  if (error)
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">{error}</p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
          Sindhuja.fin – Admin Users
        </h2>
        <p className="text-center text-gray-500 mt-2">
          Manage users, loans & access control
        </p>
      </div>

      {/* Users */}
      <div className="max-w-5xl mx-auto space-y-4">
        {users.length === 0 ? (
          <p className="text-center text-gray-500">No users found.</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-lg transition"
            >
              {/* User Info */}
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {user.name}
                </p>
                <p className="text-sm text-gray-500">ID: {user.id}</p>

                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${user.blocked
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                    }`}
                >
                  {user.blocked ? "Blocked" : "Active"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {loanCounts[user.id] > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full font-semibold text-sm">
                    {loanCounts[user.id]} Pending Loan
                    {loanCounts[user.id] > 1 && "s"}
                  </span>
                )}
               

                <button
                  onClick={() => handleBlock(user.id, user.blocked)}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${user.blocked
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                >
                  {user.blocked ? "Unblock" : "Block"}
                </button>

                <button
                  onClick={() => navigate(`/admin/users/${user.id}/loans`)}
                  disabled={user.blocked}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${user.blocked
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  View Loans
                </button>



              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
