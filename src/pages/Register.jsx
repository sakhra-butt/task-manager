// src/pages/Register.jsx
import React from 'react';
import { Form, Input, Button, Typography, Card, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/index.scss';

const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = (values) => {
    console.log('Registering user with values:', values);

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userExists = users.some(
      (user) => user.email.toLowerCase() === values.email.toLowerCase()
    );

    if (userExists) {
      message.error('A user with this email already exists.');
      return;
    }

    const newUser = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    message.success('Registration successful! Redirecting...');
    setTimeout(() => {
      navigate('/manage-tasks');
    }, 1000);
  };

  return (
    <div
      className="auth-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 16,
        background: 'transparent',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={3} style={{ textAlign: 'center' }}>Register</Title>

        <Form layout="vertical" onFinish={handleRegister} autoComplete="off">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input placeholder="Enter name" autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Invalid email address' },
            ]}
          >
            <Input placeholder="Enter email" autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password placeholder="Enter password" autoComplete="new-password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Register
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            Already have an account? <Link to="/login">Login here</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
