import type { AxiosError, AxiosRequestConfig } from "axios";

import httpClient from "@/api/httpClient";

const API_ROUTES = [
	{
		prefix: "/api/classrooms",
		envName: "VITE_CLASSROOMS_API_URL",
		baseUrl: import.meta.env.VITE_CLASSROOMS_API_URL,
	},
	{
		prefix: "/users/api/auth",
		envName: "VITE_AUTH_API_URL",
		baseUrl: import.meta.env.VITE_AUTH_API_URL || "/users/api/auth",
	},
	{
		prefix: "/users/api/users",
		envName: "VITE_USERS_API_URL",
		baseUrl: import.meta.env.VITE_USERS_API_URL,
	},
	{
		prefix: "/api/toefl-speaking",
		envName: "VITE_TOEFL_SPEAKING_API_URL",
		baseUrl: import.meta.env.VITE_TOEFL_SPEAKING_API_URL,
	},
	{
		prefix: "/api/storage",
		envName: "VITE_STORAGE_API_URL",
		baseUrl: import.meta.env.VITE_STORAGE_API_URL,
	},
] as const;

const assertBaseUrl = (baseUrl: string | undefined, envName: string) => {
	if (!baseUrl) {
		throw new Error(
			`${envName} is not set. Please configure it in your .env file to match the backend API base URL.`,
		);
	}

	return baseUrl.replace(/\/$/, "");
};

const resolveRequestUrl = (url: string) => {
	const route = API_ROUTES.find(({ prefix }) => url.startsWith(prefix));

	if (!route) {
		return url;
	}

	return `${assertBaseUrl(route.baseUrl, route.envName)}${url.slice(
		route.prefix.length,
	)}`;
};

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
	const url = resolveRequestUrl(config.url ?? "");

	return httpClient
		.request<T>({
			...config,
			url,
		})
		.then(({ data }) => data);
};

export default customInstance;

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
