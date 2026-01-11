import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/authSlice";
import { useTheme } from "../context/ThemeContext"; 
import { Sun, Moon } from "lucide-react"; 

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme(); 

  const { user, token, loading, error } = useSelector((state) => state.auth);

  const onFinish = (values) => {
    form.setFields([
      { name: "name", errors: [] },
      { name: "email", errors: [] },
      { name: "password", errors: [] },
      { name: "confirmPassword", errors: [] },
    ]);
    dispatch(registerUser(values));
  };

  useEffect(() => {
    if (user && token) {
      toast.success("Registration successful! 🎉");
      message.success("Welcome aboard!");
      setTimeout(() => navigate("/dashboard"), 1000);
    }
  }, [user, token, navigate]);

  useEffect(() => {
    if (error) {
      message.error(error?.message || "Registration failed.");
      toast.error(error?.message || "Registration failed.");
    }
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522205408450-add114ad53fe?auto=format&fit=crop&w=1400&q=80')", // ✅ same bg
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(12px)",
        padding: "2rem",
        position: "relative", 
      }}
    >
      {/* Theme Toggle Button  */}
      <div
        onClick={toggleTheme}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          cursor: "pointer",
          background:
            theme === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
          borderRadius: "50%",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          transition: "all 0.3s ease",
        }}
      >
        {theme === "dark" ? (
          <Sun size={20} color="#fff" />
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
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            padding: "1.8rem",
            backdropFilter: "blur(16px)",
            background:
              theme === "dark"
                ? "rgba(20, 20, 20, 0.85)"
                : "rgba(255, 255, 255, 0.88)",
            border:
              theme === "dark"
                ? "1px solid rgba(255, 255, 255, 0.15)"
                : "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <Title
            level={2}
            style={{
              textAlign: "center",
              marginBottom: 20,
              background: "linear-gradient(135deg, #1890ff, #722ed1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            Create Your Account ✨
          </Title>

          <Text
            type="secondary"
            style={{
              display: "block",
              textAlign: "center",
              marginBottom: 20,
              fontSize: "0.95rem",
              color: theme === "dark" ? "#ccc" : "#555",
            }}
          >
            Join us and start your journey today.
          </Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Full Name"
              name="name"
              rules={[
                { required: true, message: "Please enter your name" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input
                placeholder="John Doe"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

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
                style={{ borderRadius: 8 }}
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
    backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
    color: theme === "dark" ? "#fff" : "#000",
    border: theme === "dark" ? "1px solid #333" : undefined,
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
    placeholder="Confirm your password"
    size="large"
    style={{
      borderRadius: 8,
      backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
      color: theme === "dark" ? "#fff" : "#000",
      border: theme === "dark" ? "1px solid #333" : undefined,
    }}
  />
            </Form.Item>

            <Form.Item style={{ marginTop: 12 }}>
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
                  {loading ? "Creating Account..." : "Register"}
                </Button>
              </motion.div>
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
               <span
   style={{
      color: theme === "dark" ? "#ccc" : "#555", 
    }}
  >
              Already have an account?{" "}
                </span>
              <Link to="/login" style={{ fontWeight: 500, color: "#722ed1" }}>
                Login
              </Link>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
