import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const bc_url = "http://localhost:8080/api";

export const fetchHistoryLogs = createAsyncThunk(
  "historyUser/fetchHistoryLogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${bc_url}/history`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed to fetch history")
    }
  }
);

const initialState = {
  logs: [],
  loading: false,
  error: null,
};

const historyUserSlice = createSlice({
  name: "historyUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchHistoryLogs.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchHistoryLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.logs = action.payload;
    });
    builder.addCase(fetchHistoryLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });
  },
});

export default historyUserSlice.reducer;
