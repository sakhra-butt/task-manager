// src/features/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('currentUser')) || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      const { email, password } = action.payload;
      const users = JSON.parse(localStorage.getItem('users')) || [];

      const matchedUser = users.find(
        (user) => user.email === email && user.password === password
      );

      if (matchedUser) {
        localStorage.setItem('currentUser', JSON.stringify(matchedUser));
        state.user = matchedUser;
        state.error = null;
      } else {
        state.error = 'Invalid email or password';
      }
    },

    registerUser: (state, action) => {
      const { name, email, password } = action.payload;
      const users = JSON.parse(localStorage.getItem('users')) || [];

      const existingUser = users.find((user) => user.email === email);

      if (existingUser) {
        state.error = 'User already exists with this email';
      } else {
        const newUser = { name, email, password };
        const updatedUsers = [...users, newUser];

        localStorage.setItem('users', JSON.stringify(updatedUsers));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        state.user = newUser;
        state.error = null;
      }
    },

    logout: (state) => {
      localStorage.removeItem('currentUser');
      state.user = null;
      state.error = null;
    },
  },
});

export const { loginUser, registerUser, logout } = authSlice.actions;
export default authSlice.reducer;
