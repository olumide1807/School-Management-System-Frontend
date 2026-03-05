import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import SERVER from "../../Utils/server";

const initialState = {
    classLevel: null,
    status: 'idle',
    error: false,
}


export const createClassLevel = createAsyncThunk('classLevel/createClassLevel',
     async (data, {rejectedWithValue}) => {
        try {
            const res = await SERVER.post('class', data);
            return res.data;
        } catch (error) {
            return rejectedWithValue(error.res.data);
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
            })
            .addCase(createClassLevel.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(createClassLevel.rejected, (state) => {
                state.status = 'failed';
            })
    }
})

export const { setClassLevel } = classLevelSlice.actions;

export default classLevelSlice.reducer;
