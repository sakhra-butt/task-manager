// src/pages/Login.jsx
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Switch from 'react-switch';
import '../styles/index.scss';
import logo from '../assets/react.svg';

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = (values) => {
    const { email, password } = values;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (matchedUser) {
      localStorage.setItem('currentUser', JSON.stringify(matchedUser));
      message.success('Login successful!');
      navigate('/manage-tasks');
    } else {
      const exists = users.find((user) => user.email === email);
      if (!exists) {
        message.error('User not found. Please register first.');
      } else {
        message.error('Incorrect password. Please try again.');
      }
    }
  };

  return (
    <div
      className={`login-page ${theme}-theme`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '16px',
      }}
    >
      {/* Theme Toggle */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
        <label style={{ marginRight: 8 }}>{theme === 'dark' ? 'Dark' : 'Light'}</label>
        <Switch onChange={toggleTheme} checked={theme === 'dark'} />
      </div>

      {/* Logo */}
      <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000 }}>
        <img
          src={logo}
          alt="Logo"
          style={{
            height: '40px',
            animation: 'logo-float 3s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      </div>

      <Card
        className="themed-box"
        variant="outlined"
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: 12,
          boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
          padding: '24px',
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Welcome Back
        </Title>
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please enter your email' }]}
          >
            <Input autoComplete="email" size="large" placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              autoComplete="current-password"
              size="large"
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
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

          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            <span className="login-footer-text">
              Don’t have an account? <Link to="/register">Sign Up</Link>
            </span>
          </Form.Item>
        </Form>
      </Card>

      {/* Footer */}
      <div
        style={{
          position: 'fixed',
          bottom: 12,
          width: '100%',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: theme === 'dark' ? '#aaa' : '#555',
          opacity: 0.7,
        }}
      >
        © 2025 Task Manager. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
