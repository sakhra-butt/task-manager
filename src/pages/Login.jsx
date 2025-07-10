import { Form, Input, Button, Typography, message, Card } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import AuthLayout from "../components/authLayout";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [form] = Form.useForm();

  const handleLogin = (values) => {
    const { email, password } = values;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (matchedUser) {
      localStorage.setItem("currentUser", JSON.stringify(matchedUser));
      message.success("Login successful!");
      navigate("/manage-tasks");
    } else {
      const exists = users.find((user) => user.email === email);

      if (!exists) {
        form.setFields([
          {
            name: "email",
            errors: ["User not found. Please register first."],
          },
        ]);
      } else {
        form.setFields([
          {
            name: "password",
            errors: ["Incorrect password. Please try again."],
          },
        ]);
      }
    }
  };

  return (
    <AuthLayout>
      <Card
        className="themed-box"
        variant="outlined"
        style={{
          width: "100%",
          maxWidth: "480px",
          borderRadius: 12,
          boxShadow: "0 12px 28px rgba(0,0,0,0.1)",
          padding: "24px",
          backgroundColor:
            theme === "dark" ? "rgba(30,30,30,0.95)" : "rgba(255,255,255,0.98)",
        }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Welcome Back
        </Title>

        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input
              autoComplete="email"
              size="large"
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              autoComplete="current-password"
              size="large"
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Link to="/forgot-password">Forgot Password?</Link>
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              block
              size="large"
              className="login-btn"
            >
              Login
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
            <span className="login-footer-text">
              Don’t have an account? <Link to="/register">Sign Up</Link>
            </span>
          </Form.Item>
        </Form>
      </Card>
    </AuthLayout>
  );
};

export default Login;
