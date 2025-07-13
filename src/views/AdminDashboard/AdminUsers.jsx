import { useEffect, useState } from "react";
import {
	inviteTeacher,
	fetchInvitedTeachers,
	cancelInvite,
	resendInvite,
	fetchActiveTeachers,
} from "@/api/admin/admin"; // Adjust this path to match your file structure

const AdminUsers = () => {
	const [teachers, setTeachers] = useState([{ name: "", email: "" }]);
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState([]);
	const [invited, setInvited] = useState([]);
	const [activeTeachers, setActiveTeachers] = useState([]);

	const loadInvitedTeachers = async () => {
		try {
			const res = await fetchInvitedTeachers();
			setInvited(res.data);
		} catch (err) {
			console.error("Failed to load invited teachers:", err);
		}
	};

	const loadActiveTeachers = async () => {
		try {
			const res = await fetchActiveTeachers();
			setActiveTeachers(res.data);
		} catch (err) {
			console.error("Failed to load active teachers:", err);
		}
	};

	useEffect(() => {
		loadInvitedTeachers();
		loadActiveTeachers();
	}, []);

	const handleInputChange = (index, field, value) => {
		const updated = [...teachers];
		updated[index][field] = value;
		setTeachers(updated);
	};

	const addRow = () => {
		setTeachers([...teachers, { name: "", email: "" }]);
	};

	const removeRow = (index) => {
		setTeachers(teachers.filter((_, i) => i !== index));
	};

	const handleInviteSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessages([]);

		const results = [];

		for (const t of teachers) {
			if (!t.name || !t.email) {
				results.push({
					email: t.email || "(blank)",
					status: "error",
					message: "Name and email are required.",
				});
				continue;
			}

			try {
				await inviteTeacher(t);
				results.push({
					email: t.email,
					status: "success",
					message: "Invitation sent.",
				});
			} catch (err) {
				results.push({
					email: t.email,
					status: "error",
					message: err.response?.data?.message || "Failed to invite.",
				});
			}
		}

		setMessages(results);
		setTeachers([{ name: "", email: "" }]);
		await loadInvitedTeachers();
		setLoading(false);
	};

	const handleCancel = async (id) => {
		await cancelInvite(id);
		await loadInvitedTeachers();
	};

	const handleResend = async (id) => {
		await resendInvite(id);
		await loadInvitedTeachers();
	};

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
			<h1>Teacher Invitations</h1>

			<form onSubmit={handleInviteSubmit}>
				<h2>Invite Teachers</h2>
				{teachers.map((t, index) => (
					<div key={index} style={{ marginBottom: "1rem" }}>
						<input
							type="text"
							placeholder="Name"
							value={t.name}
							onChange={(e) => handleInputChange(index, "name", e.target.value)}
							required
						/>
						<input
							type="email"
							placeholder="Email"
							value={t.email}
							onChange={(e) =>
								handleInputChange(index, "email", e.target.value)
							}
							required
							style={{ marginLeft: "0.5rem" }}
						/>
						{teachers.length > 1 && (
							<button type="button" onClick={() => removeRow(index)}>
								Remove
							</button>
						)}
					</div>
				))}
				<button type="button" onClick={addRow} style={{ marginRight: "1rem" }}>
					Add Row
				</button>
				<button type="submit" disabled={loading}>
					{loading ? "Sending..." : "Send Invitations"}
				</button>
			</form>

			{messages.length > 0 && (
				<div style={{ marginTop: "1rem" }}>
					<h3>Results</h3>
					<ul>
						{messages.map((m, idx) => (
							<li
								key={idx}
								style={{ color: m.status === "success" ? "green" : "red" }}
							>
								{m.email}: {m.message}
							</li>
						))}
					</ul>
				</div>
			)}

			<hr />

			<h2>Pending Invitations</h2>
			{invited.length === 0 ? (
				<p>No pending invites.</p>
			) : (
				<ul>
					{invited.map((user) => (
						<li key={user.id}>
							<strong>{user.name}</strong> — {user.email} (status: {user.status}
							) <button onClick={() => handleResend(user.id)}>Resend</button>
							<button onClick={() => handleCancel(user.id)}>Cancel</button>
						</li>
					))}
				</ul>
			)}

			<hr />

			<h2>Active Teachers</h2>
			{activeTeachers.length === 0 ? (
				<p>No active teachers found.</p>
			) : (
				<ul>
					{activeTeachers.map((user) => (
						<li key={user.id}>
							<strong>{user.name}</strong> ({user.username}) — {user.email}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default AdminUsers;
