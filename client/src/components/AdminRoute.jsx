// src/components/AdminRoute.js
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Redirect if not logged in or not an admin
  if (!user || !user.isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
