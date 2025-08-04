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
