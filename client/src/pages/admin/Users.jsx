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
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
      setLoading(false);
    }
  };

  /* ================= FETCH LOAN COUNTS ================= */
  const fetchLoanCounts = async () => {
    try {
      const counts = {};
      await Promise.all(
        users.map(async (user) => {
          const res = await axios.get(`${API_URL}/api/users/${user.id}/loans`);
          counts[user.id] = res.data.filter(loan => loan.status === "PENDING").length;
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
      const interval = setInterval(fetchLoanCounts, 10000); // refresh every 10s
      return () => clearInterval(interval);
    }
  }, [users]);

  /* ================= DELETE USER ================= */
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API_URL}/api/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setLoanCounts(prev => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
      alert("User deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  /* ================= BLOCK/UNBLOCK USER ================= */
  const handleBlock = async (userId, currentlyBlocked) => {
    try {
      await axios.patch(`${API_URL}/api/users/${userId}`, { blocked: !currentlyBlocked });
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, blocked: !currentlyBlocked } : u)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update block status");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading users...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Admin – Users</h2>

      {users.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="flex justify-between items-center p-4 mb-3 border rounded-lg hover:shadow-lg transition"
          >
            <div>
              <p className="font-semibold">
                {user.name} {user.blocked && <span className="text-red-600">(Blocked)</span>}
              </p>
              <p className="text-sm text-gray-500">User ID: {user.id}</p>
            </div>

            <div className="flex items-center gap-3">
              {loanCounts[user.id] > 0 && (
                <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
                  {loanCounts[user.id]} Pending Loan{loanCounts[user.id] > 1 ? "s" : ""}
                </span>
              )}

              <button
                onClick={() => handleBlock(user.id, user.blocked)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  user.blocked
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {user.blocked ? "Unblock" : "Block"}
              </button>

              <button
                onClick={() => navigate(`/admin/users/${user.id}/loans`)}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  user.blocked
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                disabled={user.blocked}
              >
                View Loans
              </button>

              <button
                onClick={() => handleDelete(user.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
