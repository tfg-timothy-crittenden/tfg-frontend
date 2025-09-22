import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./OAuthLogin.module.css";
import { login } from "../../store/auth/authSlice";

export default function OAuthLogin() {
	const [loginType, setLoginType] = useState("teacher");
	const [credentials, setCredentials] = useState({
		username: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const [searchParams] = useSearchParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const hasProcessedOAuthError = useRef(false); // Add this

	// Check for OAuth errors in URL parameters when component loads
	useEffect(() => {
		const errorParam = searchParams.get("error");
		const errorDescription = searchParams.get("error_description");
		const reasonParam = searchParams.get("reason");

		// Handle OAuth errors from URL
		if (errorParam || reasonParam) {
			hasProcessedOAuthError.current = true; // Mark as processed
			let errorMessage = "Authentication failed";

			if (reasonParam) {
				errorMessage = decodeURIComponent(reasonParam);
			} else if (errorDescription) {
				errorMessage = errorDescription;
			} else if (errorParam === "access_denied") {
				errorMessage =
					"Access denied. You may not be invited to use this system.";
			} else if (errorParam === "unauthorized") {
				errorMessage =
					"You are not authorized to access this system. Please contact coordination.";
			} else if (errorParam === "user_not_found") {
				errorMessage =
					"Teacher account not found. You must be invited by coordination before logging in.";
			}

			setError(errorMessage);

			// Clear the error parameters from URL without page reload
			const newSearchParams = new URLSearchParams(searchParams);
			newSearchParams.delete("error");
			newSearchParams.delete("error_description");
			newSearchParams.delete("reason");
			navigate({ search: newSearchParams.toString() }, { replace: true });
		}
	}, [searchParams, navigate]);

	// Clear error when switching login types (but not if we just processed OAuth error)
	useEffect(() => {
		if (!hasProcessedOAuthError.current) {
			setError("");
		}
		hasProcessedOAuthError.current = false; // Reset for next time
	}, [loginType]);

	const handleMicrosoftLogin = () => {
		// Clear any existing errors
		setError("");

		const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
		window.location.href = `${apiBase}/oauth/teacher/microsoft`;
	};

	const handlePasswordResetClick = () => {
		navigate("/password-reset");
	};

	const handleCredentialLogin = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const result = await dispatch(
				login({
					username: credentials.username,
					password: credentials.password,
					userType: loginType,
				})
			).unwrap();

			navigate("/my/classrooms");
		} catch (err) {
			setError(err || "Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e) => {
		setCredentials({
			...credentials,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className={styles.login_outer}>
			<div className={styles.login_card + " " + styles.animated_height}>
				<div className={styles.login_left}>
					<div className={styles.school_logo}>
						<img src="/assets/cic_idiomes.svg" alt="CIC Speak" />
					</div>

					<div className={styles.login_type_selector}>
						<button
							className={`${styles.type_button} ${
								loginType === "teacher" ? styles.active : ""
							}`}
							onClick={() => setLoginType("teacher")}
						>
							Teacher
						</button>
						<button
							className={`${styles.type_button} ${
								loginType === "student" ? styles.active : ""
							}`}
							onClick={() => setLoginType("student")}
						>
							Student
						</button>
					</div>

					{/* Display error message for all login types */}
					{error && <div className={styles.error_message}>{error}</div>}

					{/* Teacher OAuth Login */}
					{loginType === "teacher" && (
						<div className={styles.teacher_login}>
							<span className={styles.teacher_message}>
								Teachers must previously have been invited by coordination.
							</span>
							<button
								onClick={handleMicrosoftLogin}
								className={styles.microsoft_button}
							>
								Log in @fundaciocic.org
							</button>
						</div>
					)}

					{/* Username/Password Login for students and admins only */}
					{loginType !== "teacher" && (
						<form
							onSubmit={handleCredentialLogin}
							className={styles.credential_form}
						>
							<div className={styles.form_group}>
								<label htmlFor="username">
									{loginType === "teacher" ? "Email" : "Username"}
								</label>
								<input
									type={loginType === "teacher" ? "email" : "text"}
									id="username"
									name="username"
									value={credentials.username}
									onChange={handleInputChange}
									placeholder={
										loginType === "teacher"
											? "teacher@fundaciocic.org"
											: `Enter your username`
									}
									required
								/>
							</div>

							<div className={styles.form_group}>
								<label htmlFor="password">Password</label>
								<input
									type="password"
									id="password"
									name="password"
									value={credentials.password}
									onChange={handleInputChange}
									placeholder="Enter your password"
									required
								/>
							</div>
							<div className={styles.options_row}>
								<span></span>
								<a
									type="button"
									onClick={handlePasswordResetClick}
									className={styles.forgot_password}
								>
									Forgotten password?
								</a>
							</div>

							<button
								type="submit"
								className={styles.login_button}
								disabled={isLoading}
							>
								{isLoading ? "Logging in..." : `Log in as ${loginType}`}
							</button>
						</form>
					)}

					{loginType === "student" && (
						<div className={styles.login_info}>
							Don't have an account? Contact your teacher for registration.
						</div>
					)}
					{loginType === "teacher" && (
						<div className={styles.login_info}>
							Can't log in? Contact coordination.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
