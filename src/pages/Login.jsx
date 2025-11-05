// Core/Library
import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { useNavigate, Link } from "react-router-dom";

// Third-party
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Local
import { useDispatch, useSelector } from "react-redux";
import AuthLayout from "../components/AuthLayout";
import { loginUser } from "../features/authSlice";

const { Title } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token, loading, error } = useSelector((state) => state.auth);

  const onFinish = (values) => {
    // Clear any previous errors
    form.setFields([
      { name: "email", errors: [] },
      { name: "password", errors: [] },
    ]);

    dispatch(loginUser(values));
  };

  // Handle form validation errors
  const onFinishFailed = (errorInfo) => {
    const { errorFields } = errorInfo;

    errorFields.forEach((field) => {
      const { name, errors } = field;
      if (errors && errors.length > 0) {
        const fieldName = name[0];
        const errorMessage = errors[0];

        // Show specific toast for each field error
        if (fieldName === "email") {
          toast.error(`Email Error: ${errorMessage}`);
        } else if (fieldName === "password") {
          toast.error(`Password Error: ${errorMessage}`);
        }
      }
    });
  };

  // Handle successful login
  useEffect(() => {
    if (user && token) {
      toast.success("Login successful! Redirecting...", {
        duration: 2000,
      });

      // Also show antd message
      message.success("Welcome back! Login successful.");

      // Small delay to show the toast before redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  }, [user, token, navigate]);

  // Handle login errors from API
  useEffect(() => {
    if (error) {
      let errorMessage = "Login failed. Please try again.";

      // Handle different types of errors
      if (typeof error === "string") {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show specific error messages based on error content
      if (
        errorMessage.toLowerCase().includes("email") ||
        errorMessage.toLowerCase().includes("user not found")
      ) {
        toast.error(" Invalid email address or user not found");
        form.setFields([
          { name: "email", errors: ["Email not found or invalid"] },
        ]);
      } else if (
        errorMessage.toLowerCase().includes("password") ||
        errorMessage.toLowerCase().includes("incorrect")
      ) {
        toast.error(" Incorrect password. Please try again.");
        form.setFields([{ name: "password", errors: ["Incorrect password"] }]);
      } else if (
        errorMessage.toLowerCase().includes("network") ||
        errorMessage.toLowerCase().includes("connection")
      ) {
        toast.error(" Network error. Please check your connection.");
      } else if (
        errorMessage.toLowerCase().includes("account") &&
        errorMessage.toLowerCase().includes("locked")
      ) {
        toast.error(" Account is locked. Please contact support.");
      } else if (errorMessage.toLowerCase().includes("expired")) {
        toast.error(" Session expired. Please try again.");
      } else {
        toast.error(` ${errorMessage}`);
      }

      message.error(errorMessage);
    }
  }, [error, form]);

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: "100%", maxWidth: 480 }}
      >
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 12px 28px rgba(0,0,0,0.1)",
            padding: 32,
          }}
        >
          <Title level={3} style={{ textAlign: "center", marginBottom: 32 }}>
            Welcome Back
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
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Link to="/forgot-password">Forgot Password?</Link>
            </Form.Item>

            <Form.Item style={{ marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
                  border: "none",
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
              Don't have an account? <Link to="/register">Register</Link>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </AuthLayout>
  );
};

export default Login;
