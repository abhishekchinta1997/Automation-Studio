import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Role } from "../types/user";
export default function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(currentUser.role))
    return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
