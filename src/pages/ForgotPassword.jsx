// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Form, Input, Button, Typography, Card } from "antd";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import AuthLayout from "../components/authLayout";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = (values) => {
    setLoading(true);
    console.log("Email sent to:", values.email);
    setTimeout(() => {
      setLoading(false);
    }, 1000); // Simulate a delay
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

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email address" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input size="large" autoComplete="email" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Send Reset Link
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
