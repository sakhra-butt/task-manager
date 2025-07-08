// src/pages/ManageTasks.jsx
import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Input,
  Select,
  Popconfirm,
  message,
  Row,
  Col,
  Card,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const ManageTasks = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const userTasks = allTasks.filter((task) => task.email === currentUser.email);
    setTasks(userTasks);
  }, []);

  const handleDelete = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedAll = allTasks.filter((task) => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(updatedAll));
    setTasks(updatedTasks);
    message.success('Task deleted successfully!');
  };

  const handleToggleComplete = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedAll = allTasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    localStorage.setItem('tasks', JSON.stringify(updatedAll));
    setTasks(updatedTasks);
    message.success('Task status updated.');
  };

  const handleSearch = (value) => {
    setSearchText(value.trim().toLowerCase());
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    message.success('Logged out successfully');
    navigate('/login');
  };

  const filteredTasks = tasks.filter((task) => {
    const matchStatus =
      filter === 'all' ||
      (filter === 'completed' && task.completed) ||
      (filter === 'incomplete' && !task.completed);
    const matchSearch = task.title.toLowerCase().includes(searchText);
    return matchStatus && matchSearch;
  });

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <span style={{ textDecoration: record.completed ? 'line-through' : 'none' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Status',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed) =>
        completed ? <Tag color="green">Completed</Tag> : <Tag color="orange">Pending</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/manage-tasks/${record.id}`)}>
            Edit
          </Button>
          <Button type="link" onClick={() => handleToggleComplete(record.id)}>
            {record.completed ? 'Mark Incomplete' : 'Mark Complete'}
          </Button>
          <Popconfirm
            title="Are you sure to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="link">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      className={`manage-task-page ${theme}-theme`}
      style={{
        minHeight: '100vh',
        padding: '24px',
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f0f2f5',
      }}
    >
      <Card
        bordered={false}
        style={{
          maxWidth: 1200,
          margin: 'auto',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3}>Manage Tasks</Title>
          </Col>
          <Col>
            <Space>
              <Button type="primary" onClick={() => navigate('/manage-tasks/new')}>
                + Add Task
              </Button>
              <Button danger onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Search
              placeholder="Search by title"
              allowClear
              enterButton
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              defaultValue="all"
              onChange={(value) => setFilter(value)}
              style={{ width: '100%' }}
            >
              <Option value="all">All Tasks</Option>
              <Option value="completed">Completed</Option>
              <Option value="incomplete">Incomplete</Option>
            </Select>
          </Col>
        </Row>

        <Table
          dataSource={filteredTasks}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default ManageTasks;
