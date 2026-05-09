import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "@/api/httpClient";
import styles from "./StudentSignup.module.css";
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

	return (
		<div className={styles.signup_outer}>
			<div className={styles.signup_card}>
				<div className={styles.signup_left}>
					<h1 className={styles.signup_title}>Create Account</h1>
					<p className={styles.signup_subtitle}>
						Fill in your details to create your account.
					</p>

					{message && <div className={styles.info_message}>{message}</div>}
					{error && (
						<div className={styles.error_message}>
							{error}
							{/(already|exists|taken|registered)/i.test(error) && (
								<div className={styles.error_hint}>
									Already have an account?{" "}
									<Link to={ROUTES.LOGIN} className={styles.alt_link}>
										Sign in
									</Link>
								</div>
							)}
						</div>
					)}

					<form onSubmit={handleSubmit} className={styles.signup_form}>
						<div className={styles.form_group}>
							<label htmlFor="name">Name</label>
							<input
								type="text"
								id="name"
								name="name"
								placeholder="Enter your name"
								value={form.name}
								onChange={handleChange}
								required
							/>
						</div>

						<div className={styles.form_group}>
							<label htmlFor="surname">Surname</label>
							<input
								type="text"
								id="surname"
								name="surname"
								placeholder="Enter your surname"
								value={form.surname}
								onChange={handleChange}
								required
							/>
						</div>

						<div className={styles.form_group}>
							<label htmlFor="email">Email</label>
							<input
								type="email"
								id="email"
								name="email"
								placeholder="Enter your email"
								value={form.email}
								onChange={handleChange}
								required
							/>
						</div>

						<div className={styles.form_group}>
							<label htmlFor="username">Username</label>
							<input
								type="text"
								id="username"
								name="username"
								placeholder="Choose a username"
								value={form.username}
								onChange={handleChange}
								required
							/>
						</div>

						<div className={styles.form_group}>
							<label htmlFor="password">Password</label>
							<input
								type="password"
								id="password"
								name="password"
								placeholder="Create a password"
								value={form.password}
								onChange={handleChange}
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className={styles.signup_button}
						>
							{loading ? "Signing up..." : "Sign up"}
						</button>
					</form>

					<div className={styles.signup_info}>
						Already have an account?{" "}
						<Link to={ROUTES.LOGIN} className={styles.alt_link}>
							Sign in
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StudentSignup;
