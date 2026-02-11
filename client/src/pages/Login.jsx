import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ Safe API base
  const API_URL =
    import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.toLowerCase().trim(),
        password,
      });

      const user = res.data?.user;
      if (!user) throw new Error("Invalid response");

      login(user);
      navigate(user.isAdmin ? "/admin/users" : "/centers");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "❌ Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center text-indigo-600">
          Sindhuja<span className="text-green-500">.Fin</span>
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Secure Loan Management System
        </p>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="w-full px-4 py-2 rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="w-full px-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all
              ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg"
              }`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
            disabled={loading}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
