// Core/Library
import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { useNavigate, Link } from "react-router-dom";

// Third-party
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Local
import AuthLayout from "../components/AuthLayout";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/authSlice";

const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { user, token, loading, error } = useSelector((state) => state.auth);

  const onFinish = (values) => {
    // Clear any previous errors
    form.setFields([
      { name: "name", errors: [] },
      { name: "email", errors: [] },
      { name: "password", errors: [] },
      { name: "confirmPassword", errors: [] },
    ]);

    dispatch(registerUser(values));
  };

  // Handle form validation errors
  const onFinishFailed = (errorInfo) => {
    const { errorFields } = errorInfo;

    errorFields.forEach((field) => {
      const { name, errors } = field;
      if (errors && errors.length > 0) {
        const fieldName = name[0];
        const errorMessage = errors[0];

        // Showing  specific toast for each field error
        if (fieldName === "name") {
          toast.error(`Name Error: ${errorMessage}`);
        } else if (fieldName === "email") {
          toast.error(`Email Error: ${errorMessage}`);
        } else if (fieldName === "password") {
          toast.error(`Password Error: ${errorMessage}`);
        } else if (fieldName === "confirmPassword") {
          toast.error(`Confirm Password Error: ${errorMessage}`);
        }
      }
    });
  };

  // Handle successful registration
  useEffect(() => {
    if (user && token) {
      toast.success("Registration successful! Welcome!", {
        duration: 3000,

        style: {
          borderRadius: "10px",
          background: "#10B981",
          color: "#fff",
        },
      });

      // Small delay to show the toast before redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }
  }, [user, token, navigate]);

  // Handle registration errors from API
  useEffect(() => {
    if (error) {
      let errorMessage = "Registration failed. Please try again.";

      // Handle different types of errors
      if (typeof error === "string") {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show specific error messages based on error content
      if (
        errorMessage.toLowerCase().includes("email") &&
        errorMessage.toLowerCase().includes("already")
      ) {
        toast.error(
          " This email is already registered. Please use a different email."
        );
        form.setFields([{ name: "email", errors: ["Email already exists"] }]);
      } else if (
        errorMessage.toLowerCase().includes("email") &&
        errorMessage.toLowerCase().includes("invalid")
      ) {
        toast.error(
          " Invalid email format. Please enter a valid email address."
        );
        form.setFields([{ name: "email", errors: ["Invalid email format"] }]);
      } else if (
        errorMessage.toLowerCase().includes("password") &&
        errorMessage.toLowerCase().includes("weak")
      ) {
        toast.error(
          " Password is too weak. Use at least 8 characters with numbers and symbols."
        );
        form.setFields([
          { name: "password", errors: ["Password is too weak"] },
        ]);
      } else if (
        errorMessage.toLowerCase().includes("password") &&
        errorMessage.toLowerCase().includes("short")
      ) {
        toast.error(" Password is too short. Minimum 6 characters required.");
        form.setFields([{ name: "password", errors: ["Password too short"] }]);
      } else if (
        errorMessage.toLowerCase().includes("name") &&
        errorMessage.toLowerCase().includes("invalid")
      ) {
        toast.error(" Invalid name format. Please enter a valid name.");
        form.setFields([{ name: "name", errors: ["Invalid name format"] }]);
      } else if (
        errorMessage.toLowerCase().includes("name") &&
        errorMessage.toLowerCase().includes("required")
      ) {
        toast.error(" Name is required. Please enter your full name.");
        form.setFields([{ name: "name", errors: ["Name is required"] }]);
      } else if (
        errorMessage.toLowerCase().includes("network") ||
        errorMessage.toLowerCase().includes("connection")
      ) {
        toast.error(" Network error. Please check your internet connection.");
      } else if (
        errorMessage.toLowerCase().includes("server") ||
        errorMessage.toLowerCase().includes("500")
      ) {
        toast.error(" Server error. Please try again later.");
      } else if (errorMessage.toLowerCase().includes("timeout")) {
        toast.error(" Request timeout. Please try again.");
      } else if (errorMessage.toLowerCase().includes("validation")) {
        toast.error(" Please check all fields and try again.");
      } else {
        toast.error(` ${errorMessage}`);
      }

      // Also show antd message
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
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Create Your Account
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Full Name"
              name="name"
              rules={[
                { required: true, message: "Please enter your name" },
                { min: 2, message: "Name must be at least 2 characters" },
                { max: 50, message: "Name cannot exceed 50 characters" },
                {
                  pattern: /^[a-zA-Z\s]+$/,
                  message: "Name should only contain letters and spaces",
                },
              ]}
            >
              <Input
                placeholder="Enter Name"
                size="large"
                autoComplete="name"
              />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email format" },
                { max: 100, message: "Email cannot exceed 100 characters" },
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
                { max: 100, message: "Password cannot exceed 100 characters" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                },
              ]}
            >
              <Input.Password
                placeholder="Enter a secure password"
                size="large"
                autoComplete="new-password"
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
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The passwords do not match")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm your password"
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{
                  background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
                  border: "none",
                }}
              >
                {loading ? "Creating Account..." : "Register"}
              </Button>
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
              Already have an account? <Link to="/login">Login here</Link>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </AuthLayout>
  );
};

export default Register;
