import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { selectIsAuthenticated, selectHasRole } from "@/store/auth/authSlice";

const RoleRoute = ({ allowedRoles = [] }) => {
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const hasRole = useSelector(selectHasRole(allowedRoles));

	if (!isAuthenticated) return <Navigate to="/login" replace />;
	if (!hasRole) return <Navigate to="/unauthorised" replace />;

	return <Outlet />;
};

export default RoleRoute;
