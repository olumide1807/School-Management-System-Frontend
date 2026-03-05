/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  current: {},
  all: [],
};

const feeBreakdownSlice = createSlice({
  name: "feeBreakdown",
  initialState,
  reducers: {
    setCurrent: (state, { payload: data }) => {
      state.current = data;
    },
    setAll: (state, { payload: data }) => {
      state.all = data;
    },
  },
});

const { actions, reducer } = feeBreakdownSlice;
export const { setCurrent, setAll } = actions;

export const selectCurrent = (state) => state.current;
export const selectAll = (state) => state.all;

export default reducer;
