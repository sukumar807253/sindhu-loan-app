import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Members() {
  const navigate = useNavigate();
  const center = JSON.parse(localStorage.getItem("center"));

  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Vite env variable
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  /* ================= REDIRECT IF CENTER MISSING ================= */
  useEffect(() => {
    if (!center?.id) {
      navigate("/centers");
    }
  }, [center, navigate]);

  /* ================= FETCH MEMBERS & LOANS ================= */
  useEffect(() => {
    if (!center?.id) return;

    const fetchMembersAndLoans = async () => {
      try {
        const membersRes = await fetch(`${API_URL}/api/members/${center.id}`);
        const loansRes = await fetch(`${API_URL}/api/loans`);

        const membersData = await membersRes.json();
        const loansData = await loansRes.json();

        const submittedMemberIds = new Set(
          loansData.map((l) => Number(l.memberid))
        );

        const updatedMembers = membersData.map((m) => ({
          ...m,
          id: Number(m.id),
          loanSubmitted: submittedMemberIds.has(Number(m.id)),
        }));

        setMembers(updatedMembers);
      } catch (err) {
        console.error(err);
        setError("Failed to load members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembersAndLoans();
  }, [center, API_URL]);

  /* ================= CAPITALIZE ================= */
  const capitalizeName = (str) =>
    str
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  /* ================= ADD MEMBER ================= */
  const addMember = async () => {
    if (!name.trim() || !center?.id) return;

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

      if (!res.ok) {
        alert(data.error || "Failed to add member");
        return;
      }

      setMembers((prev) => [
        ...prev,
        { ...data, id: Number(data.id), loanSubmitted: false },
      ]);

      setName("");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  /* ================= SELECT MEMBER ================= */
  const selectMember = (member) => {
    localStorage.setItem("member", JSON.stringify(member));
    navigate("/loan-application");
  };

  /* ================= UI ================= */
  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Loading members...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate("/centers")}
          className="absolute top-4 left-4 bg-gray-300 text-gray-800 px-3 py-1 rounded shadow hover:bg-gray-400"
        >
          Back
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          Members – {center.name}
        </h2>

        {/* ADD MEMBER */}
        <div className="flex mb-6">
          <input
            placeholder="New Member Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-3 border rounded-l-lg"
          />
          <button
            onClick={addMember}
            className="bg-indigo-600 text-white px-4 rounded-r-lg"
          >
            Add
          </button>
        </div>

        {/* MEMBERS LIST */}
        {members.length === 0 ? (
          <p className="text-center text-gray-600">No members found</p>
        ) : (
          <ul className="space-y-3">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex justify-between items-center p-3 border rounded"
              >
                <span
                  className={`font-medium ${
                    member.loanSubmitted ? "text-green-600" : "text-gray-800"
                  }`}
                >
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
        )}
      </div>
    </div>
  );
}
