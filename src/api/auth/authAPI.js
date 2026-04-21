import httpClient from "@/api/httpClient";

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || "/users/api/auth";

export const loginRequest = async (credentials) => {
	const response = await httpClient.post(`${AUTH_BASE_URL}/login`, credentials);
	return response.data;
};

export const meRequest = async () => {
	const response = await httpClient.get(`${AUTH_BASE_URL}/me`);
	return response.data;
};

export const resetPasswordRequest = async (email) => {
	// Always returns 200 with a generic message
	const { data } = await httpClient.post(
		`${AUTH_BASE_URL}/password-reset/request`,
		{
			email,
		},
	);
	return data;
};

export const validateResetToken = async (token) => {
	const { data } = await httpClient.get(
		`${AUTH_BASE_URL}/password-reset/validate`,
		{
			params: { token },
		},
	);
	return data; // { valid: boolean }
};

export const confirmPasswordReset = async (token, password) => {
	const { data } = await httpClient.post(
		`${AUTH_BASE_URL}/password-reset/confirm`,
		{
			token,
			password,
		},
	);
	return data; // { message, token, user }
};
