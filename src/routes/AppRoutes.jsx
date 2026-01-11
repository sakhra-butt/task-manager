
import { Routes, Route, Navigate } from "react-router-dom";


import Login from "../pages/login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ManageTasks from "../pages/ManageTasks";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import PrivateRoute from "./PrivateRoute";
import TaskCalendar from "../pages/TaskCalendar";
import Profile from "../pages/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/manage-tasks"
        element={
          <PrivateRoute>
            <ManageTasks />
          </PrivateRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <PrivateRoute>
            <TaskCalendar />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      {/* Default route: if logged in, go to dashboard, else login */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      {/* Catch-all: redirect to dashboard or login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
