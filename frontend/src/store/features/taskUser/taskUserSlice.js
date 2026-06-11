import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const bc_url = "http://localhost:8080/api";

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
  async ({ name, is_completed }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${bc_url}/tasks`,
        { name, is_completed },
        { withCredentials: true }
      );
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed to create task")
    }
  }
);

export const updateTask = createAsyncThunk(
  "taskUser/updateTask",
  async ({ id, name, is_completed }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${bc_url}/tasks/${id}`,
        { name, is_completed },
        { withCredentials: true }
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
