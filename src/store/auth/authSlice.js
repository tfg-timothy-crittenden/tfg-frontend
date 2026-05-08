// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginRequest, meRequest } from "@/api/auth/authAPI";
import { setAuthHeaders } from "@/api/httpClient";

const API_BASE = import.meta.env.VITE_API_URL || "/users/api";

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
	userStatus: null, // For email-based auth method checking
};

const normalizeRoleValue = (role) =>
	String(role || "")
		.trim()
		.toLowerCase()
		.replace(/^role_/, "");

const extractRolesFromUser = (user) => {
	if (!user || typeof user !== "object") return [];

	if (Array.isArray(user.roles)) {
		return user.roles;
	}

	if (typeof user.role === "string") {
		return [user.role];
	}

	if (Array.isArray(user.authorities)) {
		return user.authorities.map((authority) => {
			if (typeof authority === "string") return authority;
			return authority?.authority || authority?.role || "";
		});
	}

	if (typeof user.authority === "string") {
		return [user.authority];
	}

	return [];
};

// --- Existing thunks (unchanged) ---
export const login = createAsyncThunk(
	"auth/login",
	async (credentials, thunkAPI) => {
		try {
			const { token, user } = await loginRequest(credentials);
			localStorage.setItem("token", token);
			setAuthHeaders(token);
			return { user, token };
		} catch (err) {
			return thunkAPI.rejectWithValue(
				err?.response?.data?.error || err?.message || "Login failed",
			);
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

// --- New OAuth-related thunks ---
export const checkUserStatus = createAsyncThunk(
	"auth/checkUserStatus",
	async (email, { rejectWithValue }) => {
		try {
			const response = await fetch(`${API_BASE}/auth/status/${email}`);
			const data = await response.json();

			if (!response.ok) {
				return rejectWithValue(data.message || "Failed to check user status");
			}

			return data;
		} catch (error) {
			return rejectWithValue(error.message);
		}
	},
);

// Handle OAuth callback (for when teachers return from Microsoft)
export const handleOAuthCallback = createAsyncThunk(
	"auth/oauthCallback",
	async ({ token, user }, { rejectWithValue }) => {
		try {
			if (!token || !user) {
				return rejectWithValue("Missing OAuth callback data");
			}

			const userData = typeof user === "string" ? JSON.parse(user) : user;

			localStorage.setItem("token", token);
			localStorage.setItem("user", JSON.stringify(userData));
			setAuthHeaders(token);

			return { token, user: userData };
		} catch (error) {
			return rejectWithValue("Failed to process OAuth callback");
		}
	},
);

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		// existing: lets us set token+user directly (used after email verification)
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
			state.userStatus = null;
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			setAuthHeaders(null);
		},
		clearError: (state) => {
			state.error = null;
		},
		resetUserStatus: (state) => {
			state.userStatus = null;
		},
		// For handling OAuth redirects
		initiateOAuthLogin: (state, action) => {
			const { provider } = action.payload;
			state.status = "loading";
			state.error = null;
			// Redirect will happen in component
		},
	},
	extraReducers: (builder) => {
		builder
			// Existing login cases
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
				state.error = action.payload;
			})
			// Existing fetchMe cases
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
			})
			// New OAuth cases
			.addCase(checkUserStatus.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(checkUserStatus.fulfilled, (state, action) => {
				state.status = "idle";
				state.userStatus = action.payload;
				state.error = null;
			})
			.addCase(checkUserStatus.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload;
			})
			.addCase(handleOAuthCallback.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(handleOAuthCallback.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.error = null;
			})
			.addCase(handleOAuthCallback.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const {
	logout,
	setCredentials,
	clearError,
	resetUserStatus,
	initiateOAuthLogin,
} = authSlice.actions;

// selectors (unchanged)
export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectUsername = (state) => state.auth.user?.username || "Guest";
export const selectUserRoles = (state) => extractRolesFromUser(state.auth.user);
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

// New OAuth-related selectors
export const selectUserStatus = (state) => state.auth.userStatus;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
