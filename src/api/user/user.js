import httpClient from "@/api/httpClient";

const USERS_API_BASE = import.meta.env.VITE_USERS_API_URL;

export const getAllTeachers = async () => {
	const { data } = await httpClient.get(`${USERS_API_BASE}/teachers`);
	return Array.isArray(data) ? data : [];
};

export const removeTeacherRole = async (userId) => {
	if (!userId && userId !== 0) {
		throw new Error("userId is required to remove TEACHER role");
	}

	const { data } = await httpClient.delete(
		`${USERS_API_BASE}/${userId}/roles/TEACHER`,
	);
	return data;
};
