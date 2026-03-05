import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import SERVER from '../../Utils/server';
import { toast } from 'react-toastify';
import { toastOptions } from '../../Utils/toastOptions';

const initialState = {
  announcements: [],
  status: 'idle', //'idle' | 'pending' | 'succeeded' | 'failed'
  error: null,
};

//delete announcement
export const deleteAnnouncement = createAsyncThunk(
  'announcements/deleteAnnouncement',
  async (id, { rejectWithValue }) => {
    try {
      const response = await SERVER.delete(`announcement/${id}`);
      if (response.data) {
        toast.success('Deleted successfully!', { toastOptions });
        return id;
      } else {
        toast.error('Unable to delete, please try again later', { toastOptions });
        return rejectWithValue('Unable to delete');
      }
    } catch (error) {
      toast.error('Failed to delete!', { toastOptions });
      return rejectWithValue(error.response.data);
    }
  }
);

//get announcement
export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAnnouncements',
  async () => {
    const response = await SERVER.get('announcement');
    return response.data.data;
  }
);

//create/update announcement
export const createOrUpdateAnnouncement = createAsyncThunk(
  'announcements/createOrUpdateAnnouncement',
  async ({ announcement, isEditing }, { rejectWithValue }) => {
    try {
      const url = isEditing
        ? `announcement/${announcement._id}`
        : 'announcement/create';
      const method = isEditing ? 'put' : 'post';
      const response = await SERVER[method](url, announcement);
      toast.success(`Announcement ${isEditing ? 'updated' : 'created'} successfully!`, toastOptions);
      return response.data;
    } catch (error) {
      toast.error('Unable to save announcement, please try again!', toastOptions);
      return rejectWithValue(error.response.data);
    }
  }
);

const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    setAnnouncements: (state, action) => {
      state.announcements = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
    //getting announcement
      .addCase(fetchAnnouncements.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      //create and update
      .addCase(createOrUpdateAnnouncement.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(createOrUpdateAnnouncement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the announcement in the state
        if (action.payload.isEditing) {
          const index = state.announcements.findIndex(
            (announcement) => announcement._id === action.payload._id
          );
          if (index !== -1) {
            state.announcements[index] = action.payload;
          }
        } else {
          state.announcements.push(action.payload);
        }
      })
      .addCase(createOrUpdateAnnouncement.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      //delete 
      .addCase(deleteAnnouncement.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.announcements = state.announcements.filter(
          (announcement) => announcement._id !== action.payload
        );
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
  },
})

export const { setAnnouncements } = announcementSlice.actions;

export default announcementSlice.reducer;
