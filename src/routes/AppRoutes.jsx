import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ManageTasks from "../pages/ManageTasks";
import ResetPassword from "../pages/ResetPassword";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/manage-tasks" element={<ManageTasks />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  );
};

export default AppRoutes;
