import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const savedAdmin = localStorage.getItem("admin");

  if (!savedAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}