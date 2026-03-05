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
	async (user, { rejectWithValue }) => {
		try {
			const res = await SERVER.post('superadmin/login', user);
			const token = res.data.token;
			sessionStorage.setItem('token', token)
			return token;
		} catch (error) {
			return rejectWithValue(error);
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
		},
		logOut: (state) => {
			state.token = null;
			state.status = 'idle';
			state.error = false;
			sessionStorage.removeItem('token');
		}
	},

	extraReducers: (builder) => {
		builder
			.addCase(login.pending, (state) => {
				state.status = 'pending';
			})
		builder
			.addCase(login.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.token = action.payload;
				toast.success('Login successfully!', toastOptions)
			})
		builder
			.addCase(login.rejected, (state) => {
				state.status = 'failed';
				toast.error('Failed to login!', toastOptions)
			})
	}
});

export const { setToken, logOut } = authSlice.actions;

export default authSlice.reducer;