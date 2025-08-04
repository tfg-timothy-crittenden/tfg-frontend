import axios from "axios";

// Create Axios instance
const baseURL = import.meta.env.VITE_API_URL;

const httpClient = axios.create({
	baseURL: baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Function to update headers with the token
export const setAuthHeaders = (token) => {
	if (token) {
		httpClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		delete httpClient.defaults.headers.common["Authorization"];
	}
};

// Allow external injection of logout logic
let onLogout = () => {};

export const setLogoutHandler = (handler) => {
	onLogout = handler;
};

// Intercept 401s and trigger logout - useful for detecting token expiration and handling it globally
httpClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			onLogout(); // Call injected handler
		}
		return Promise.reject(error);
	}
);

export default httpClient;
