// src/pages/EditTask.jsx
import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  message,
  Space,
  Typography,
  Card,
  Spin,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTheme } from '../context/ThemeContext';

const { Title } = Typography;

const EditTask = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')); // ✅ fixed key
    if (!currentUser) {
      message.error('Please log in to edit a task');
      navigate('/login');
      return;
    }

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const foundTask = tasks.find(
      (task) => task.id === Number(id) && task.email === currentUser.email
    );

    if (foundTask) {
      form.setFieldsValue({
        title: foundTask.title,
        dueDate: dayjs(foundTask.dueDate),
        description: foundTask.description,
      });
      setTask(foundTask);
    } else {
      message.error('Task not found or access denied');
      navigate('/manage-tasks');
    }

    setLoading(false);
  }, [id, form, navigate]);

  const onFinish = (values) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')); // ✅ fixed key
    if (!currentUser) {
      message.error('Please log in to update task');
      return;
    }

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const updatedTasks = tasks.map((t) => {
      if (t.id === Number(id) && t.email === currentUser.email) {
        return {
          ...t,
          title: values.title.trim(),
          dueDate: dayjs(values.dueDate).format('YYYY-MM-DD'),
          description: values.description?.trim() || '',
        };
      }
      return t;
    });

    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    message.success('Task updated successfully!');
    navigate('/manage-tasks');
  };

  return (
    <div
      className={`edit-task-page ${theme}-theme`}
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
        boxSizing: 'border-box',
      }}
    >
      <Card
        className="themed-box"
        bordered={false}
        style={{
          width: '100%',
          maxWidth: 600,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Edit Task
        </Title>

        {loading ? (
          <Spin
            size="large"
            style={{ display: 'block', textAlign: 'center', marginTop: 40 }}
          />
        ) : (
          <Form form={form} layout="vertical" onFinish={onFinish}>
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
                  Save Changes
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default EditTask;
