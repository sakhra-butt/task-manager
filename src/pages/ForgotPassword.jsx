// Core/Library 
import React from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { Link, useNavigate } from "react-router-dom";

// Third-party
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react"; // 🌙☀️ icons

// Local
import { useTheme } from "../context/ThemeContext";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = React.useState(false);
  const [form] = Form.useForm();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    form.setFields([{ name: "email", errors: [] }]);

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: values.email,
      });

      toast.success("Password reset email sent successfully! ✅");
      message.success("Check your inbox for reset instructions.");

      form.resetFields();
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
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
            Forgot Password 🔒
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
            Enter your email address to receive a reset link.
          </Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Enter a valid email address" },
              ]}
            >
              <Input
                placeholder="you@example.com"
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
                  {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
