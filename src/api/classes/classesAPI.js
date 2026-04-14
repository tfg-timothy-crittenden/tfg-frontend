import httpClient from "@/api/httpClient";

const CLASSROOMS_API_BASE =
	import.meta.env.VITE_CLASSROOMS_API_URL || "/classrooms/api/classrooms";

const getRequestConfig = () => ({
	// Override shared /users/api baseURL so classroom calls hit the classrooms proxy path.
	baseURL: "",
});

const normalizeRole = (payload) => {
	if (typeof payload === "string") return payload.toUpperCase();
	if (typeof payload?.role === "string") return payload.role.toUpperCase();
	if (typeof payload?.memberRole === "string") {
		return payload.memberRole.toUpperCase();
	}
	return null;
};

const normalizeMaterialList = (payload) => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.materials)) return payload.materials;
	if (Array.isArray(payload?.items)) return payload.items;
	if (Array.isArray(payload?.content)) return payload.content;
	if (Array.isArray(payload?.data)) return payload.data;
	return [];
};

//Returns a summary of all the classrooms, with the teachers and the student count.
export async function getAllClassroomSummaries() {
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}`,
		getRequestConfig(),
	);
	return data || [];
}

//Checks the role of a user in a classroom, returns "TEACHER", "STUDENT", or null if no role.
export async function getClassroomMemberRole(classroomId, memberId) {
	if (!classroomId || !memberId) {
		throw new Error("classroomId and memberId are required");
	}

	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/members/${memberId}/role`,
		getRequestConfig(),
	);

	return normalizeRole(data);
}

// Updates the materials assigned to a classroom via upsert.
export async function updateClassroomMaterials(classroomId, materials) {
	if (!classroomId || !Array.isArray(materials)) {
		throw new Error("classroomId and materials array are required");
	}

	const { data } = await httpClient.put(
		`${CLASSROOMS_API_BASE}/${classroomId}/materials`,
		{ materials },
		getRequestConfig(),
	);
	return data || [];
}

// Gets the list of a classroom's assigned materials for a specific role (TEACHER or STUDENT).
export async function getClassroomMaterialListByRole(classroomId, role) {
	const normalizedRole = String(role || "").toUpperCase();
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/materials/role/${normalizedRole}`,
		getRequestConfig(),
	);
	return normalizeMaterialList(data);
}

// Gets the full list of a classroom's assigned materials across all roles.
export async function getClassroomMaterialList(classroomId) {
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/materials`,
		getRequestConfig(),
	);
	return data || [];
}

// Gets the list of classrooms for which a specific user is a member.
export async function getClassroomSummariesByUserId(userId) {
	if (userId === undefined || userId === null || userId === "") {
		throw new Error("userId is required to fetch classroom summaries");
	}

	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/summary/member/${userId}`,
		getRequestConfig(),
	);
	return data ? data : [];
}

//
export async function getClassMembers(classroomId) {
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/members`,
		getRequestConfig(),
	);
	// normalize empty arrays
	return {
		teachers: data?.teachers || [],
		students: data?.students || [],
	};
}

export async function joinClassByCode(classCode) {
	const { data } = await httpClient.post(
		`${CLASSROOMS_API_BASE}/join`,
		{
			classCode,
		},
		getRequestConfig(),
	);
	// recommended backend response: { message, classroomId }
	return data;
}

export async function removeStudentsFromClass(classroomId, studentIds) {
	const { data } = await httpClient.post(
		`${CLASSROOMS_API_BASE}/${classroomId}/remove-students`,
		{ studentIds },
		getRequestConfig(),
	);
	return data;
}

/**
 * Get teachers for a classroom
 * @param {number|string} classroomId
 * @returns {Promise<Array>} teachers
 */
export async function getClassroomTeachers(classroomId) {
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/teachers`,
		getRequestConfig(),
	);
	return data?.teachers || [];
}

/**
 * Get students for a classroom
 * @param {number|string} classroomId
 * @returns {Promise<Array>} students
 */
export async function getClassroomStudents(classroomId) {
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/students`,
		getRequestConfig(),
	);
	return data?.students || [];
}
