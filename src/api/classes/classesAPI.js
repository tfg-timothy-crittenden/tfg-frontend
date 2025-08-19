import httpClient from "@/api/httpClient";

export async function getClassMembers(classroomId) {
	const { data } = await httpClient.get(`/classrooms/${classroomId}/members`);
	// normalize empty arrays
	return {
		teachers: data?.teachers || [],
		students: data?.students || [],
	};
}

export async function joinClassByCode(classCode) {
	const { data } = await httpClient.post("/classrooms/join", { classCode });
	// recommended backend response: { message, classroomId }
	return data;
}
