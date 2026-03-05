/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search: "",
  result: "",
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearch: (state, { payload: search }) => {
      state.search = search;
    },
    setResult: (state, { payload: result }) => {
      state.result = result;
    },
  },
});

const { actions, reducer } = searchSlice;
export const { setSearch, setResult } = actions;

export const selectSearch = (state) => state.search;
export const selectResult = (state) => state.result;

export default reducer;
