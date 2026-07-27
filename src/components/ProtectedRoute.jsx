import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 * - If no JWT token in localStorage → redirect to /login
 * - If token exists → render children
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
