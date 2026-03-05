import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import SERVER from "../../Utils/server";
import { toast } from "react-toastify";
import { toastOptions } from "../../Utils/toastOptions";

const initialState = {
  details: {},
  status: "idle",
  error: false,
};

export const submitDetails = createAsyncThunk(
  "schoolDetails/submitDetails",
  async (details, { rejectWithValue }) => {
    try {
      const res = await SERVER.put("superadmin/update", details);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteAcctDetails = createAsyncThunk(
  "schoolDetails/deleteDetails",
  async (data, { rejectWithValue }) => {
    try {
      const res = await SERVER.delete("superadmin/bank", data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getSchDetails = createAsyncThunk(
  "schoolDetails/getSchDetails",
  async (_, { rejectWithValue }) => {
    try {
      const res = await SERVER.get("superadmin/account");
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const schoolDetailsSlice = createSlice({
  name: "schoolDetails",
  initialState,
  reducers: {
    setDetails: (state, action) => {
      state.details = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(submitDetails.pending, (state) => {
        state.status = "pending";
      })
      .addCase(submitDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.details = action.payload;
        toast.success("Successful!", toastOptions);
      })
      .addCase(submitDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error;
        toast.error("Failed!, Please try again later", toastOptions);
      })

      //delete details
      .addCase(deleteAcctDetails.pending, (state) => {
        state.status = "pending";
      })
      .addCase(deleteAcctDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.details = action.payload;
        toast.success("Successful!", toastOptions);
      })
      .addCase(deleteAcctDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error;
        toast.error("Failed!, Please try again later", toastOptions);
      })

      //get school account details
      .addCase(getSchDetails.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getSchDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.details = action.payload;
      })
      .addCase(getSchDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error;
      });
  },
});

export const { setDetails } = schoolDetailsSlice.actions;

export default schoolDetailsSlice.reducer;