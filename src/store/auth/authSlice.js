// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginRequest, meRequest } from "@/domain/users/api/authApi";
import { setAuthHeaders } from "@/api/httpClient";

const initialToken = localStorage.getItem("token");
const initialUserFromStorage = (() => {
	try {
		const rawUser = localStorage.getItem("user");
		if (!rawUser) return null;
		return JSON.parse(rawUser);
	} catch {
		return null;
	}
})();

if (initialToken) setAuthHeaders(initialToken);

const initialState = {
	user: initialUserFromStorage,
	token: initialToken || null,
	status: "idle",
	error: null,
};

const normalizeRoleValue = (role = "") =>
	role.toLowerCase().replace(/^role_/, "");

const extractAuthErrorMessage = (payload, fallback = "Login failed") =>
	payload?.error || fallback;

const isEmailConfirmationError = (status, payload) =>
	status === 403 && payload?.error === "Please confirm your email";

export const login = createAsyncThunk(
	"auth/login",
	async (credentials, thunkAPI) => {
		try {
			const { token, user } = await loginRequest(credentials);
			localStorage.setItem("token", token);
			setAuthHeaders(token);
			return { user, token };
		} catch (err) {
			const payload = err?.response?.data;
			const message = extractAuthErrorMessage(payload, "Login failed");
			const status = err?.response?.status;
			return thunkAPI.rejectWithValue({
				message,
				status,
				email: payload?.email || "",
				shouldConfirmEmail: isEmailConfirmationError(status, payload),
			});
		}
	},
);

export const fetchMe = createAsyncThunk("auth/me", async (_, thunkAPI) => {
	try {
		const { user } = await meRequest();
		return user;
	} catch (err) {
		console.error("fetchMe failed:", err);
		return thunkAPI.rejectWithValue("Failed to fetch user info");
	}
});

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCredentials: (state, action) => {
			const { token, user } = action.payload || {};
			state.token = token || null;
			state.user = user || null;
			state.error = null;
			if (token) {
				localStorage.setItem("token", token);
				if (user) {
					localStorage.setItem("user", JSON.stringify(user));
				}
				setAuthHeaders(token);
			} else {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				setAuthHeaders(null);
			}
		},
		logout: (state) => {
			state.user = null;
			state.token = null;
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			setAuthHeaders(null);
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder

			.addCase(login.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(login.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.error = null;
				localStorage.setItem("user", JSON.stringify(action.payload.user));
			})
			.addCase(login.rejected, (state, action) => {
				state.status = "failed";
				state.error =
					typeof action.payload === "string"
						? action.payload
						: action.payload?.message || "Login failed";
			})

			.addCase(fetchMe.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchMe.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.user = action.payload;
				state.error = null;
				localStorage.setItem("user", JSON.stringify(action.payload));
			})
			.addCase(fetchMe.rejected, (state, action) => {
				state.status = "failed";
				state.user = null;
				state.token = null;
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				state.error = action.payload;
			});
	},
});

export const { logout, setCredentials, clearError } = authSlice.actions;

export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectUsername = (state) => state.auth.user?.username || "Guest";
export const selectUserRoles = (state) => state.auth.user?.roles || [];
export const selectUserRole = (state) => selectUserRoles(state)[0] || null;
export const selectHasRole = (roles) => (state) => {
	const normalizedUserRoles = selectUserRoles(state)
		.map((role) => normalizeRoleValue(role))
		.filter(Boolean);
	const normalizedRoles = (roles || [])
		.map((role) => normalizeRoleValue(role))
		.filter(Boolean);

	return normalizedRoles.some((role) => normalizedUserRoles.includes(role));
};

export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
