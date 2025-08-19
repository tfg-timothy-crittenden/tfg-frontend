import httpClient from "@/api/httpClient";

export const inviteTeacher = ({ name, email }) => {
	return httpClient.post("/admin/teachers/invite", {
		name,
		email,
	});
};

export const createClass = (classData) => {
	return httpClient.post("/admin/classes", classData);
};

export const deleteClass = (classId) => {
	return httpClient.delete(`/admin/classes/${classId}`);
};

export const fetchAllClassesAndTeachers = () => {
	return httpClient.get("/admin/classes");
};

export const assignTeachersToClass = (classId, teacherIds) => {
	return httpClient.post(`/admin/classes/${classId}/teachers`, {
		teacherIds,
	});
};

export const fetchAllTeachers = () => {
	return httpClient.get("/admin/all-teachers");
};

export const fetchInvitedTeachers = () => {
	return httpClient.get("/admin/invited-teachers");
};

export const fetchActiveTeachers = () => {
	return httpClient.get("/admin/active-teachers");
};

export const cancelInvite = (id) => {
	return httpClient.patch(`/admin/cancel-invite/${id}`);
};

export const resendInvite = (id) => {
	return httpClient.post(`/admin/resend-invite/${id}`);
};
