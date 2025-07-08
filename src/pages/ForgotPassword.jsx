// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import logo from '../assets/react.svg';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('https://api.freeapi.app/api/v1/auth/forgot-password', {
        email: values.email,
      });

      if (response?.data?.success) {
        message.success('Reset link sent to your email.');
      } else {
        message.error(response?.data?.message || 'Failed to send reset link.');
      }
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`forgot-password-page ${theme}-theme`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        position: 'relative',
      }}
    >
      {/* Theme Toggle */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
        <label style={{ marginRight: 8 }}>{theme === 'dark' ? 'Dark' : 'Light'}</label>
        <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
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

      {/* Card */}
      <Card
        className="themed-box"
        variant="outlined"
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 12,
          boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
          padding: '32px',
          backgroundColor: theme === 'dark' ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.95)',
        }}
      >
        <Title level={3} style={{ textAlign: 'center' }}>Forgot Password</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
          Enter your email address to receive a password reset link.
        </Text>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email address' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input size="large" autoComplete="email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Send Reset Link
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            <Link to="/login">Back to Login</Link>
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

export default ForgotPassword;
