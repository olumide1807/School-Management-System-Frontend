import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: sessionStorage.getItem('token') || null,
        loading: false,
        error: false
    },
    reducers: {
        loginStart: (state)=>{
            state.loading = true;
            state.currentUser = null;
            state.error = false
        },
        loginSuccess: (state, action)=>{
            state.loading = false;
            state.currentUser = action.payload;
            state.error = false
        },
        loginFailure: (state)=>{
            state.loading = false;
            state.error = true;
            state.currentUser = null;
        },
        logout: (state) => {
            state.currentUser = null;
            state.error = false;
            state.loading = false
        }
    }
})

export const { loginStart, loginSuccess, loginFailure, logout } = userSlice.actions;
export default userSlice.reducer
