import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Typography, Card, message } from "antd";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react"; // 🌙☀️ icons

import { useTheme } from "../context/ThemeContext";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { theme, toggleTheme } = useTheme(); 
  const isDark = theme === "dark";

  const handleSubmit = async (values) => {
    const { password, confirmPassword } = values;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      form.setFields([
        { name: "confirmPassword", errors: ["Passwords do not match"] },
      ]);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password,
      });

      toast.success("Password reset successfully! 🔐");
      message.success("Password reset successfully. Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Reset password failed. Please try again.";
      toast.error(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522205408450-add114ad53fe?auto=format&fit=crop&w=1400&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(12px)",
        padding: "2rem",
        position: "relative", 
        transition: "background 0.3s ease",
      }}
    >
      {/* 🌙☀️ Theme Toggle */}
      <div
        onClick={toggleTheme}
        style={{
          position: "absolute",
          top: 20,
          right: 25,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        {isDark ? <Sun size={20} color="#FFD700" /> : <Moon size={20} color="#000" />}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ width: "100%", maxWidth: 480 }}
      >
        <Card
          style={{
            borderRadius: 20,
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.7)"
              : "0 8px 32px rgba(0, 0, 0, 0.2)",
            padding: "2.5rem",
            backdropFilter: "blur(16px)",
            background: isDark ? "rgba(30, 30, 30, 0.85)" : "rgba(255, 255, 255, 0.85)",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(255, 255, 255, 0.3)",
            color: isDark ? "#fff" : "#000",
            transition: "all 0.3s ease",
          }}
        >
          <Title
            level={2}
            style={{
              textAlign: "center",
              marginBottom: 32,
              background: "linear-gradient(135deg, #1890ff, #722ed1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            Reset Password 🔒
          </Title>

          <Text
            style={{
              display: "block",
              marginBottom: 24,
              textAlign: "center",
              fontSize: "0.95rem",
              color: isDark ? "#ccc" : "#555", 
            }}
          >
            Enter a new password for your account.
          </Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="New Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your new password" },
                { min: 6, message: "Password must be at least 6 characters" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    "Password must include uppercase, lowercase, and a number",
                },
              ]}
            >
              <Input.Password
                placeholder="Enter new password"
                size="large"
                style={{
                  borderRadius: 8,
                  background: isDark ? "#1f1f1f" : "#fff",
                  color: isDark ? "#fff" : "#000",
                  border: isDark ? "1px solid #333" : "1px solid #d9d9d9",
                }}
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value)
                      return Promise.resolve();
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm new password"
                size="large"
                style={{
                  borderRadius: 8,
                  background: isDark ? "#1f1f1f" : "#fff",
                  color: isDark ? "#fff" : "#000",
                  border: isDark ? "1px solid #333" : "1px solid #d9d9d9",
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 16 }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  style={{
                    border: "none",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
                    boxShadow: "0 4px 14px rgba(24, 144, 255, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </motion.div>
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
              <Link
                to="/login"
                style={{
                  fontWeight: 500,
                  color: isDark ? "#9b87f5" : "#722ed1",
                }}
              >
                Back to Login
              </Link>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
