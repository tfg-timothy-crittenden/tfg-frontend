import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import httpClient from "@/api/httpClient";
import { GraduationCap } from "lucide-react"; // <-- import icon
import styles from "./StudentSignup.module.css";
import { checkEmailExists } from "@/api/user/user";

const StudentSignup = () => {
	const { classCode: classCodeFromRoute } = useParams();
	const [searchParams] = useSearchParams();
	const classCodeFromQuery = searchParams.get("classCode");

	const initialClassCode = classCodeFromRoute || classCodeFromQuery || "";

	const [form, setForm] = useState({
		name: "",
		email: "",
		username: "",
		password: "",
		classCode: initialClassCode,
	});

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const [className, setClassName] = useState("");
	const [teachers, setTeachers] = useState([]);

	useEffect(() => {
		if (initialClassCode && !form.classCode) {
			setForm((prev) => ({ ...prev, classCode: initialClassCode }));
		}
	}, [initialClassCode]);

	// Fetch class name and teachers by code
	useEffect(() => {
		const fetchClassInfo = async () => {
			if (!form.classCode) {
				setClassName("");
				setTeachers([]);
				return;
			}
			try {
				const res = await httpClient.get(`/classrooms/code/${form.classCode}`);
				setClassName(res.data?.name || "");
				setTeachers(res.data?.teachers || []);
			} catch {
				setClassName("");
				setTeachers([]);
			}
		};
		fetchClassInfo();
	}, [form.classCode]);

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
			const res = await httpClient.post("/student/signup", form);
			setMessage(res.data.message || "Signup successful!");
		} catch (err) {
			setError(err.response?.data?.error || "Signup failed.");
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
			{className && (
				<div className={styles.class_info}>
					<div className={styles.class_name}>{className}</div>
					{teachers.length > 0 && (
						<div className={styles.teacher_info}>
							<GraduationCap size={28} style={{ verticalAlign: "middle" }} />
							<span>
								Teacher{teachers.length > 1 ? "s" : ""}:{" "}
								{teachers.map((t) => t.name).join(", ")}
							</span>
						</div>
					)}
				</div>
			)}
			<p className={styles.signup_desc}>
				Fill in your details to join your class.
			</p>
			{message && <div className={styles.signup_success}>{message}</div>}
			{error && (
				<div className={styles.signup_error}>
					{error}
					{error.toLowerCase().includes("already") && (
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
					placeholder="Full name"
					value={form.name}
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
				<input
					type="text"
					name="classCode"
					placeholder="Class code"
					value={form.classCode}
					onChange={handleChange}
					required
					readOnly={!!initialClassCode}
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
