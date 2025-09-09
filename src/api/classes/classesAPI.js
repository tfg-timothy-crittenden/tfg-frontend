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

export async function removeStudentsFromClass(classroomId, studentIds) {
	const { data } = await httpClient.post(
		`/classrooms/${classroomId}/remove-students`,
		{ studentIds }
	);
	return data;
}

/**
 * Get teachers for a classroom
 * @param {number|string} classroomId
 * @returns {Promise<Array>} teachers
 */
export async function getClassroomTeachers(classroomId) {
	const { data } = await httpClient.get(`/classrooms/${classroomId}/teachers`);
	return data?.teachers || [];
}

/**
 * Get students for a classroom
 * @param {number|string} classroomId
 * @returns {Promise<Array>} students
 */
export async function getClassroomStudents(classroomId) {
	const { data } = await httpClient.get(`/classrooms/${classroomId}/students`);
	return data?.students || [];
}
