import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { checkInviteToken, acceptInvite } from "@/api/invite/invite";

function AcceptInvitePage() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const navigate = useNavigate();

	const [inviteData, setInviteData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [formError, setFormError] = useState("");
	const [formSuccess, setFormSuccess] = useState("");

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	useEffect(() => {
		async function fetchInvite() {
			if (!token) {
				setError("Missing invite token.");
				setLoading(false);
				return;
			}

			try {
				const data = await checkInviteToken(token);
				console.log("Invite data:", data);
				setInviteData(data); // contains name and email
			} catch (err) {
				const status = err?.response?.status;
				const message = err?.response?.data?.error;

				if (status === 410) {
					setError(
						"This invitation link has expired. Please contact coordination for a new invite."
					);
				} else if (status === 404) {
					setError("This invitation is invalid or no longer available.");
				} else {
					setError(
						message || "Something went wrong while validating your invite."
					);
				}
			} finally {
				setLoading(false);
			}
		}
		fetchInvite();
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError("");
		setFormSuccess("");

		if (!username || username.length < 3) {
			setFormError("Username must be at least 3 characters.");
			return;
		}
		if (!password || password.length < 8) {
			setFormError("Password must be at least 8 characters.");
			return;
		}
		if (password !== confirmPassword) {
			setFormError("Passwords do not match.");
			return;
		}

		try {
			await acceptInvite(token, { username, password });
			setFormSuccess("Account setup complete! Redirecting to login...");
			setTimeout(() => navigate("/login"), 2000);
		} catch (err) {
			setFormError(err.response?.data?.error || "Error submitting form.");
		}
	};

	if (loading) return <p>Loading invite details...</p>;
	if (error) return <p>{error}</p>;

	return (
		<div style={{ maxWidth: "400px", margin: "0 auto" }}>
			<h2>Set Up Your Teacher Account</h2>

			<p>
				<strong>Name:</strong> {inviteData.name}
			</p>
			<p>
				<strong>Email:</strong> {inviteData.email}
			</p>

			<form onSubmit={handleSubmit}>
				<div>
					<label>Username</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</div>

				<div>
					<label>Password</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<div>
					<label>Confirm Password</label>
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
					/>
				</div>

				{formError && <p style={{ color: "red" }}>{formError}</p>}
				{formSuccess && <p style={{ color: "green" }}>{formSuccess}</p>}

				<button type="submit">Finish Setup</button>
			</form>
		</div>
	);
}

export default AcceptInvitePage;
