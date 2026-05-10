import { inviteTeacherToPlatform } from "@/api/auth/authAPI";
import { BatchForm } from "@/components/AdminList";

const BatchInviteTeachers = ({ onInviteComplete }) => {
	const handleSubmit = async (teachers) => {
		const results = [];
		const failedIndexes = [];

		for (let i = 0; i < teachers.length; i++) {
			const teacher = teachers[i];

			// Validation
			if (!teacher.email?.trim()) {
				results.push({
					email: teacher.email || "(blank)",
					status: "error",
					message: "Email is required.",
				});
				failedIndexes.push(i);
				continue;
			}

			try {
				await inviteTeacherToPlatform(teacher.email.trim());
				results.push({
					email: teacher.email.trim(),
					status: "success",
					message: "Invitation sent successfully.",
				});
			} catch (err) {
				console.error("Failed to invite teacher:", err);

				const errorPayload = err?.response?.data;

				// Prioritize backend message from error payload shape.
				const errorMessage =
					errorPayload?.message ||
					(errorPayload?.status && errorPayload?.error
						? `${errorPayload.status} ${errorPayload.error}`
						: null) ||
					err.message ||
					"Failed to send invitation.";

				results.push({
					email: teacher.email,
					status: "error",
					message: errorMessage,
				});
				failedIndexes.push(i);
			}
		}

		// Refresh parent component if any invitations were sent successfully
		if (failedIndexes.length !== teachers.length && onInviteComplete) {
			onInviteComplete();
		}

		return {
			success: failedIndexes.length === 0,
			messages: results,
			errorIndexes: failedIndexes,
		};
	};

	const fields = [
		{
			name: "email",
			label: "Email",
			placeholder: "Email",
			type: "email",
			required: true,
		},
	];

	return (
		<BatchForm
			title="Invite New Teachers"
			fields={fields}
			onSubmit={handleSubmit}
			maxItems={5}
			initialItem={{ email: "" }}
			submitLabel="Send Invitations"
			addLabel="Add Teacher"
		/>
	);
};

export default BatchInviteTeachers;
