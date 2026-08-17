import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/store/auth/authSlice";

const store = configureStore({
	reducer: {
		auth: authReducer,
	},
});

export default store;
