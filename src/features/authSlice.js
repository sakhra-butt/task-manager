// Core/Library
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Third-party
import axios from "../utils/axios";

// Thunk for registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post("/auth/register", userData);
      console.log(" Register response:", response.data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Register failed"
      );
    }
  }
);

// Thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post("/auth/login", userData);
      console.log(" Login response:", response.data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null, // Load user from localStorage
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // Remove user data too
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const { name, email, _id, token } = action.payload || {};
        if (token) {
          const userData = { name, email, _id };
          state.user = userData;
          state.token = token;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userData)); // Store user data
        } else {
          state.error = "Invalid registration response";
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const { name, email, _id, token } = action.payload || {};
        if (token) {
          const userData = { name, email, _id };
          state.user = userData;
          state.token = token;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userData)); // Store user data
        } else {
          state.error = "Invalid login response";
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
