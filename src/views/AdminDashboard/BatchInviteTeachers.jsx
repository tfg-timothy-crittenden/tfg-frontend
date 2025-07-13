import { useState } from "react";
import { inviteTeacher } from "@/api/admin/invite"; // reuse single invite API

const BatchInviteTeachers = () => {
	const [teachers, setTeachers] = useState([{ name: "", email: "" }]);
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState([]);
	const [error, setError] = useState("");

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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessages([]);
		setError("");

		const results = [];

		for (const t of teachers) {
			if (!t.name || !t.email) {
				results.push({
					email: t.email || "?",
					status: "error",
					message: "Missing name or email.",
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
		setLoading(false);
	};

	return (
		<div style={{ maxWidth: "700px", margin: "0 auto", padding: "1rem" }}>
			<h2>Batch Invite Teachers</h2>

			<form onSubmit={handleSubmit}>
				{teachers.map((teacher, index) => (
					<div key={index} style={{ marginBottom: "1rem" }}>
						<input
							type="text"
							placeholder="Name"
							value={teacher.name}
							onChange={(e) => handleInputChange(index, "name", e.target.value)}
							required
						/>
						<input
							type="email"
							placeholder="Email"
							value={teacher.email}
							onChange={(e) =>
								handleInputChange(index, "email", e.target.value)
							}
							required
							style={{ marginLeft: "0.5rem" }}
						/>
						<button
							type="button"
							onClick={() => removeRow(index)}
							disabled={teachers.length === 1}
						>
							Remove
						</button>
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

			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default BatchInviteTeachers;
