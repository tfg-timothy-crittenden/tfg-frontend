import httpClient from "@/api/httpClient";

const CLASSROOMS_API_BASE = import.meta.env.VITE_CLASSROOMS_API_URL;

if (!CLASSROOMS_API_BASE) {
	throw new Error(
		"VITE_CLASSROOMS_API_URL is not set. Please set it in your .env file to the full backend API URL.",
	);
}

// --- Utility Normalizers ---
const normalizeRole = (payload) => {
	//Guard against roles coming back as lowercase or mixed case strings, or missing entirely
	if (typeof payload?.role === "string") return payload.role.toUpperCase();
	return null;
};

// --- Classroom CRUD ---
export async function createClassroom(classroomName, classroomDescription) {
	const { data } = await httpClient.post(
		`${CLASSROOMS_API_BASE}`,
		classroomName,
		classroomDescription,
	);
	return data;
}

export async function deleteClassroom(classroomId) {
	const { data } = await httpClient.delete(
		`${CLASSROOMS_API_BASE}/${classroomId}`,
	);
	return data;
}

export async function batchDeleteClassrooms(classroomIds) {
	const { data } = await httpClient.delete(`${CLASSROOMS_API_BASE}/batch`, {
		data: { classroomIds },
	});
	return data;
}

export async function getAllClassroomSummaries() {
	const { data } = await httpClient.get(`${CLASSROOMS_API_BASE}`);
	return data || [];
}

export async function getClassroomSummariesByUserId(userId) {
	if (!userId && userId !== 0)
		throw new Error("userId is required to fetch classroom summaries");
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/summary/member/${userId}`,
	);
	return data || [];
}

// --- Class Members ---
export async function getClassMembers(classroomId) {
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/members`,
	);
	return {
		teachers: data?.teachers || [],
		students: data?.students || [],
	};
}

export async function joinClassByCode(joinCode) {
	const { data } = await httpClient.post(`${CLASSROOMS_API_BASE}/join`, {
		joinCode,
	});
	return data;
}

export async function removeStudentsFromClass(classroomId, studentIds) {
	const { data } = await httpClient.post(
		`${CLASSROOMS_API_BASE}/${classroomId}/remove-students`,
		{ studentIds },
	);
	return data;
}

export async function getClassroomMemberRole(classroomId, memberId) {
	if (!classroomId || !memberId)
		throw new Error("classroomId and memberId are required");
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/members/${memberId}/role`,
	);
	return normalizeRole(data);
}

// --- Materials ---
export async function updateClassroomMaterials(classroomId, materials) {
	if (!classroomId || !Array.isArray(materials))
		throw new Error("classroomId and materials array are required");
	const { data } = await httpClient.put(
		`${CLASSROOMS_API_BASE}/${classroomId}/materials`,
		{ materials },
	);
	return data || [];
}

export async function getClassroomMaterialListByRole(classroomId, role) {
	const normalizedRole = String(role || "").toUpperCase();
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/materials/role/${normalizedRole}`,
	);
	return data || [];
}

// --- Teachers & Students ---
export async function getClassroomTeachers(classroomId) {
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/members/teachers`,
	);
	return data || [];
}

export async function getClassroomStudents(classroomId) {
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/members/students`,
	);
	return data || [];
}

export async function assignTeachersToClass(classroomId, teachers) {
	const { data } = await httpClient.put(
		`${CLASSROOMS_API_BASE}/${classroomId}/teachers`,
		{ teachers },
	);
	return data;
}

// --- Join code ---
export async function getClassroomJoinCode(classroomId) {
	const { data } = await httpClient.get(
		`${CLASSROOMS_API_BASE}/${classroomId}/join-code`,
	);
	return data || null;
}
