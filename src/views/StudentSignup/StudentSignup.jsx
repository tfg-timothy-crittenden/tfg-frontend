import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import httpClient from "@/api/httpClient";

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

	useEffect(() => {
		// If the URL changes (unlikely but possible), update the form
		if (initialClassCode && !form.classCode) {
			setForm((prev) => ({ ...prev, classCode: initialClassCode }));
		}
	}, [initialClassCode]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
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

	return (
		<div style={{ maxWidth: 500, margin: "auto" }}>
			<h2>Student Signup</h2>
			{message && <p style={{ color: "green" }}>{message}</p>}
			{error && <p style={{ color: "red" }}>{error}</p>}

			<form onSubmit={handleSubmit}>
				<input
					type="text"
					name="name"
					placeholder="Full name"
					value={form.name}
					onChange={handleChange}
					required
				/>
				<input
					type="email"
					name="email"
					placeholder="Email"
					value={form.email}
					onChange={handleChange}
					required
				/>
				<input
					type="text"
					name="username"
					placeholder="Username"
					value={form.username}
					onChange={handleChange}
					required
				/>
				<input
					type="password"
					name="password"
					placeholder="Password (min 8 chars)"
					value={form.password}
					onChange={handleChange}
					required
				/>
				<input
					type="text"
					name="classCode"
					placeholder="Class code"
					value={form.classCode}
					onChange={handleChange}
					required
					readOnly={!!initialClassCode} // lock it if it came from the URL
				/>

				<button type="submit" disabled={loading}>
					{loading ? "Signing up..." : "Sign Up"}
				</button>
			</form>
		</div>
	);
};

export default StudentSignup;
