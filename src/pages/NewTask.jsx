// src/pages/NewTask.jsx
import React from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  message,
  Space,
  Typography,
  Card,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTheme } from '../context/ThemeContext';

const { Title } = Typography;

const NewTask = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const onFinish = (values) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')); // ✅ fixed key
    if (!currentUser) {
      message.error('Please log in to add a task');
      navigate('/login');
      return;
    }

    const title = values.title?.trim();
    const description = values.description?.trim() || 'New task created';
    const dueDate = dayjs(values.dueDate).format('YYYY-MM-DD');

    if (!title || !dueDate) {
      message.error('Please fill in all required fields');
      return;
    }

    const newTask = {
      id: Date.now(),
      title,
      description,
      dueDate,
      completed: false,
      email: currentUser.email, // ✅ correct reference
    };

    const existingTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = [...existingTasks, newTask];
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));

    message.success('Task added successfully!');
    navigate('/manage-tasks');
  };

  return (
    <div
      className={`new-task-page ${theme}-theme`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
      }}
    >
      <Card
        bordered={false}
        style={{
          width: '100%',
          maxWidth: 600,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Add New Task
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input size="large" placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Due date is required' }]}
          >
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Enter description (optional)" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate('/manage-tasks')}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Add Task
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NewTask;
