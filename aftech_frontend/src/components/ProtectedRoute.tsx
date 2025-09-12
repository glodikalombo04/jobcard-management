import { Navigate, Outlet } from "react-router-dom";

// Simple token-based check; you can customize this logic
const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem("access");

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
