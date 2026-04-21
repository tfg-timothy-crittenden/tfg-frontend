import httpClient from "@/api/httpClient";

export const checkEmailExists = async (email) => {
	if (!email) return false;
	const res = await httpClient.get(
		`/student/check-email?email=${encodeURIComponent(email)}`,
	);
	return res.data.exists;
};

const USERS_API_BASE = import.meta.env.VITE_USERS_API_URL;

export const getAllTeachers = async () => {
	const { data } = await httpClient.get(`${USERS_API_BASE}/teachers`);
	return Array.isArray(data) ? data : [];
};
