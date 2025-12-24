import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  // ✅ Vite environment variable
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
      });

      if (res.status === 200 || res.status === 201) {
        alert("Signup successful! Please login.");
        navigate("/"); // Redirect to login
      }
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">
          Signup
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            className="w-full px-4 py-2 rounded-md border-2 border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-600"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-md border-2 border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-600"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-600"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition"
          >
            Signup
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
