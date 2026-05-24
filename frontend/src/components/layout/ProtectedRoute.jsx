import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isAdmin, isStudent, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === "ADMIN" && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (role === "STUDENT" && !isStudent) return <Navigate to="/admin/modules" replace />;

  return children;
}
