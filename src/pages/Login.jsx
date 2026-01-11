// Core/Library
import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { useNavigate, Link } from "react-router-dom";

// Third-party
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Moon, Sun } from "lucide-react"; // 🌙☀️ icons

// Local
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext"; // ✅ your theme context
import { loginUser } from "../features/authSlice";

const { Title } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const { user, token, loading, error } = useSelector((state) => state.auth);

  const onFinish = (values) => {
    form.setFields([
      { name: "email", errors: [] },
      { name: "password", errors: [] },
    ]);
    dispatch(loginUser(values));
  };

  const onFinishFailed = (errorInfo) => {
    const { errorFields } = errorInfo;
    errorFields.forEach((field) => {
      const { name, errors } = field;
      if (errors.length > 0) {
        const fieldName = name[0];
        toast.error(
          `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} Error: ${
            errors[0]
          }`
        );
      }
    });
  };

  useEffect(() => {
    if (user && token) {
      toast.success("Login successful! Redirecting...");
      message.success("Welcome back!");
      setTimeout(() => navigate("/dashboard"), 1000);
    }
  }, [user, token, navigate]);

  useEffect(() => {
    if (error) {
      let errorMessage =
        typeof error === "string"
          ? error
          : error.message || "Login failed. Please try again.";

      if (errorMessage.toLowerCase().includes("email")) {
        toast.error("Invalid email address or user not found");
        form.setFields([
          { name: "email", errors: ["Email not found or invalid"] },
        ]);
      } else if (errorMessage.toLowerCase().includes("password")) {
        toast.error("Incorrect password. Please try again.");
        form.setFields([{ name: "password", errors: ["Incorrect password"] }]);
      } else {
        toast.error(errorMessage);
      }
      message.error(errorMessage);
    }
  }, [error, form]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522205408450-add114ad53fe?auto=format&fit=crop&w=1400&q=80')", // ✅ same background both themes
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(12px)",
        padding: "2rem",
        transition: "background 0.3s ease",
        position: "relative",
      }}
    >
      {/* 🌙☀️ Theme Toggle in Corner */}
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
        {isDark ? (
          <Sun size={20} color="#FFD700" />
        ) : (
          <Moon size={20} color="#000" />
        )}
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
            background: isDark
              ? "rgba(30, 30, 30, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
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
            Welcome Back 👋
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email format" },
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

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                placeholder="Your password"
                size="large"
                style={{
                  borderRadius: 8,
                  background: isDark ? "#1f1f1f" : "#fff",
                  color: isDark ? "#fff" : "#000",
                  border: isDark ? "1px solid #333" : "1px solid #d9d9d9",
                }}
              />
            </Form.Item>

            <Form.Item>
              <Link
                to="/forgot-password"
                style={{
                  float: "right",
                  color: "#1890ff",
                }}
              >
                Forgot Password?
              </Link>
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
                    background:
                      "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
                    boxShadow: "0 4px 14px rgba(24, 144, 255, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </motion.div>
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
  <span
    style={{
      color: theme === "dark" ? "#ccc" : "#555", // 🔥 lighter text in dark mode
    }}
  >
    Don’t have an account?{" "}
  </span>
  <Link
    to="/register"
    style={{
      fontWeight: 500,
      color: theme === "dark" ? "#9b87f5" : "#722ed1", // 🔥 bright purple in dark mode
    }}
  >
    Register
  </Link>
</Form.Item>

          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
