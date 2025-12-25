import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Members() {
  const navigate = useNavigate();
  const center = JSON.parse(localStorage.getItem("center"));

  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  /* ================= REDIRECT ================= */
  useEffect(() => {
    if (!center?.id) navigate("/centers");
  }, [center, navigate]);

  /* ================= FETCH MEMBERS ================= */
  useEffect(() => {
    if (!center?.id) return;

    const fetchData = async () => {
      try {
        const membersRes = await fetch(`${API_URL}/api/members/${center.id}`);
        const loansRes = await fetch(`${API_URL}/api/loans`);

        const membersData = await membersRes.json();
        const loansData = await loansRes.json();

        const submittedIds = new Set(loansData.map(l => Number(l.memberid)));

        setMembers(
          membersData.map(m => ({
            ...m,
            id: Number(m.id),
            loanSubmitted: submittedIds.has(Number(m.id)),
          }))
        );
      } catch {
        setError("Failed to load members");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [center, API_URL]);

  /* ================= CAPITALIZE ================= */
  const capitalizeName = (str) =>
    str
      .trim()
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  /* ================= INPUT CHANGE ================= */
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    const formatted = capitalizeName(value);

    const exists = members.some(
      m => capitalizeName(m.name) === formatted
    );

    if (exists) {
      setNameError("Member name already exists");
    } else {
      setNameError("");
    }
  };

  /* ================= ADD MEMBER ================= */
  const addMember = async () => {
    if (!name.trim() || nameError) return;

    const formattedName = capitalizeName(name);

    try {
      const res = await fetch(`${API_URL}/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formattedName,
          centerId: Number(center.id),
        }),
      });

      const data = await res.json();
      if (!res.ok) return;

      setMembers(prev => [
        ...prev,
        { ...data, id: Number(data.id), loanSubmitted: false },
      ]);

      setName("");
      setNameError("");
    } catch {
      console.error("Server error");
    }
  };

  /* ================= SELECT ================= */
  const selectMember = (member) => {
    localStorage.setItem("member", JSON.stringify(member));
    navigate("/loan-application");
  };

  /* ================= UI ================= */
  if (loading) return <p className="text-center mt-10">Loading members...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow rounded-lg p-4 relative">

        <button
          onClick={() => navigate("/centers")}
          className="absolute top-4 left-4 bg-gray-300 px-3 py-1 rounded"
        >
          Back
        </button><br /><br />

        <h2 className="text-2xl font-bold mb-6 text-center">
          Members – {center.name}
        </h2>

        {/* ADD MEMBER */}
        <div className="mb-2">
          <div className="flex">
            <input
              value={name}
              onChange={handleNameChange}
              placeholder="New Member Name"
              className={`flex-1 p-3 border rounded-l-lg ${
                nameError ? "border-red-500" : ""
              }`}
            />
            <button
              onClick={addMember}
              disabled={!name.trim() || !!nameError}
              className={`px-4 rounded-r-lg text-white ${
                nameError
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Add
            </button>
          </div>

          {nameError && (
            <p className="text-red-500 text-sm mt-1">{nameError}</p>
          )}
        </div>

        {/* MEMBERS LIST */}
        <ul className="space-y-3 mt-6">
          {members.map(member => (
            <li
              key={member.id}
              className="flex justify-between items-center p-3 border rounded"
            >
              <span className={member.loanSubmitted ? "text-green-600" : ""}>
                {capitalizeName(member.name)}
              </span>

              <button
                disabled={member.loanSubmitted}
                onClick={() => selectMember(member)}
                className={`px-3 py-1 rounded text-white ${
                  member.loanSubmitted
                    ? "bg-gray-400"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                Loan
              </button>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
