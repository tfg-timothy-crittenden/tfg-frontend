import { inviteTeacherToPlatform } from "@/api/auth/authAPI";
import { BatchForm } from "@/components/AdminList";

const BatchInviteTeachers = ({ onInviteComplete }) => {
	const handleSubmit = async (teachers) => {
		const results = [];
		const failedIndexes = [];

		for (let i = 0; i < teachers.length; i++) {
			const teacher = teachers[i];

			// Validation
			if (
				!teacher.firstName?.trim() ||
				!teacher.surname?.trim() ||
				!teacher.email?.trim()
			) {
				results.push({
					email: teacher.email || "(blank)",
					status: "error",
					message: "First name, surname and email are required.",
				});
				failedIndexes.push(i);
				continue;
			}

			try {
				const teacherData = {
					name: `${teacher.firstName.trim()} ${teacher.surname.trim()}`,
					email: teacher.email,
				};
				await inviteTeacherToPlatform(teacherData.email);
				results.push({
					email: teacher.email,
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
			name: "firstName",
			label: "First Name",
			placeholder: "First name",
			type: "text",
			required: true,
		},
		{
			name: "surname",
			label: "Surname",
			placeholder: "Surname",
			type: "text",
			required: true,
		},
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
			initialItem={{ firstName: "", surname: "", email: "" }}
			submitLabel="Send Invitations"
			addLabel="Add Teacher"
		/>
	);
};

export default BatchInviteTeachers;
