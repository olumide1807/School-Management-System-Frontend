/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  slideNo: 1,
};

const academicSlide = createSlice({
  name: "slides",
  initialState,
  reducers: {
    setSlide: (state, { payload: data }) => {
      state.slideNo = data;
    },
  },
});

const { actions, reducer } = academicSlide;
export const { setSlide } = actions;

export const selectSlideNo = (state) => state.slideNo;

export default reducer;
