import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./OAuthLogin.module.css";
import { login } from "../../store/auth/authSlice";

export default function OAuthLogin() {
	const [credentials, setCredentials] = useState({
		username: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [info, setInfo] = useState("");

	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (!location.state?.info) return;
		setInfo(location.state.info);
		navigate(location.pathname, { replace: true, state: {} });
	}, [location.pathname, location.state, navigate]);

	const handlePasswordResetClick = () => {
		navigate("/password-reset");
	};

	const handleCredentialLogin = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");
		setInfo("");

		try {
			await dispatch(
				login({
					username: credentials.username,
					password: credentials.password,
					userType: "student",
				}),
			).unwrap();

			navigate("/my/classrooms");
		} catch (err) {
			setError(typeof err === "string" ? err : err?.error || "Login failed");
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
			<div className={styles.login_card}>
				<div className={styles.login_left}>
					{/* <div className={styles.logo}>
						<img src="/assets/landing_image.png" alt="TOEFL Speaking" />
					</div> */}

					<h1 className={styles.login_title}>Welcome Back</h1>
					<p className={styles.login_subtitle}>Sign in to continue</p>

					{/* Display error message for all login types */}
					{info && <div className={styles.info_message}>{info}</div>}
					{error && <div className={styles.error_message}>{error}</div>}

					<form
						onSubmit={handleCredentialLogin}
						className={styles.credential_form}
					>
						<div className={styles.form_group}>
							<label htmlFor="username">Username</label>
							<input
								type="text"
								id="username"
								name="username"
								value={credentials.username}
								onChange={handleInputChange}
								placeholder="Enter your username"
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
							{isLoading ? "Logging in..." : "Sign in"}
						</button>
					</form>

					<div className={styles.login_info}>
						Don't have an account?{" "}
						<Link to="/signup" className={styles.signup_link}>
							Sign up
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
