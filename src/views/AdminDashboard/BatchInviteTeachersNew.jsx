import { inviteTeacher } from "@/api/admin/admin";
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

			if (!teacher.email.endsWith("@fundaciocic.org")) {
				results.push({
					email: teacher.email,
					status: "error",
					message: "Email must end with @fundaciocic.org",
				});
				failedIndexes.push(i);
				continue;
			}

			try {
				// Combine firstName and surname into name for server
				const teacherData = {
					name: `${teacher.firstName.trim()} ${teacher.surname.trim()}`,
					email: teacher.email,
				};
				await inviteTeacher(teacherData);
				results.push({
					email: teacher.email,
					status: "success",
					message: "Invitation sent successfully.",
				});
			} catch (err) {
				console.error("Failed to invite teacher:", err);
				results.push({
					email: teacher.email,
					status: "error",
					message: err.message || "Failed to send invitation.",
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
			placeholder: "Email (must end with @fundaciocic.org)",
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
