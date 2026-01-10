import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Centers() {
  const [centers, setCenters] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loading state
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const capitalize = (str = "") =>
    str.charAt(0).toUpperCase() + str.slice(1);

  // Fetch centers
  useEffect(() => {
    fetch(`${API_URL}/api/centers`)
      .then(res => res.json())
      .then(data => setCenters(data))
      .catch(() => setError("Failed to load centers"));
  }, [API_URL]);

  // Add Center
  const addCenter = async () => {
    if (!name.trim()) return;
    const formattedName = capitalize(name.trim());

    const exists = centers.some(
      c => c.name.toLowerCase() === formattedName.toLowerCase()
    );

    if (exists) {
      setError("Center name already exists");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/centers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formattedName }),
      });

      if (res.status === 409) {
        setError("Center name already exists");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setCenters(prev => [...prev, data]);
      setName("");
      setError("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Select center
  const selectCenter = (center) => {
    localStorage.setItem(
      "center",
      JSON.stringify({
        id: Number(center.id),
        name: center.name
      })
    );
    navigate("/members");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Centers</h2>

        {error && (
          <div className="mb-4 p-3 text-center rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <div className="flex mb-6">
          <input
            placeholder="New Center"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setError("");
            }}
            className="flex-1 p-3 border rounded-l-lg"
          />
          <button
            onClick={addCenter}
            disabled={loading} // ✅ disable while loading
            className={`px-4 rounded-r-lg text-white flex items-center justify-center gap-2
              ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}
            `}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Adding...
              </>
            ) : (
              "Add"
            )}
          </button>
        </div>

        <ul className="space-y-3">
          {centers.map(c => (
            <li
              key={c.id}
              className="flex justify-between items-center p-3 border rounded"
            >
              <span className="font-medium">{capitalize(c.name)}</span>

              <button
                onClick={() => selectCenter(c)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
