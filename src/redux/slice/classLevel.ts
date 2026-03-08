import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import SERVER from "../../Utils/server";
import { toast } from "react-toastify";
import { toastOptions } from "../../Utils/toastOptions";

const initialState = {
    classLevel: null,
    status: 'idle',
    error: false,
}


export const createClassLevel = createAsyncThunk('classLevel/createClassLevel',
     async (data, { rejectWithValue }) => {
        try {
            const res = await SERVER.post('class', data);
            return res.data;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data || error);
        }
    }
)

const classLevelSlice = createSlice({
    name: 'classLevel',
    initialState,

    reducers: {
        setClassLevel: (state, action) => {
            state.classLevel = action.payload;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(createClassLevel.pending, (state) => {
                state.status = 'pending';
                state.error = false;
            })
            .addCase(createClassLevel.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = false;
                state.classLevel = action.payload;
                toast.success('Class level created successfully!', toastOptions);
            })
            .addCase(createClassLevel.rejected, (state, action: any) => {
                state.status = 'failed';
                state.error = true;
                const errMsg = action.payload?.error || 'Failed to create class level';
                toast.error(errMsg, toastOptions);
            })
    }
})

export const { setClassLevel } = classLevelSlice.actions;

export default classLevelSlice.reducer;