import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "@/api/httpClient";
import styles from "./StudentSignup.module.css";
import { checkEmailExists } from "@/api/user/user";
import { ROUTES } from "@/routes/routeConfig";

const extractApiMessage = (payload, fallback) => {
	if (!payload) return fallback;

	if (typeof payload === "string") return payload;

	if (typeof payload.message === "string" && payload.message.trim()) {
		return payload.message;
	}

	if (typeof payload.error === "string" && payload.error.trim()) {
		return payload.error;
	}

	if (Array.isArray(payload.errors) && payload.errors.length > 0) {
		const firstError = payload.errors.find((item) => {
			if (typeof item === "string" && item.trim()) return true;
			if (item && typeof item.message === "string" && item.message.trim()) {
				return true;
			}
			return false;
		});

		if (typeof firstError === "string") return firstError;
		if (firstError?.message) return firstError.message;
	}

	if (payload.errors && typeof payload.errors === "object") {
		const firstKey = Object.keys(payload.errors)[0];
		const firstValue = payload.errors[firstKey];

		if (Array.isArray(firstValue) && firstValue.length > 0) {
			return String(firstValue[0]);
		}

		if (typeof firstValue === "string" && firstValue.trim()) {
			return firstValue;
		}
	}

	return fallback;
};

const StudentSignup = () => {
	const authBaseUrl = import.meta.env.VITE_AUTH_API_URL || "/users/api/auth";
	const navigate = useNavigate();

	const [form, setForm] = useState({
		name: "",
		surname: "",
		email: "",
		username: "",
		password: "",
	});

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		if (error) setError(null);
		if (message) setMessage(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setMessage(null);
		setLoading(true);

		try {
			await httpClient.post(`${authBaseUrl}/signup`, form);
			navigate(ROUTES.CHECK_EMAIL, {
				replace: true,
				state: { email: form.email },
			});
		} catch (err) {
			setError(
				extractApiMessage(
					err?.response?.data,
					err?.message || "Signup failed.",
				),
			);
		} finally {
			setLoading(false);
		}
	};

	const handleEmailBlur = async (e) => {
		const email = e.target.value;
		if (!email) return;
		try {
			const exists = await checkEmailExists(email);
			if (exists) setError("This email is already registered.");
		} catch {
			// Optionally handle error
		}
	};

	return (
		<div className={styles.signup_container}>
			<h1 className={styles.signup_title}>Student Signup</h1>
			<p className={styles.signup_desc}>
				Fill in your details to create your account.
			</p>
			{message && <div className={styles.signup_success}>{message}</div>}
			{error && (
				<div className={styles.signup_error}>
					{error}
					{/(already|exists|taken|registered)/i.test(error) && (
						<div style={{ marginTop: 8 }}>
							Already have an account?{" "}
							<Link
								to="/login"
								style={{
									color: "var(--actionable_text_active)",
									textDecoration: "underline",
									fontWeight: 500,
								}}
							>
								Sign in
							</Link>
						</div>
					)}
				</div>
			)}
			<form onSubmit={handleSubmit} className={styles.signup_form}>
				<input
					type="text"
					name="name"
					placeholder="Name"
					value={form.name}
					onChange={handleChange}
					required
					className={styles.signup_input}
				/>
				<input
					type="text"
					name="surname"
					placeholder="Surname"
					value={form.surname}
					onChange={handleChange}
					required
					className={styles.signup_input}
				/>
				<input
					type="email"
					name="email"
					placeholder="Email"
					value={form.email}
					onChange={handleChange}
					onBlur={handleEmailBlur}
					required
					className={styles.signup_input}
				/>
				<input
					type="text"
					name="username"
					placeholder="Username"
					value={form.username}
					onChange={handleChange}
					required
					className={styles.signup_input}
				/>
				<input
					type="password"
					name="password"
					placeholder="Password (min 8 chars)"
					value={form.password}
					onChange={handleChange}
					required
					className={styles.signup_input}
				/>
				<button
					type="submit"
					disabled={loading}
					className={styles.signup_button}
				>
					{loading ? "Signing up..." : "Sign Up"}
				</button>
			</form>
		</div>
	);
};

export default StudentSignup;
