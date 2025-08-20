import { useState } from "react";
import { Plus, X } from "lucide-react";
import styles from "./BatchForm.module.css";

/**
 * Reusable batch form component for creating multiple items
 */
const BatchForm = ({
	title = "Add Items",
	fields = [],
	onSubmit,
	maxItems = 5,
	initialItem = {},
	submitLabel = "Submit",
	addLabel = "Add Item",
	className = "",
}) => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState([]);
	const [errorIndexes, setErrorIndexes] = useState(new Set());

	const handleInputChange = (index, field, value) => {
		const updated = [...items];
		updated[index][field] = value;
		setItems(updated);

		// Clear error if field is corrected
		if (errorIndexes.has(index) && value.trim()) {
			const updatedErrors = new Set(errorIndexes);
			updatedErrors.delete(index);
			setErrorIndexes(updatedErrors);
		}
	};

	const addRow = () => {
		if (items.length < maxItems) {
			setItems([...items, { ...initialItem }]);
		}
	};

	const removeRow = (index) => {
		setItems(items.filter((_, i) => i !== index));
		// Clear any error for removed item
		const updatedErrors = new Set(errorIndexes);
		updatedErrors.delete(index);
		setErrorIndexes(updatedErrors);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (items.length === 0) return;

		setLoading(true);
		setMessages([]);
		setErrorIndexes(new Set());

		try {
			const result = await onSubmit(items);
			if (result.success) {
				setItems([]);
				setMessages(result.messages || []);
			} else {
				setMessages(result.messages || []);
				setErrorIndexes(new Set(result.errorIndexes || []));
			}
		} catch (error) {
			console.error("Batch form submission error:", error);
			setMessages([
				{ status: "error", message: "An error occurred while submitting." },
			]);
		} finally {
			setLoading(false);
		}
	};

	const hasValidInput = items.some((item) =>
		fields.some((field) => item[field.name]?.toString().trim())
	);

	return (
		<div className={`${styles.batchForm} ${className}`}>
			{title && <h3 className={styles.title}>{title}</h3>}

			<form onSubmit={handleSubmit}>
				{/* Add button */}
				<div className={styles.addButtonContainer}>
					<button
						type="button"
						onClick={addRow}
						disabled={items.length >= maxItems}
						className={styles.addButton}
						title={
							items.length >= maxItems
								? `Maximum ${maxItems} items allowed`
								: addLabel
						}
					>
						<Plus size={20} />
					</button>
					{items.length >= maxItems && (
						<p className={styles.limitMessage}>
							Maximum of {maxItems} items can be added at once
						</p>
					)}
				</div>

				{/* Form rows */}
				{items.map((item, index) => (
					<div
						key={index}
						className={`${styles.formRow} ${
							errorIndexes.has(index) ? styles.errorRow : ""
						}`}
					>
						{/* Fields */}
						{fields.map((field) => (
							<div key={field.name} className={styles.fieldContainer}>
								{field.type === "select" ? (
									<select
										value={item[field.name] || ""}
										onChange={(e) =>
											handleInputChange(index, field.name, e.target.value)
										}
										className={styles.input}
										required={field.required}
									>
										<option value="">
											{field.placeholder || `Select ${field.label}`}
										</option>
										{field.options?.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								) : (
									<input
										type={field.type || "text"}
										placeholder={field.placeholder || field.label}
										value={item[field.name] || ""}
										onChange={(e) =>
											handleInputChange(index, field.name, e.target.value)
										}
										className={styles.input}
										required={field.required}
									/>
								)}
							</div>
						))}

						{/* Remove button */}
						<button
							type="button"
							onClick={() => removeRow(index)}
							className={styles.removeButton}
							title="Remove this item"
						>
							<X size={16} />
						</button>
					</div>
				))}

				{/* Submit button */}
				{items.length > 0 && (
					<button
						type="submit"
						disabled={loading || !hasValidInput}
						className={styles.submitButton}
					>
						{loading ? "Submitting..." : submitLabel}
					</button>
				)}

				{/* Messages */}
				{messages.length > 0 && (
					<div className={styles.messages}>
						{messages.map((msg, index) => (
							<div
								key={index}
								className={`${styles.message} ${styles[msg.status]}`}
							>
								{msg.email ? `${msg.email}: ` : ""}
								{msg.message}
							</div>
						))}
					</div>
				)}
			</form>
		</div>
	);
};

export default BatchForm;
