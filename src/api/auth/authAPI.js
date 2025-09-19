// src/api/auth.js
import httpClient from "@/api/httpClient";

export const loginRequest = async (credentials) => {
	const response = await httpClient.post("/auth/login", credentials);

	return response.data;
};

export const meRequest = async () => {
	const response = await httpClient.get("/auth/me");

	return response.data;
};

export const resetPasswordRequest = async (email) => {
	// Always returns 200 with a generic message
	const { data } = await httpClient.post("/auth/password-reset/request", {
		email,
	});
	return data;
};

export const validateResetToken = async (token) => {
	const { data } = await httpClient.get("/auth/password-reset/validate", {
		params: { token },
	});
	return data; // { valid: boolean }
};

export const confirmPasswordReset = async (token, password) => {
	const { data } = await httpClient.post("/auth/password-reset/confirm", {
		token,
		password,
	});
	return data; // { message, token, user }
};
