import { useState } from "react";
import { createClass } from "@/api/admin/admin";

const BatchCreateClasses = ({ onClassCreated }) => {
	const [classes, setClasses] = useState([{ name: "", subject: "" }]);
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState([]);
	const [error, setError] = useState("");

	const handleInputChange = (index, field, value) => {
		const updated = [...classes];
		updated[index][field] = value;
		setClasses(updated);
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

		for (const c of classes) {
			if (!c.name) {
				results.push({
					name: c.name || "?",
					status: "error",
					message: "Class name is required.",
				});
				continue;
			}

			try {
				const res = await createClass(c);
				results.push({
					name: res.data.name,
					status: "success",
					message: "Class created.",
				});
			} catch (err) {
				results.push({
					name: c.name,
					status: "error",
					message: err.response?.data?.message || "Failed to create class.",
				});
			}
		}

		setMessages(results);
		setLoading(false);

		if (onClassCreated) {
			onClassCreated(); // refresh parent list
		}
	};

	return (
		<div style={{ maxWidth: "700px", margin: "0 auto", padding: "1rem" }}>
			<h2>Batch Create Classes</h2>

			<form onSubmit={handleSubmit}>
				{classes.map((cls, index) => (
					<div key={index} style={{ marginBottom: "1rem" }}>
						<input
							type="text"
							placeholder="Class Name"
							value={cls.name}
							onChange={(e) => handleInputChange(index, "name", e.target.value)}
							required
						/>
						<input
							type="text"
							placeholder="Subject (optional)"
							value={cls.subject}
							onChange={(e) =>
								handleInputChange(index, "subject", e.target.value)
							}
							style={{ marginLeft: "0.5rem" }}
						/>
						<button
							type="button"
							onClick={() => removeRow(index)}
							disabled={classes.length === 1}
							style={{ marginLeft: "0.5rem" }}
						>
							Remove
						</button>
					</div>
				))}

				<button type="button" onClick={addRow} style={{ marginRight: "1rem" }}>
					Add Row
				</button>

				<button type="submit" disabled={loading}>
					{loading ? "Creating..." : "Create Classes"}
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
