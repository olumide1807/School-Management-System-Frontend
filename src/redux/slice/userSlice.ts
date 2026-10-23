import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: sessionStorage.getItem("token") || null,
    token: sessionStorage.getItem("token") || null,
    role: sessionStorage.getItem("userRole") || null,
    user: JSON.parse(sessionStorage.getItem("userData") || "null"),
    loading: false,
    error: false,
    // Why the last sign-in failed (see LoginFailureKind in apiCall), and
    // the server's own message when it sent one
    errorKind: null as string | null,
    errorMessage: null as string | null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = false;
            state.errorKind = null;
            state.errorMessage = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.currentUser = action.payload.token;
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.user = action.payload.user;
            state.error = false;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = true;
            state.errorKind = action.payload?.kind ?? "unexpected";
            state.errorMessage = action.payload?.message ?? null;
        },
        logout: (state) => {
            state.currentUser = null;
            state.token = null;
            state.role = null;
            state.user = null;
            state.loading = false;
            state.error = false;
            state.errorKind = null;
            state.errorMessage = null;
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("userRole");
            sessionStorage.removeItem("userData");
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = userSlice.actions;
export default userSlice.reducer;