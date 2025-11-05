// Core/Library
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Card, message } from "antd";

// Third-party
import axios from "axios";
import toast from "react-hot-toast";
import * as chrono from "chrono-node";

// Local
import { useTheme } from "../context/ThemeContext";
import AuthLayout from "../components/AuthLayout";

const { Title } = Typography;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const { password, confirmPassword } = values;

    // Clear any previous errors
    form.setFields([
      { name: "password", errors: [] },
      { name: "confirmPassword", errors: [] },
    ]);

    if (password !== confirmPassword) {
      toast.error(" Passwords do not match. Please try again.");
      form.setFields([
        { name: "confirmPassword", errors: ["Passwords do not match"] },
      ]);
      return message.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );

      // Success notifications
      toast.success(" Password reset successfully!", {
        duration: 3000,

        style: {
          borderRadius: "10px",
          background: "#10B981",
          color: "#fff",
        },
      });

      message.success("Password reset successfully. Please login.");

      // Small delay before redirect to show success message
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Reset failed:", error.response?.data || error.message);

      let errorMessage = "Reset password failed. Please try again.";

      // Handle different types of errors
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show specific error messages based on error content
      if (
        errorMessage.toLowerCase().includes("token") &&
        errorMessage.toLowerCase().includes("invalid")
      ) {
        toast.error(
          "Invalid reset token. Please request a new password reset."
        );
      } else if (
        errorMessage.toLowerCase().includes("token") &&
        errorMessage.toLowerCase().includes("expired")
      ) {
        toast.error(
          " Reset token has expired. Please request a new password reset."
        );
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
        errorMessage.toLowerCase().includes("password") &&
        errorMessage.toLowerCase().includes("same")
      ) {
        toast.error("New password cannot be the same as the old password.");
        form.setFields([
          { name: "password", errors: ["Cannot use the same password"] },
        ]);
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
        toast.error("Request timeout. Please try again.");
      } else if (
        errorMessage.toLowerCase().includes("user") &&
        errorMessage.toLowerCase().includes("not found")
      ) {
        toast.error(" User not found. Please request a new password reset.");
      } else {
        toast.error(` ${errorMessage}`);
      }

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

        // Show specific toast for each field error
        if (fieldName === "password") {
          toast.error(`Password Error: ${errorMessage}`);
        } else if (fieldName === "confirmPassword") {
          toast.error(`Confirm Password Error: ${errorMessage}`);
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
          Reset Password
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="New Password"
            name="password"
            rules={[
              { required: true, message: "Please enter a new password" },
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
              size="large"
              placeholder="Enter your new password"
              style={{ opacity: 1 }}
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
              size="large"
              placeholder="Confirm your new password"
              style={{ opacity: 1 }}
            />
          </Form.Item>

          <Form.Item>
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
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </AuthLayout>
  );
};

export default ResetPassword;
