import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminLoanDetails() {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

 const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET;

  // ================= FETCH LOAN =================
  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/loans/${loanId}`);
        setLoan(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load loan details");
      } finally {
        setLoading(false);
      }
    };
    fetchLoan();
  }, [loanId]);

  // ================= UPDATE STATUS =================
  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      await axios.patch(`${API_URL}/api/loans/${loanId}`, { status });
      alert(`Loan ${status}`);
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to update loan status");
    } finally {
      setUpdating(false);
    }
  };

  // ================= DOCUMENT LINK COMPONENT =================
  const DocLink = ({ label, path }) => {
    if (!path) return null;
    const url = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-3 border rounded-lg 
                   bg-gray-50 hover:bg-blue-50 border-gray-200 hover:border-blue-400
                   transition shadow-sm"
      >
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-blue-600 text-xs font-semibold">View</span>
      </a>
    );
  };

  // ================= STATUS STYLE =================
  const statusStyle =
    loan?.status === "APPROVED"
      ? "bg-green-100 text-green-700 border-green-300"
      : loan?.status === "REJECTED"
      ? "bg-red-100 text-red-700 border-red-300"
      : "bg-yellow-100 text-yellow-700 border-yellow-300";

  if (loading)
    return <p className="p-6 text-center text-gray-600">Loading loan details...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
  if (!loan) return <p className="p-6 text-center text-gray-600">Loan not found</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-5 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Loan Details <span className="text-gray-500 ml-2">({loan.loanid})</span>
        </h2>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Member Details */}
        <div className="bg-white shadow rounded-lg p-4 grid gap-2">
          <h1 className="text-lg font-semibold text-white bg-blue-600 px-3 py-2 rounded mb-3">
            Member Details
          </h1>
          <p><b>CIBIL:</b> {loan.membercibil || "N/A"}</p>
          <p><b>Name:</b> {loan.personname || "N/A"}</p>
          <p><b>DOB:</b> {loan.dateofbirth || "N/A"}</p>
          <p><b>Gender:</b> {loan.gender || "N/A"}</p>
          <p><b>Religion:</b> {loan.religion || "N/A"}</p>
          <p><b>Marital:</b> {loan.maritalstatus || "N/A"}</p>
          <p><b>Aadhaar:</b> {loan.aadharno || "N/A"}</p>
          <p><b>Work:</b> {loan.memberwork || "N/A"}</p>
          <p><b>Income:</b> ₹{loan.annualincome || 0}</p>
        </div>

        {/* Nominee Details */}
        <div className="bg-white shadow rounded-lg p-4 grid gap-2">
          <h1 className="text-lg font-semibold text-white bg-blue-600 px-3 py-2 rounded mb-3">
            Nominee Details
          </h1>
          <p><b>Name:</b> {loan.nominee_name || "N/A"}</p>
          <p><b>DOB:</b> {loan.nominee_dob || "N/A"}</p>
          <p><b>Gender:</b> {loan.nominee_gender || "N/A"}</p>
          <p><b>Religion:</b> {loan.nominee_religion || "N/A"}</p>
          <p><b>Marital:</b> {loan.nominee_marital_status || "N/A"}</p>
          <p><b>Relation:</b> {loan.nominee_relationship || "N/A"}</p>
          <p><b>Business:</b> {loan.nominee_business || "N/A"}</p>
        </div>

        {/* Contact Details */}
        <div className="bg-white shadow rounded-lg p-4 grid gap-2">
          <h1 className="text-lg font-semibold text-white bg-blue-600 px-3 py-2 rounded mb-3">
            Contact Details
          </h1>
          <p><b>Mobile:</b> {loan.mobile_no || "N/A"}</p>
          <p><b>Nominee Mobile:</b> {loan.nominee_mobile || "N/A"}</p>
          <p><b>Email:</b> {loan.member_email || "N/A"}</p>
          <p><b>Address:</b> {loan.address || "N/A"}</p>
          <p><b>Pincode:</b> {loan.pincode || "N/A"}</p>
        </div>

        {/* Status */}
        <div className="bg-white shadow rounded-lg p-4">
          <h1 className="text-lg font-semibold text-white bg-blue-600 px-3 py-2 rounded mb-3">
            Status
          </h1>
          <span className={`inline-block px-4 py-1 rounded border font-semibold ${statusStyle}`}>
            {loan.status}
          </span>
          <p className="mt-2 text-sm">
            <b>Created:</b> {loan.created_at ? new Date(loan.created_at).toLocaleString() : "N/A"}
          </p>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white shadow rounded-lg p-5 mt-8">
        <h3 className="font-semibold text-lg mb-4">Documents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-3">
            <DocLink label="Member Aadhaar Front" path={loan.memberaadhaarfront} />
            <DocLink label="Member Aadhaar Back" path={loan.memberaadhaarback} />
            <DocLink label="Nominee Aadhaar Front" path={loan.nomineeaadhaarfront} />
          </div>
          <div className="space-y-3">
            <DocLink label="Nominee Aadhaar Back" path={loan.nomineeaadhaarback} />
            <DocLink label="PAN Card" path={loan.pancard} />
            <DocLink label="Passbook" path={loan.passbookimage} />
          </div>
          <div className="space-y-3">
            <DocLink label="Member Photo" path={loan.memberphoto} />
            <DocLink label="Signature" path={loan.signature} />
            <DocLink label="Form Image" path={loan.formimage} />
          </div>
        </div>
      </div>

      {/* Actions */}
      {loan.status === "PENDING" && (
        <div className="flex gap-4 mt-6">
          <button
            disabled={updating}
            onClick={() => updateStatus("APPROVED")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow disabled:opacity-50"
          >
            Approve
          </button>
          <button
            disabled={updating}
            onClick={() => updateStatus("REJECTED")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
