import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { selectUserRole } from "@/store/auth/authSlice";

const RoleRoute = ({ allowedRoles }) => {
	const role = useSelector(selectUserRole);

	if (!role) return <Navigate to="/login" replace />;
	if (!allowedRoles.includes(role))
		return <Navigate to="/unauthorised" replace />;

	return <Outlet />;
};

export default RoleRoute;
