import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleOAuthCallback, selectAuthStatus } from "@/store/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthCallback() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const processedRef = useRef(false); // ← guard against double-run
	const status = useSelector(selectAuthStatus);

	useEffect(() => {
		if (processedRef.current) return; // ← StrictMode guard
		processedRef.current = true;

		const params = new URLSearchParams(location.search);
		const token = params.get("token");
		const userStr = params.get("user");
		const error = params.get("error");

		if (error) {
			// Show a simple error UI or send to /login with a message
			navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
			return;
		}

		if (token && userStr) {
			let user;
			try {
				user = JSON.parse(userStr);
			} catch {
				navigate(`/login?error=bad_user_payload`, { replace: true });
				return;
			}

			// Dispatch ONCE; thunk will persist to localStorage + set headers
			dispatch(handleOAuthCallback({ token, user }))
				.unwrap()
				.then(() => navigate("/my/classrooms", { replace: true }))
				.catch(() =>
					navigate("/login?error=oauth_store_failed", { replace: true })
				);
		} else {
			// No params – just send back to login
			navigate("/login?error=missing_params", { replace: true });
		}
	}, [dispatch, location.search, navigate]);

	return <div style={{ padding: 24 }}>Signing you in…</div>;
}
