import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ Vite environment variable with fallback
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.toLowerCase(),
        password,
      });

      const user = res.data.user;

      // ✅ Save user in context
      login(user);

      // ✅ Role-based redirect
      if (user.isAdmin) {
        navigate("/admin/users");
      } else {
        navigate("/centers");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
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
            className="w-full px-4 py-2 rounded-md border-2 border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-600"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-600"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition"
          >
            Login
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
