import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: sessionStorage.getItem("token") || null,
    token: sessionStorage.getItem("token") || null,
    role: sessionStorage.getItem("userRole") || null,
    user: JSON.parse(sessionStorage.getItem("userData") || "null"),
    loading: false,
    error: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = false;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.currentUser = action.payload.token;
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.user = action.payload.user;
            state.error = false;
        },
        loginFailure: (state) => {
            state.loading = false;
            state.error = true;
        },
        logout: (state) => {
            state.currentUser = null;
            state.token = null;
            state.role = null;
            state.user = null;
            state.loading = false;
            state.error = false;
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("userRole");
            sessionStorage.removeItem("userData");
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = userSlice.actions;
export default userSlice.reducer;