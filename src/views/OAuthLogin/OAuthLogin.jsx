import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./OAuthLogin.module.css";
import { login } from "../../store/auth/authSlice";

export default function OAuthLogin() {
	const [loginType, setLoginType] = useState("teacher"); // "teacher", "student", "admin"
	const [credentials, setCredentials] = useState({
		username: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleMicrosoftLogin = () => {
		const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
		// Hit the BACKEND start route
		window.location.href = `${apiBase}/oauth/teacher/microsoft`;
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

			// Redirect to appropriate dashboard
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

					{/* Teacher OAuth Login */}
					{loginType === "teacher" && (
						<div className={styles.teacher_login}>
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
											: `Enter your ${loginType} username`
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

							{error && <div className={styles.error_message}>{error}</div>}

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
				{/* <div className={styles.login_right}>
					<div className={styles.login_right_text}>
						<p>Speaking Exam Practice</p>
					</div>
				</div> */}
			</div>
		</div>
	);
}
