import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { useTheme } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import axios from "axios";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);

    // Clear any previous errors
    form.setFields([{ name: "email", errors: [] }]);

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: values.email,
      });

      // Success notifications
      toast.success(" Password reset email sent successfully!", {
        duration: 4000,
        style: {
          borderRadius: "10px",
          background: "#10B981",
          color: "#fff",
        },
      });

      message.success("Password reset email sent to your inbox");

      // Clear the form after successful submission
      form.resetFields();

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000); // 2 second delay to allow user to see the success message
    } catch (error) {
      console.error("Error sending reset email:", error);

      let errorMessage = "Something went wrong. Please try again.";

      // Handle different types of errors
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show specific error messages based on error content
      if (
        errorMessage.toLowerCase().includes("email") &&
        errorMessage.toLowerCase().includes("not found")
      ) {
        toast.error(" Email address not found. Please check your email.");
        form.setFields([
          { name: "email", errors: ["Email address not found"] },
        ]);
      } else if (
        errorMessage.toLowerCase().includes("email") &&
        errorMessage.toLowerCase().includes("invalid")
      ) {
        toast.error(
          " Invalid email format. Please enter a valid email address."
        );
        form.setFields([{ name: "email", errors: ["Invalid email format"] }]);
      } else if (
        errorMessage.toLowerCase().includes("rate limit") ||
        errorMessage.toLowerCase().includes("too many")
      ) {
        toast.error(" Too many requests. Please wait before trying again.");
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
      } else if (
        errorMessage.toLowerCase().includes("email") &&
        errorMessage.toLowerCase().includes("already sent")
      ) {
        toast.error("Reset email already sent. Please check your inbox.");
      } else {
        toast.error(` ${errorMessage}`);
      }

      // Also show antd message
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle form validation errors
  const onFinishFailed = (errorInfo) => {
    const { errorFields } = errorInfo;

    errorFields.forEach((field) => {
      const { name, errors } = field;
      if (errors && errors.length > 0) {
        const fieldName = name[0];
        const errorMessage = errors[0];

        // Show specific toast for email field error
        if (fieldName === "email") {
          toast.error(`Email Error: ${errorMessage}`);
        }
      }
    });
  };

  return (
    <AuthLayout>
      <Card
        className="themed-box"
        variant="outlined"
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 12,
          boxShadow: "0 12px 28px rgba(0,0,0,0.1)",
          padding: "32px",
          backgroundColor:
            theme === "dark" ? "rgba(30,30,30,0.9)" : "rgba(255,255,255,0.95)",
        }}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          Forgot Password
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
          Enter your email address to receive a password reset link.
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email address" },
              { type: "email", message: "Enter a valid email address" },
              { max: 100, message: "Email cannot exceed 100 characters" },
            ]}
          >
            <Input
              size="large"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
            <Link to="/login">Back to Login</Link>
          </Form.Item>
        </Form>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPassword;
