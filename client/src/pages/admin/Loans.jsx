import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

export default function Loans() {
  const { user } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const bgColors = [
    "bg-red-200",
    "bg-green-200",
    "bg-blue-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-pink-200",
    "bg-indigo-200",
    "bg-orange-200",
  ];

  const [centerColors, setCenterColors] = useState({});
  const [search, setSearch] = useState("");

  /* ================= FETCH LOANS ================= */
  const {
    data: loans = [],
    isLoading: loansLoading,
    isError: loansError,
  } = useQuery({
    queryKey: ["loans", userId],
    queryFn: async () => {
      const url = userId
        ? `${API_URL}/api/users/${userId}/loans`
        : `${API_URL}/api/loans`;
      const res = await axios.get(url);
      return res.data || [];
    },
    enabled: !!user,
  });

  /* ================= FETCH CENTERS ================= */
  const {
    data: centers = [],
    isLoading: centersLoading,
    isError: centersError,
  } = useQuery({
    queryKey: ["centers"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/centers`);
      return res.data || [];
    },
    enabled: !!user,
  });

  /* ================= CENTER COLORS ================= */
  useEffect(() => {
    if (centers.length > 0) {
      const colorsMap = {};
      centers.forEach((center, index) => {
        colorsMap[center.id] = bgColors[index % bgColors.length];
      });
      setCenterColors(colorsMap);
    }
  }, [centers]);

  /* ================= DELETE LOAN ================= */
  const deleteLoanMutation = useMutation({
    mutationFn: async (loanId) =>
      axios.delete(`${API_URL}/api/loans/${loanId}`),
    onSuccess: (_, loanId) => {
      queryClient.setQueryData(["loans", userId], (old = []) =>
        old.filter((loan) => loan.id !== loanId)
      );
    },
  });

  const getCenterName = (centerId) => {
    const center = centers.find((c) => c.id === centerId);
    return center ? center.name : "N/A";
  };

  /* ================= STATUS COLOR ================= */
  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "credited":
        return "bg-purple-600 text-white ring-2 ring-purple-300";
      case "approved":
        return "bg-green-300 text-green-900";
      case "rejected":
        return "bg-red-300 text-red-900";
      case "pending":
      default:
        return "bg-yellow-300 text-yellow-900";
    }
  };

  /* ================= SEARCH FILTER ================= */
  const filteredLoans = loans.filter((loan) => {
    const text = search.toLowerCase();
    return (
      loan.loanid?.toLowerCase().includes(text) ||
      loan.personname?.toLowerCase().includes(text) ||
      getCenterName(loan.centerid)?.toLowerCase().includes(text) ||
      loan.status?.toLowerCase().includes(text)
    );
  });

  /* ================= GUARDS ================= */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 font-semibold">
          Please login to view loans
        </p>
      </div>
    );
  }

  if (loansLoading || centersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-indigo-600 text-lg font-semibold animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (loansError || centersError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-red-600 font-semibold">
          Failed to load data
        </p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-indigo-700">
            Loans {userId && <span className="text-sm">(User {userId})</span>}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
          >
            ← Back
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Search loan / member / center / status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {filteredLoans.length === 0 ? (
          <p className="text-center text-gray-500">
            No matching loans found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="px-4 py-3 text-left">Loan ID</th>
                  <th className="px-4 py-3 text-left">Center</th>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created At</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan, index) => (
                  <tr
                    key={loan.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50 transition`}
                  >
                    <td className="px-4 py-2 border font-semibold">
                      {loan.loanid}
                    </td>
                    <td
                      className={`px-4 py-2 border font-semibold ${
                        centerColors[loan.centerid]
                      }`}
                    >
                      {getCenterName(loan.centerid)}
                    </td>
                    <td className="px-4 py-2 border">
                      {loan.personname || "N/A"}
                    </td>
                    <td className="px-4 py-2 border">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor(
                          loan.status
                        )}`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm text-gray-600">
                      {new Date(
                        loan.created_at || Date.now()
                      ).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border text-center space-x-2">
                      {loan.status !== "CREDITED" && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this loan?"
                              )
                            ) {
                              deleteLoanMutation.mutate(loan.id);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg"
                        >
                          Delete
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/admin/loans/${loan.id}`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
