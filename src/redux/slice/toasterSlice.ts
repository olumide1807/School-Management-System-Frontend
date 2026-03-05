import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

// toasts slice
const toastSlice = createSlice({
	name: "toasts",
	initialState,
	reducers: {
		toastMessage: (state, { payload }) => {
			state.push({
				text: payload.text,
				messageType: payload.messageType,
				isOpen: true,
				id: payload.id,
			});
		},
		hideToast: (state, { payload }) => {
			state = state.map((toast) => {
				if (toast.id === payload) {
					toast.isOpen = false;
				}
				return toast;
			});
		},
		removeToast: (state, { payload }) => {
			let index = state.findIndex((el) => el.id === payload);
			state.splice(index, 1);
		},
	},
});

const { actions, reducer } = toastSlice;
export const { toastMessage, removeToast, hideToast } = actions;
export const selectToasts = (state) => state.toasts;

export default reducer;
