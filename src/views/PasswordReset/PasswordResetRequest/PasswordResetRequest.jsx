// src/views/PasswordReset/PasswordResetRequest.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { resetPasswordRequest } from "@/domain/users/api/authApi";
import styles from "../PasswordReset.module.css";

const PasswordResetRequest = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setMessage("");

		try {
			const result = await resetPasswordRequest(email);
			setMessage(
				result.message ||
					"If an account with this email exists, you'll receive reset instructions.",
			);
		} catch (err) {
			setError(
				err.response?.data?.error || "Something went wrong. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<h1 className={styles.title}>Reset Password</h1>
				<p className={styles.subtitle}>
					Enter your email address and we'll send you a link to reset your
					password.
				</p>

				{message && <div className={styles.success_message}>{message}</div>}
				{error && <div className={styles.error_message}>{error}</div>}

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.form_group}>
						<label htmlFor="email">Email Address</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							required
							className={styles.input}
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className={styles.submit_button}
					>
						{isLoading ? "Sending..." : "Send Reset Link"}
					</button>
				</form>

				<div className={styles.back_link}>
					<Link to="/login">Back to Login</Link>
				</div>
			</div>
		</div>
	);
};

export default PasswordResetRequest;
