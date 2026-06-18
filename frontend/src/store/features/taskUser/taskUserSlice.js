import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const bc_url = import.meta.env.MODE === 'production' 
  ? import.meta.env.VITE_DEPLOYED_BE_URL 
  : import.meta.env.VITE_BE_URL;

export const fetchTasks = createAsyncThunk(
  "taskUser/fetchTasks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${bc_url}/tasks`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed to fetch tasks")
    }
  }
);

export const createTask = createAsyncThunk(
  "taskUser/createTask",
  async ({ name, is_completed, image }, { rejectWithValue }) => {
    try {
      let data;
      let headers = { withCredentials: true };

      if (image) {
        data = new FormData();
        data.append("name", name);
        data.append("is_completed", is_completed);
        data.append("image", image);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        data = { name, is_completed };
      }

      const response = await axios.post(
        `${bc_url}/tasks`,
        data,
        headers
      );
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed to create task")
    }
  }
);

export const updateTask = createAsyncThunk(
  "taskUser/updateTask",
  async ({ id, name, is_completed, image }, { rejectWithValue }) => {
    try {
      let data;
      let headers = { withCredentials: true };

      if (image) {
        data = new FormData();
        data.append("name", name);
        data.append("is_completed", is_completed);
        data.append("image", image);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        data = { name, is_completed };
      }

      const response = await axios.patch(
        `${bc_url}/tasks/${id}`,
        data,
        headers
      );
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed to update task")
    }
  }
);

export const deleteTask = createAsyncThunk(
  "taskUser/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${bc_url}/tasks/${id}`,
        { withCredentials: true }
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed to delete task")
    }
  }
);

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const taskUserSlice = createSlice({
  name: "taskUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.loading = false;
      state.tasks = action.payload;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    builder.addCase(createTask.fulfilled, (state, action) => {
      state.tasks.push(action.payload);
    });

    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });

    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter(t => t._id !== action.payload);
    });
  },
});

export default taskUserSlice.reducer;
