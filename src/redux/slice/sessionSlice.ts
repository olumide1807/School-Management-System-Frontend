import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import SERVER from "../../Utils/server";
import { toast } from 'react-toastify';
import { toastOptions } from "../../Utils/toastOptions";

const initialState = {
    session: null,
    status: 'idle',
    error: false,
}


export const submitSession = createAsyncThunk(
    'session/submitSession',
    async (sessionData, { rejectWithValue }) => {
      try {
        const res = await SERVER.post('session/create', sessionData);
        console.log(res.data)
        return res.data;
      } catch (error) {
        return rejectWithValue(error);
      }

    }
  
);

const sessionSlice = createSlice({
    name: "session",
    initialState,

    reducers: {
      createSession: (state, action) => {
        return { ...state, ...action.payload };
      },
    },

    extraReducers: (builder) => {
        builder
            .addCase(submitSession.pending, (state) => {
                state.status = 'pending';
              })
            .addCase(submitSession.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.session = action.payload;
                toast.success('Session created successfully!', { toastOptions })
            })
            .addCase(submitSession.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload;
                toast.error('Error creating session, Plases try again later', { toastOptions })
            })
    
          }
      });

export const { createSession } = sessionSlice.actions

export default sessionSlice.reducer;
