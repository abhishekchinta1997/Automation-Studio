import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AdminHomePage from "./pages/AdminHomePage";
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import TestUserHomePage from "./pages/TestUserHomePage";
import AutomationLabPage from "./pages/AutomationLabPage";
import DynamicTablesPage from "./pages/DynamicTablesPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useApp } from "./context/AppContext";

function RootRedirect() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" />;
  return (
    <Navigate to={currentUser.role === "Admin User" || currentUser.role === "Super User" ? "/admin" : "/test-user"} />
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<ProtectedRoute roles={["Admin User", "Super User"] as any} />}>
            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/users" element={<AdminUserManagementPage />} />
            <Route path="/admin/lab" element={<AutomationLabPage />} />
            <Route path="/admin/tables" element={<DynamicTablesPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["Test User"]} />}>
            <Route path="/test-user" element={<TestUserHomePage />} />
            <Route path="/lab" element={<AutomationLabPage />} />
            <Route path="/tables" element={<DynamicTablesPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
