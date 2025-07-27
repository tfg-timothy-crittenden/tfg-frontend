import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const { status, error, token } = useSelector((state) => state.auth);

	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		dispatch(login(formData));
	};

	// Redirect after successful login
	useEffect(() => {
		if (status === "succeeded" && token) {
			navigate("/part_1");
		}
	}, [status, token, navigate]);

	return (
		<div>
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					name="username"
					placeholder="Username"
					value={formData.username}
					onChange={handleChange}
					required
				/>
				<input
					type="password"
					name="password"
					placeholder="Password"
					value={formData.password}
					onChange={handleChange}
					required
				/>
				<button type="submit" disabled={status === "loading"}>
					{status === "loading" ? "Logging in..." : "Login"}
				</button>
			</form>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default Login;
