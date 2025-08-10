import httpClient from "@/api/httpClient";

export async function getClassMembers(classroomId) {
	const { data } = await httpClient.get(`/classrooms/${classroomId}/members`);
	// normalize empty arrays
	return {
		teachers: data?.teachers || [],
		students: data?.students || [],
	};
}
