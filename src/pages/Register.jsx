import React from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "../components/authLayout";

const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = (values) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.some(
      (user) => user.email.toLowerCase() === values.email.toLowerCase()
    );

    if (userExists) {
      message.error("A user with this email already exists.");
      return;
    }

    const newUser = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    message.success("Registration successful!");
    navigate("/manage-tasks");
  };

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
            Create Your Account
          </Title>

          <Form layout="vertical" onFinish={handleRegister} autoComplete="off">
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="John Doe" size="large" />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input placeholder="you@example.com" size="large" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                placeholder="Enter a secure password"
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" block size="large">
                Register
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
