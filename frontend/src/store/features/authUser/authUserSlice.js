import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const bc_url = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_DEPLOYED_BE_URL
  : import.meta.env.VITE_BE_URL;

export const loginUser = createAsyncThunk(
  "authUser/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${bc_url}/users/login`,
        { email, password },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed Login!")
    }
  }
);

export const registerUser = createAsyncThunk(
  "authUser/registerUser",
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${bc_url}/users/signup`,
        { name, email, password },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed register!")
    }
  }
);

export const logoutUser = createAsyncThunk(
  "authUser/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${bc_url}/users/logout`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed logout!")
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "authUser/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${bc_url}/users`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed fetch users")
    }
  }
);

export const deleteUser = createAsyncThunk(
  "authUser/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${bc_url}/users/${id}`,
        { withCredentials: true }
      );
      return id; // return deleted id
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed to Delete user!")
    }
  }
);

export const updateUser = createAsyncThunk(
  "authUser/updateUser",
  async ({ id, name, email, password, role, is_active, profile_image, educational_certificate }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${bc_url}/users/${id}`,
        { name, email, password, role, is_active, profile_image, educational_certificate },
        { withCredentials: true }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || "failed to update user!")
    }
  }
);

const initialState = {
  isLogged: JSON.parse(localStorage.getItem("isLogged")) || false,
  user: JSON.parse(localStorage.getItem("user")) || null,
  usersList: [],
  loading: false,
  error: null,
  success: false
};

const authUserSlice = createSlice({
  name: "authUser",
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      localStorage.setItem("isLogged", true);
      localStorage.setItem("user", JSON.stringify(action.payload.matchingUser));
      state.isLogged = true;
      state.user = action.payload.matchingUser;
      state.loading = false;
      state.success = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload?.message || "failed login!";
    });

    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload?.message || "failed register!";
    });

    builder.addCase(logoutUser.fulfilled, (state) => {
      localStorage.removeItem("isLogged");
      localStorage.removeItem("user");
      state.isLogged = false;
      state.user = null;
      state.usersList = [];
    });
    builder.addCase(logoutUser.rejected, (state) => {
      localStorage.removeItem("isLogged");
      localStorage.removeItem("user");
      state.isLogged = false;
      state.user = null;
    });

    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.usersList = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    });

    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.usersList = state.usersList.filter(u => u._id !== action.payload);
    });

    builder.addCase(updateUser.fulfilled, (state, action) => {
      const index = state.usersList.findIndex(u => u._id === action.payload._id);
      if (index !== -1) {
        state.usersList[index] = action.payload;
      }
      if (state.user && state.user._id === action.payload._id) {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    });
  },
});

export const { resetState } = authUserSlice.actions;
export default authUserSlice.reducer;
