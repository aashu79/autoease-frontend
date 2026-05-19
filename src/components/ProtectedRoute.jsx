import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPath, isRoleAllowed } from "../utils/auth";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !isRoleAllowed(user?.Role, allowedRoles)) {
    return <Navigate to={getDashboardPath(user?.Role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
