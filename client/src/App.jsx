import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// User pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Centers from "./pages/Centers";
import Members from "./pages/Members";
import LoanApplicationFlow from "./pages/LoanApplicationFlow";

// Admin pages
import AdminUsers from "./pages/admin/Users";
import AdminCenters from "./pages/admin/Centers";
import AdminMembers from "./pages/admin/Members";
import AdminLoans from "./pages/admin/Loans";
import AdminLoanDetails from "./pages/admin/LoanDetails";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* User Protected Routes */}
          <Route path="/centers" element={<ProtectedRoute><Centers /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="/loan-application" element={<ProtectedRoute><LoanApplicationFlow /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/users/:userId/centers" element={<AdminRoute><AdminCenters /></AdminRoute>} />
          <Route path="/admin/centers/:centerId/members" element={<AdminRoute><AdminMembers /></AdminRoute>} />
          <Route path="/admin/users/:userId/loans" element={<AdminRoute><AdminLoans /></AdminRoute>} />
          <Route path="/admin/loans/:loanId" element={<AdminRoute><AdminLoanDetails /></AdminRoute>} />
         <Route path="/admin/loans" element={<AdminRoute><AdminLoans /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
