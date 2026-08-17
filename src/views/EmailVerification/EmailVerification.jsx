import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { confirmEmail } from "@/domain/users/api/authApi";
import { setCredentials } from "@/store/auth/authSlice";
import styles from "./EmailVerification.module.css";

const EmailVerification = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const hasAutoVerified = useRef(false);

	const tokenFromQuery = useMemo(() => {
		const sp = new URLSearchParams(location.search);
		return sp.get("token");
	}, [location.search]);
	const token = tokenFromQuery || "";

	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState("");
	const [info, setInfo] = useState("");
	const [canGoToLogin, setCanGoToLogin] = useState(false);

	useEffect(() => {
		if (!token) return;
		window.history.replaceState(null, "", "/verify-email");
	}, [token]);

	const handleVerify = async () => {
		if (!token) {
			setServerError(
				"Verification token missing. Please use the link from your email.",
			);
			return;
		}

		setSubmitting(true);
		setServerError("");
		setInfo("");
		setCanGoToLogin(false);

		try {
			const data = await confirmEmail(token);
			const backendMessage = data?.message || data?.error;

			if (data?.token && data?.user) {
				dispatch(setCredentials({ token: data.token, user: data.user }));
				setInfo(backendMessage || "Email verified successfully.");
				setCanGoToLogin(true);
				return;
			}

			setInfo(backendMessage || "Email verified. You can now log in.");
			setCanGoToLogin(true);
		} catch (err) {
			const status = err?.response?.status;
			const backendMessage =
				err?.response?.data?.message ||
				err?.response?.data?.error ||
				err?.message;

			if (status === 409) {
				setInfo(backendMessage || "Your email is already verified.");
				setCanGoToLogin(true);
			} else {
				setServerError(
					backendMessage || "Verification failed. Please try again.",
				);
			}
		} finally {
			setSubmitting(false);
		}
	};

	useEffect(() => {
		if (!token || hasAutoVerified.current) return;
		hasAutoVerified.current = true;
		handleVerify();
	}, [token]);

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Verify your email</h1>
			<p className={styles.description}>
				If your link is valid, verification runs automatically.
			</p>

			{serverError && <div className={styles.errorMessage}>{serverError}</div>}

			{info && <div className={styles.infoMessage}>{info}</div>}

			<button
				onClick={canGoToLogin ? () => navigate("/login") : handleVerify}
				disabled={!token || submitting}
				className={styles.verifyButton}
			>
				{submitting
					? "Verifying..."
					: canGoToLogin
						? "Go to Login"
						: "Verify Email"}
			</button>

			{!token && (
				<p className={styles.missingTokenText}>
					Verification token missing. Please open the link from your email.
				</p>
			)}
		</div>
	);
};

export default EmailVerification;
