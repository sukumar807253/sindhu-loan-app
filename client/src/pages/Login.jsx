import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ✅ FIX
  const { login } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ start loading

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.toLowerCase(),
        password,
      });

      const user = res.data.user;

      login(user);

      if (user.isAdmin) {
        navigate("/admin/users");
      } else {
        navigate("/centers");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
      console.error(err);
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-500">
          Welcome Back <span className="text-pink-400">Sindhuja.Fin</span>
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Secure Microfinance Loan Management System
        </p>

        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">
          Login
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-2 rounded-md border-2 border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-2 rounded-md border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-md font-semibold transition
              ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
