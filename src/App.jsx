import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * App — routing only.
 *
 * Routes:
 *   /login   → Login page  (redirects to / if already authenticated)
 *   /signup  → Signup page (redirects to / if already authenticated)
 *   /        → Dashboard   (protected — redirects to /login if no token)
 */
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Catch-all → redirect to / */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
