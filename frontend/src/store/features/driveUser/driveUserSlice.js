import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const bc_url = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_DEPLOYED_BE_URL
  : import.meta.env.VITE_BE_URL;

export const fetchContents = createAsyncThunk(
  "driveUser/fetchContents",
  async (parentId, { rejectWithValue }) => {
    try {
      const query = parentId ? `?parentId=${parentId}` : "";
      const response = await axios.get(
        `${bc_url}/drive${query}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch contents");
    }
  }
);

export const createFolder = createAsyncThunk(
  "driveUser/createFolder",
  async ({ name, parentId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${bc_url}/drive/folder`,
        { name, parentId },
        { withCredentials: true }
      );
      return response.data.item;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create folder");
    }
  }
);

export const initUpload = createAsyncThunk(
  "driveUser/initUpload",
  async ({ name, parentId, mimeType, size }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${bc_url}/drive/upload`,
        { name, parentId, mimeType, size },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to init upload");
    }
  }
);

export const getDownloadUrl = createAsyncThunk(
  "driveUser/getDownloadUrl",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${bc_url}/drive/${id}/download`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to get download URL");
    }
  }
);

export const renameItem = createAsyncThunk(
  "driveUser/renameItem",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${bc_url}/drive/${id}`,
        { name },
        { withCredentials: true }
      );
      return response.data.item;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to rename");
    }
  }
);

export const moveItem = createAsyncThunk(
  "driveUser/moveItem",
  async ({ id, parentId }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${bc_url}/drive/${id}/move`,
        { parentId },
        { withCredentials: true }
      );
      return response.data.item;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to move item");
    }
  }
);

export const deleteItem = createAsyncThunk(
  "driveUser/deleteItem",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${bc_url}/drive/${id}`,
        { withCredentials: true }
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete");
    }
  }
);

const initialState = {
  items: [],
  breadcrumbs: [],
  viewMode: "grid", // "grid" or "list"
  loading: false,
  error: null,
};

const driveUserSlice = createSlice({
  name: "driveUser",
  initialState,
  reducers: {
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === "grid" ? "list" : "grid";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchContents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchContents.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchContents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "Failed to fetch";
    });

    builder.addCase(createFolder.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });

    builder.addCase(renameItem.fulfilled, (state, action) => {
      const index = state.items.findIndex(i => i._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });

    builder.addCase(deleteItem.fulfilled, (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload);
    });

    builder.addCase(moveItem.fulfilled, (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload._id);
    });
  },
});

export const { setBreadcrumbs, toggleViewMode } = driveUserSlice.actions;
export default driveUserSlice.reducer;
