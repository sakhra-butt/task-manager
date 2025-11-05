import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../utils/axios";

// Fetch tasks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("/tasks");
      console.log("Full response object:", response);
      console.log("Response data:", response.data);
      console.log("Response data.data:", response.data.data);
      console.log(" Response data type:", typeof response.data);
      console.log(" Response data keys:", Object.keys(response.data || {}));

      // Handling  different API response
      let tasks = null;

      if (response.data.data) {
        tasks = response.data.data;
      } else if (response.data.tasks) {
        tasks = response.data.tasks;
      } else if (Array.isArray(response.data)) {
        tasks = response.data;
      } else if (response.data.result) {
        tasks = response.data.result;
      } else {
        console.warn("Unknown API response structure, returning empty array");
        tasks = [];
      }

      console.log(" Final tasks data:", tasks);

      // Ensure we return an array
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error(" fetchTasks error:", error);
      console.error(" Error response:", error.response?.data);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch tasks"
      );
    }
  }
);

// Add task
export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (taskData, thunkAPI) => {
    try {
      const response = await axios.post("/tasks", taskData);
      console.log(" addTask response:", response.data);

      // Handling different response for added task
      let newTask = null;

      if (response.data.data) {
        newTask = response.data.data;
      } else if (response.data.task) {
        newTask = response.data.task;
      } else if (response.data.result) {
        newTask = response.data.result;
      } else {
        newTask = response.data;
      }

      return newTask;
    } catch (error) {
      console.error(" addTask error:", error.response?.data);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add task"
      );
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      console.error("👉 deleteTask error:", error.response?.data);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete task"
      );
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, updates }, thunkAPI) => {
    try {
      const response = await axios.put(`/tasks/${id}`, updates);
      console.log("👉 updateTask response:", response.data);

      // Handling  different response  for updated task
      let updatedTask = null;

      if (response.data.data) {
        updatedTask = response.data.data;
      } else if (response.data.task) {
        updatedTask = response.data.task;
      } else if (response.data.result) {
        updatedTask = response.data.result;
      } else {
        updatedTask = response.data;
      }

      return updatedTask;
    } catch (error) {
      console.error(" updateTask error:", error.response?.data);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update task"
      );
    }
  }
);

// NOTE: The tasks state is stored in 'list', not 'tasks'.

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Adding  a manual reset action if needed
    resetTasks: (state) => {
      state.list = [];
      state.error = null;
      state.loading = false;
    },
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = false; //  loading  false for immediately for faster UI update
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.list = []; // Reset list on error
      })

      // addTask
      .addCase(addTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.list.push(action.payload);
        }
        state.error = null;
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((task) => task._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload._id) {
          const index = state.list.findIndex(
            (task) => task._id === action.payload._id
          );
          if (index !== -1) {
            state.list[index] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetTasks, clearError } = taskSlice.actions;
export default taskSlice.reducer;
