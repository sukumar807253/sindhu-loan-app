import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      return setError("All fields are required");
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/signup`, {
        name: form.name.trim(),
        email: form.email.toLowerCase(),
        password: form.password,
      });

      setSuccess("Signup successful! Redirecting to login...");

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">
          Create Account
        </h2>

        {success && (
          <div className="mb-4 text-green-700 bg-green-100 border border-green-300 px-4 py-2 rounded-md text-center">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 text-red-700 bg-red-100 border border-red-300 px-4 py-2 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full px-4 py-2 rounded-md border-2 border-purple-400 focus:ring-2 focus:ring-purple-400 outline-none"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full px-4 py-2 rounded-md border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full px-4 py-2 rounded-md border-2 border-green-400 focus:ring-2 focus:ring-green-400 outline-none"
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
                Creating account...
              </>
            ) : (
              "Signup"
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
