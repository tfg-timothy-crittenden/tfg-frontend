import { createClassroom } from "@/api/classes/classesAPI";
import { BatchForm } from "@/components/AdminList";

const BatchCreateClasses = ({ onClassCreated }) => {
	const handleSubmit = async (classes) => {
		const results = [];
		const failedIndexes = [];

		for (let i = 0; i < classes.length; i++) {
			const cls = classes[i];

			// Validation
			if (!cls.name?.trim()) {
				results.push({
					status: "error",
					message: `Row ${i + 1}: Class name is required.`,
				});
				failedIndexes.push(i);
				continue;
			}

			try {
				await createClassroom({
					name: cls.name.trim(),
					subject: cls.subject?.trim() || "",
				});
				results.push({
					status: "success",
					message: `Class "${cls.name}" created successfully.`,
				});
			} catch (err) {
				console.error("Failed to create class:", err);
				results.push({
					status: "error",
					message: `Failed to create class "${cls.name}": ${
						err.message || "Unknown error"
					}`,
				});
				failedIndexes.push(i);
			}
		}

		// Refresh parent component if any classes were created successfully
		if (failedIndexes.length !== classes.length && onClassCreated) {
			onClassCreated();
		}

		return {
			success: failedIndexes.length === 0,
			messages: results,
			errorIndexes: failedIndexes,
		};
	};

	const fields = [
		{
			name: "name",
			label: "Class Name",
			placeholder: "Enter class name",
			type: "text",
			required: true,
		},
		{
			name: "subject",
			label: "Subject",
			placeholder: "Enter subject (optional)",
			type: "text",
			required: false,
		},
	];

	return (
		<BatchForm
			title="Create New Classes"
			fields={fields}
			onSubmit={handleSubmit}
			maxItems={5}
			initialItem={{ name: "", subject: "" }}
			submitLabel="Create Classes"
			addLabel="Add Class"
		/>
	);
};

export default BatchCreateClasses;
