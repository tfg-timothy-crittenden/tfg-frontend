// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginRequest, meRequest } from "@/api/auth/authAPI";
import { setAuthHeaders } from "@/api/httpClient";

const initialToken = localStorage.getItem("token");

if (initialToken) {
	setAuthHeaders(initialToken);
}

const initialState = {
	user: null,
	token: initialToken || null,
	status: "idle",
	error: null,
};

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
				err.response?.data?.message || "Login failed"
			);
		}
	}
);

export const fetchMe = createAsyncThunk("auth/me", async (_, thunkAPI) => {
	try {
		const { user } = await meRequest(); // ✅ Destructure here
		return user;
	} catch (err) {
		console.error("fetchMe failed:", err);
		return thunkAPI.rejectWithValue("Failed to fetch user info");
	}
});

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		logout: (state) => {
			state.user = null;
			state.token = null;
			localStorage.removeItem("token");
			setAuthHeaders(null);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(login.pending, (state) => {
				state.status = "loading";
			})
			.addCase(login.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.error = null;
			})
			.addCase(login.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload;
			})
			.addCase(fetchMe.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchMe.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.user = action.payload;
				state.error = null;
			})
			.addCase(fetchMe.rejected, (state, action) => {
				state.status = "failed";
				state.user = null;
				state.token = null;
				localStorage.removeItem("token");
				state.error = action.payload;
			});
	},
});

export const { logout } = authSlice.actions;
export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectUserRole = (state) => state.auth.user?.role;
export default authSlice.reducer;
