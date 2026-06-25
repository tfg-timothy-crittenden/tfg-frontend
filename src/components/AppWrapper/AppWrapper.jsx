import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, fetchMe, selectUserRole } from "@/store/auth/authSlice";
import { setLogoutHandler, setAuthHeaders } from "@/api/httpClient";
import { queryClient } from "@/api/queryClient";

function AppWrapper({ children }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const role = useSelector(selectUserRole);

	useEffect(() => {
		// Set up global 401 logout
		setLogoutHandler(() => {
			queryClient.clear();
			dispatch(logout());
			navigate("/login");
		});

		// Only fetch user if token exists and user isn't already loaded
		const token = localStorage.getItem("token");
		if (token && !role) {
			setAuthHeaders(token);
			dispatch(fetchMe());
		}
	}, [dispatch, navigate, role]);

	return children;
}

export default AppWrapper;
