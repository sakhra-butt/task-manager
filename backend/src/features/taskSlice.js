// src/features/taskSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Helpers
const getCurrentUser = () => JSON.parse(localStorage.getItem('currentUser'));
const getUserTasks = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
  return tasks[currentUser.email] || [];
};
const saveUserTasks = (tasksForUser) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
  allTasks[currentUser.email] = tasksForUser;
  localStorage.setItem('tasks', JSON.stringify(allTasks));
};

// Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: getUserTasks(),
    loading: false,
    error: null,
  },
  reducers: {
    loadTasks: (state) => {
      state.list = getUserTasks();
    },
    addTask: (state, action) => {
      const newTask = action.payload;
      state.list.push(newTask);
      saveUserTasks(state.list);
    },
    updateTask: (state, action) => {
      const updated = action.payload;
      state.list = state.list.map((t) => (t.id === updated.id ? updated : t));
      saveUserTasks(state.list);
    },
    deleteTask: (state, action) => {
      const id = action.payload;
      state.list = state.list.filter((t) => t.id !== id);
      saveUserTasks(state.list);
    },
    clearTasks: (state) => {
      state.list = [];
      saveUserTasks([]);
    },
  },
});

export const { loadTasks, addTask, updateTask, deleteTask, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
