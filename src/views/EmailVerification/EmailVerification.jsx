// src/pages/EmailVerification.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import httpClient from "@/api/httpClient";
import { setCredentials } from "@/store/auth/authSlice";

const EmailVerification = () => {
	const { token: tokenParam } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Support either /verify-email/:token or /verify-email?token=...
	const tokenFromQuery = useMemo(() => {
		const sp = new URLSearchParams(location.search);
		return sp.get("token");
	}, [location.search]);

	const [token, setToken] = useState(tokenParam || tokenFromQuery || "");
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState("");
	const [info, setInfo] = useState("");

	// Hide token from URL after grabbing it (cleaner, safer)
	useEffect(() => {
		if (!token) return;
		// Make sure your router supports /verify-email (no param) as well.
		window.history.replaceState(null, "", "/verify-email");
	}, [token]);

	const handleVerify = async () => {
		if (!token) {
			setServerError(
				"Verification token missing. Please use the link from your email."
			);
			return;
		}
		setSubmitting(true);
		setServerError("");
		setInfo("");

		try {
			// Secure exchange: token in POST body, not URL
			const { data } = await httpClient.post("/auth/verify-email", { token });

			// If backend returns JWT+user, log in on explicit user action
			if (data?.token && data?.user) {
				dispatch(setCredentials({ token: data.token, user: data.user }));
				setInfo(data?.message || "Verified! Redirecting…");
				setTimeout(() => navigate("/my/classrooms"), 900);
				return;
			}

			// If no creds returned (your backend can choose this), just inform and route to login
			setInfo(data?.message || "Email verified. You can now log in.");
			setTimeout(() => navigate("/login"), 900);
		} catch (err) {
			const status = err?.response?.status;
			const msg = err?.response?.data?.error;

			if (status === 409) {
				// Already verified (no token minted) – send them to login
				setInfo("Your email is already verified. Please log in.");
				setTimeout(() => navigate("/login"), 900);
			} else if (status === 400) {
				setServerError(msg || "Invalid or expired verification link.");
			} else {
				setServerError(msg || "Verification failed. Please try again.");
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div style={{ maxWidth: 520, margin: "64px auto", textAlign: "center" }}>
			<h1 style={{ marginBottom: 8 }}>Verify your email</h1>
			<p style={{ color: "#6b7280", marginBottom: 24 }}>
				Click the button below to confirm your email and continue.
			</p>

			{serverError && (
				<div
					style={{
						background: "#fee2e2",
						color: "#991b1b",
						padding: "10px 12px",
						borderRadius: 8,
						marginBottom: 16,
						fontWeight: 600,
					}}
				>
					{serverError}
				</div>
			)}

			{info && (
				<div
					style={{
						background: "#ecfdf5",
						color: "#065f46",
						padding: "10px 12px",
						borderRadius: 8,
						marginBottom: 16,
						fontWeight: 600,
					}}
				>
					{info}
				</div>
			)}

			<button
				onClick={handleVerify}
				disabled={!token || submitting}
				style={{
					padding: "12px 16px",
					borderRadius: 10,
					border: "none",
					background: submitting ? "#93c5fd" : "#2563eb",
					color: "#fff",
					fontWeight: 700,
					cursor: submitting ? "default" : "pointer",
					width: "100%",
					maxWidth: 360,
				}}
			>
				{submitting ? "Verifying…" : "Verify & Continue"}
			</button>

			{!token && (
				<p style={{ marginTop: 16, color: "#6b7280" }}>
					Don’t have a token?{" "}
					<a href="/resend-verification" style={{ color: "#2563eb" }}>
						Resend verification email
					</a>
				</p>
			)}
		</div>
	);
};

export default EmailVerification;
