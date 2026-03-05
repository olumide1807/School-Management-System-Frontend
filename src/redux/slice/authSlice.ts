/* eslint-disable no-unused-vars */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import SERVER from "../../Utils/server";
import { toast } from 'react-toastify'
import { toastOptions } from "../../Utils/toastOptions";

const initialState = {
    token: sessionStorage.getItem('token') || null,
    status: 'idle',
    error: false
};

const login = createAsyncThunk(
	'auth/login',
	async (user, { rejectWithValues }) => {
		try {
			const res = await SERVER.post('superadmin/login', user);
			const token = res.data.token;
			sessionStorage.setItem('token', token)
			return token;
		} catch (error) {
			return rejectWithValues(error);
		}
	}
)

// auth slice
const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setToken: (state, action) => {
			state.token = action.payload;
		}
	},

	extraReducers: (builder) => {
		builder
			.addCase(login.pending, (state) => {
				state.status = 'pending';
			})
		builder
			.addCase(login.fulfilled, (state) => {
				state.status = 'succeeded';
				state.token = action.payload;
				toast.success('Login successfully!', {toastOptions})
			})
		builder
			.addCase(login.rejected, (state) => {
				state.status = 'failed';
				toast.success('Failed to login in!', {toastOptions})
			})
	}
});

export const { setToken } = authSlice.actions;

export default authSlice.reducer;
