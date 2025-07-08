// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ManageTasks from '../pages/ManageTasks';
import NewTask from '../pages/NewTask';
import EditTask from '../pages/EditTask';

// LocalStorage-based authentication check
const isAuthenticated = () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  return user !== null;
};

// Protect private routes
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated() ? "/manage-tasks" : "/login"} />} />

      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to="/manage-tasks" /> : <Login />}
      />

      <Route
        path="/register"
        element={isAuthenticated() ? <Navigate to="/manage-tasks" /> : <Register />}
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/manage-tasks"
        element={
          <PrivateRoute>
            <ManageTasks />
          </PrivateRoute>
        }
      />

      <Route
        path="/manage-tasks/new"
        element={
          <PrivateRoute>
            <NewTask />
          </PrivateRoute>
        }
      />

      <Route
        path="/manage-tasks/:id"
        element={
          <PrivateRoute>
            <EditTask />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
