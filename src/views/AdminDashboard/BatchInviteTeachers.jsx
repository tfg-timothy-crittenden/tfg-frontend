import { useState } from "react";
import { inviteTeacher } from "@/api/admin/admin";
import styles from "./BatchCreateClasses.module.css"; // using same shared styles

const BatchInviteTeachers = ({ onInviteComplete }) => {
	const [teachers, setTeachers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState([]);
	const [errorIndexes, setErrorIndexes] = useState(new Set());

	const handleInputChange = (index, field, value) => {
		const updated = [...teachers];
		updated[index][field] = value;
		setTeachers(updated);

		if (errorIndexes.has(index) && value.trim()) {
			const updatedErrors = new Set(errorIndexes);
			updatedErrors.delete(index);
			setErrorIndexes(updatedErrors);
		}
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
		const results = [];
		const failedIndexes = new Set();

		for (let i = 0; i < teachers.length; i++) {
			const t = teachers[i];

			if (!t.name.trim() || !t.email.trim()) {
				results.push({
					email: t.email || "(blank)",
					status: "error",
					message: "Name and email are required.",
				});
				failedIndexes.add(i);
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
				failedIndexes.add(i);
			}
		}

		const failedRows = teachers.filter((_, i) => failedIndexes.has(i));
		setTeachers(failedRows);
		setErrorIndexes(failedIndexes);
		setMessages(results);
		setLoading(false);

		if (onInviteComplete && failedIndexes.size !== teachers.length) {
			onInviteComplete();
		}
	};

	const hasValidInput = teachers.some((t) => t.name.trim() && t.email.trim());

	return (
		<div>
			<form onSubmit={handleSubmit}>
				{teachers.map((t, index) => (
					<div key={index} className={styles.addClassFormRow}>
						<input
							className={`${styles.textInput} ${
								errorIndexes.has(index) && !t.name.trim()
									? styles.inputError
									: ""
							}`}
							type="text"
							placeholder="Name"
							value={t.name}
							onChange={(e) => handleInputChange(index, "name", e.target.value)}
							required
						/>
						<input
							className={`${styles.textInput} ${
								errorIndexes.has(index) && !t.email.trim()
									? styles.inputError
									: ""
							}`}
							type="email"
							placeholder="Email"
							value={t.email}
							onChange={(e) =>
								handleInputChange(index, "email", e.target.value)
							}
							style={{ marginLeft: "0.5rem" }}
							required
						/>
						<button
							type="button"
							onClick={() => removeRow(index)}
							className={styles.removeRowButton}
						>
							<svg
								className={styles.deleteRowIcon}
								viewBox="0 0 20 20"
								aria-hidden="true"
								focusable="false"
							>
								<path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
							</svg>
						</button>
					</div>
				))}

				<div style={{ marginTop: "1rem" }}>
					<button
						type="button"
						onClick={addRow}
						className={`${styles.btn} ${styles.addClassBtn}`}
					>
						Add Teacher
					</button>
					{hasValidInput && (
						<button
							type="submit"
							disabled={loading}
							className={`${styles.btn} ${styles.saveClassesBtn}`}
						>
							{loading ? "Sending..." : "Send Invites"}
						</button>
					)}
				</div>
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
		</div>
	);
};

export default BatchInviteTeachers;
