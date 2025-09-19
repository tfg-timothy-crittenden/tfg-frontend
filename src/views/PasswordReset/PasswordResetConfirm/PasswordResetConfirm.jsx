// src/views/PasswordReset/PasswordResetConfirm/PasswordResetConfirm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { validateResetToken, confirmPasswordReset } from "@/api/auth/authAPI";
import styles from "../PasswordReset.module.css";

const PasswordResetConfirm = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const navigate = useNavigate();

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isValidating, setIsValidating] = useState(true);
	const [tokenValid, setTokenValid] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Validate token on component mount
	useEffect(() => {
		const validateToken = async () => {
			try {
				const result = await validateResetToken(token);
				setTokenValid(result.valid);
			} catch (err) {
				setTokenValid(false);
				setError("Invalid or expired reset link.");
			} finally {
				setIsValidating(false);
			}
		};

		if (token) {
			validateToken();
		} else {
			setIsValidating(false);
			setError("No reset token provided.");
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		// Validation
		if (password.length < 8) {
			setError("Password must be at least 8 characters long.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setIsLoading(true);

		try {
			const result = await confirmPasswordReset(token, password);
			setSuccess("Password reset successfully! Redirecting to login...");
			setTimeout(() => navigate("/login"), 2000);
		} catch (err) {
			setError(
				err.response?.data?.error ||
					"Failed to reset password. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (isValidating) {
		return (
			<div className={styles.container}>
				<div className={styles.card}>
					<p>Validating reset link...</p>
				</div>
			</div>
		);
	}

	if (!tokenValid) {
		return (
			<div className={styles.container}>
				<div className={styles.card}>
					<h1 className={styles.title}>Invalid Reset Link</h1>
					<p className={styles.error_message}>
						This password reset link is invalid or has expired.
					</p>
					<button
						onClick={() => navigate("/password-reset")}
						className={styles.submit_button}
					>
						Request New Reset Link
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<h1 className={styles.title}>Set New Password</h1>

				{success && <div className={styles.success_message}>{success}</div>}
				{error && <div className={styles.error_message}>{error}</div>}

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.form_group}>
						<label htmlFor="password">New Password</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter new password (min 8 characters)"
							required
							className={styles.input}
						/>
					</div>

					<div className={styles.form_group}>
						<label htmlFor="confirmPassword">Confirm Password</label>
						<input
							type="password"
							id="confirmPassword"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Confirm new password"
							required
							className={styles.input}
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className={styles.submit_button}
					>
						{isLoading ? "Updating..." : "Update Password"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default PasswordResetConfirm;
