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

	const tokenFromQuery = useMemo(() => {
		const sp = new URLSearchParams(location.search);
		return sp.get("token");
	}, [location.search]);

	const [token, setToken] = useState(tokenParam || tokenFromQuery || "");
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState("");
	const [info, setInfo] = useState("");

	useEffect(() => {
		if (!token) return;
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
			const { data } = await httpClient.post("/auth/verify-email", { token });

			if (data?.token && data?.user) {
				dispatch(setCredentials({ token: data.token, user: data.user }));
				setInfo(data?.message || "Verified! Redirecting…");
				setTimeout(() => navigate("/my/classrooms"), 900);
				return;
			}

			setInfo(data?.message || "Email verified. You can now log in.");
			setTimeout(() => navigate("/login"), 900);
		} catch (err) {
			const status = err?.response?.status;
			const msg = err?.response?.data?.error;

			if (status === 409) {
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
		<div
			style={{
				maxWidth: 480,
				margin: "64px auto",
				background: "var(--color-background)",
				borderRadius: "var(--radius-lg)",
				boxShadow: "var(--shadow-md)",
				padding: "2rem",
				textAlign: "center",
				fontFamily: "Roboto, sans-serif",
			}}
		>
			<h1
				style={{
					marginBottom: "0.5rem",
					color: "var(--color-primary)",
					fontSize: "2rem",
					fontWeight: 700,
					textAlign: "center",
				}}
			>
				Verify your email
			</h1>
			<p
				style={{
					color: "var(--color-text-secondary)",
					marginBottom: "1.5rem",
					fontSize: "1.05rem",
				}}
			>
				Click the button below to confirm your email and continue.
			</p>

			{serverError && (
				<div
					style={{
						background: "var(--color-error-light)",
						color: "var(--color-error-dark)",
						padding: "10px 12px",
						borderRadius: "var(--radius-md)",
						marginBottom: "1rem",
						fontWeight: 600,
						border: "1px solid var(--color-error-light)",
					}}
				>
					{serverError}
				</div>
			)}

			{info && (
				<div
					style={{
						background: "var(--color-success-light)",
						color: "var(--color-success)",
						padding: "10px 12px",
						borderRadius: "var(--radius-md)",
						marginBottom: "1rem",
						fontWeight: 600,
						border: "1px solid var(--color-success-light)",
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
					borderRadius: "var(--radius-lg)",
					border: "none",
					background: submitting
						? "var(--color-primary-light)"
						: "var(--color-primary)",
					color: "#fff",
					fontWeight: 700,
					cursor: submitting ? "default" : "pointer",
					width: "100%",
					maxWidth: 320,
					fontSize: "1rem",
					boxShadow: "var(--shadow-sm)",
					transition: "background 0.2s",
				}}
			>
				{submitting ? "Verifying…" : "Verify & Continue"}
			</button>

			{!token && (
				<p style={{ marginTop: 16, color: "var(--color-text-secondary)" }}>
					Don’t have a token?{" "}
					<a
						href="/resend-verification"
						style={{
							color: "var(--color-primary)",
							textDecoration: "underline",
							fontWeight: 500,
						}}
					>
						Resend verification email
					</a>
				</p>
			)}
		</div>
	);
};

export default EmailVerification;
