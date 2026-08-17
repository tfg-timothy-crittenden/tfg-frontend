import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./OAuthLogin.module.css";
import { login } from "@/store/auth/authSlice";
import { ROUTES } from "@/app/routes/routeConfig";

// Updated to a safe, efficient email regex to prevent ReDoS
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const getLoginErrorMessage = (error) => {
	if (typeof error === "string") return error;
	if (typeof error?.message === "string") return error.message;
	if (typeof error?.error === "string") return error.error;
	return "Login failed";
};

const shouldRedirectToCheckEmail = (error, fallbackIdentifier) => {
	if (error?.shouldConfirmEmail) {
		const email =
			typeof error?.email === "string" && EMAIL_PATTERN.test(error.email)
				? error.email
				: EMAIL_PATTERN.test(fallbackIdentifier || "")
					? fallbackIdentifier
					: "";

		return {
			redirect: true,
			email,
		};
	}

	return { redirect: false, email: "" };
};

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
		navigate(ROUTES.RESET_PASSWORD);
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

			navigate(ROUTES.CLASSROOMS);
		} catch (err) {
			const { redirect, email } = shouldRedirectToCheckEmail(
				err,
				credentials.username,
			);

			if (redirect) {
				navigate(ROUTES.CHECK_EMAIL, {
					replace: true,
					state: { email },
				});
				return;
			}

			setError(getLoginErrorMessage(err));
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
