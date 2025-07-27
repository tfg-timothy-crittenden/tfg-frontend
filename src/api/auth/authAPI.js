// src/api/auth.js
import httpClient from "@/api/httpClient";

export const loginRequest = async (credentials) => {
	const response = await httpClient.post("/auth/login", credentials);
	console.log("loginRequest response:", response.data); // <- log here
	return response.data;
};

export const meRequest = async () => {
	const response = await httpClient.get("/auth/me");
	console.log("meRequest response:", response.data); // <- log here
	return response.data;
};
