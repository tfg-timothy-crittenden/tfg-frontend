import { useState } from "react";
import { createClass } from "@/api/admin/admin";
import styles from "./BatchCreateClasses.module.css";

const BatchCreateClasses = ({ onClassCreated }) => {
	const [classes, setClasses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState([]);
	const [error, setError] = useState("");
	const [errorIndexes, setErrorIndexes] = useState(new Set());

	const handleInputChange = (index, field, value) => {
		const updated = [...classes];
		updated[index][field] = value;
		setClasses(updated);

		// Remove error highlight if corrected
		if (errorIndexes.has(index) && field === "name" && value.trim()) {
			const updatedErrors = new Set(errorIndexes);
			updatedErrors.delete(index);
			setErrorIndexes(updatedErrors);
		}
	};

	const addRow = () => {
		setClasses([...classes, { name: "", subject: "" }]);
	};

	const removeRow = (index) => {
		setClasses(classes.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessages([]);
		setError("");
		const results = [];
		const failedIndexes = new Set();
		const successfulIndexes = new Set();

		for (let i = 0; i < classes.length; i++) {
			const c = classes[i];

			if (!c.name.trim()) {
				results.push({
					name: c.name || "?",
					status: "error",
					message: "Class name is required.",
				});
				failedIndexes.add(i);
				continue;
			}

			try {
				const res = await createClass(c);
				results.push({
					name: res.data.name,
					status: "success",
					message: "Class created.",
				});
				successfulIndexes.add(i);
			} catch (err) {
				results.push({
					name: c.name,
					status: "error",
					message: err.response?.data?.message || "Failed to create class.",
				});
				failedIndexes.add(i);
			}
		}

		// Keep only failed class inputs
		const failedClasses = classes.filter((_, i) => failedIndexes.has(i));
		setClasses(failedClasses);
		setErrorIndexes(failedIndexes);
		setMessages(results);
		setLoading(false);

		if (onClassCreated) {
			onClassCreated();
		}
	};

	const hasValidClass = classes.some((c) => c.name.trim());

	return (
		<div>
			<form onSubmit={handleSubmit}>
				{classes.map((cls, index) => (
					<div key={index} className={styles.addClassFormRow}>
						<input
							className={`${styles.textInput} ${
								errorIndexes.has(index) ? styles.inputError : ""
							}`}
							type="text"
							placeholder="Class Name"
							value={cls.name}
							onChange={(e) => handleInputChange(index, "name", e.target.value)}
							required
						/>
						<input
							className={styles.textInput}
							type="text"
							placeholder="Subject (optional)"
							value={cls.subject}
							onChange={(e) =>
								handleInputChange(index, "subject", e.target.value)
							}
							style={{ marginLeft: "0.5rem" }}
						/>
						<div
							role="button"
							className={styles.removeRowButton}
							onClick={() => removeRow(index)}
						>
							<svg
								height="100%"
								width="auto"
								viewBox="0 0 20 20"
								aria-hidden="true"
								focusable="false"
								className={styles.deleteRowIcon}
							>
								<path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
							</svg>
						</div>
					</div>
				))}

				<div>
					<button
						className={`${styles.btn} ${styles.addClassBtn}`}
						type="button"
						onClick={addRow}
					>
						Add class
					</button>

					{hasValidClass && (
						<button
							className={`${styles.btn} ${styles.saveClassesBtn}`}
							type="submit"
							disabled={loading}
						>
							{loading ? "Creating..." : "Comfirm"}
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
								{m.name}: {m.message}
							</li>
						))}
					</ul>
				</div>
			)}

			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default BatchCreateClasses;
