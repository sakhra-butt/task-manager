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
  Modal,
  Form,
  DatePicker,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Switch from 'react-switch';
import moment from 'moment';
import '../styles/theme.scss';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const ManageTasks = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [form] = Form.useForm();

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

  const handleSearch = (value) => {
    setSearchText(value.trim().toLowerCase());
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    message.success('Logged out successfully');
    navigate('/login');
  };

  const handleRowClick = (record = null) => {
    setCurrentTask(record);
    if (record) {
      form.setFieldsValue({
        title: record.title,
        dueDate: moment(record.dueDate),
        description: record.description || '',
        status: record.status || 'pending',
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalSave = () => {
    form.validateFields().then((values) => {
      const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));

      if (currentTask) {
        const updatedTask = {
          ...currentTask,
          ...values,
          dueDate: values.dueDate.format('YYYY-MM-DD'),
        };

        const updatedTasks = tasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        );
        const updatedAll = allTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        );

        localStorage.setItem('tasks', JSON.stringify(updatedAll));
        setTasks(updatedTasks);
        message.success('Task updated successfully');
      } else {
        const newTask = {
          id: Date.now(),
          ...values,
          email: currentUser.email,
          dueDate: values.dueDate.format('YYYY-MM-DD'),
        };

        const newTasks = [...tasks, newTask];
        const newAll = [...allTasks, newTask];
        localStorage.setItem('tasks', JSON.stringify(newAll));
        setTasks(newTasks);
        message.success('Task added successfully');
      }

      setIsModalVisible(false);
    });
  };

  const cycleStatus = (status) => {
    if (status === 'pending') return 'completed';
    if (status === 'completed') return 'incomplete';
    return 'pending';
  };

  const handleToggleStatus = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, status: cycleStatus(task.status || 'pending') } : task
    );

    const allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedAll = allTasks.map((task) =>
      task.id === id ? { ...task, status: cycleStatus(task.status || 'pending') } : task
    );

    localStorage.setItem('tasks', JSON.stringify(updatedAll));
    setTasks(updatedTasks);
    message.success('Task status updated!');
  };

  const filteredTasks = tasks.filter((task) => {
    const taskStatus = task.status || 'pending';
    const matchStatus = filter === 'all' || filter === taskStatus;
    const matchSearch = task.title.toLowerCase().includes(searchText);
    return matchStatus && matchSearch;
  });

  const getStatusTag = (status, id) => {
    const colorMap = {
      pending: 'orange',
      completed: 'green',
      incomplete: 'red',
    };

    return (
      <Tag
        color={colorMap[status] || 'orange'}
        onClick={() => handleToggleStatus(id)}
        style={{ cursor: 'pointer' }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <span style={{ textDecoration: record.status === 'completed' ? 'line-through' : 'none' }}>
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{text}</div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => getStatusTag(record.status || 'pending', record.id),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" style={{ color: '#1677ff' }} onClick={() => handleRowClick(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger style={{ padding: 0 }}>
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
        width: '100%',
        overflowX: 'hidden',
        padding: 16,
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
        boxSizing: 'border-box',
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <Col>
          <Title level={3} style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
            Manage Tasks
          </Title>
        </Col>
        <Col>
          <Space>
            <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
            <Switch onChange={toggleTheme} checked={theme === 'dark'} />
            <Button type="primary" onClick={() => handleRowClick(null)}>
              + Add Task
            </Button>
            <Button type="default" onClick={handleLogout} style={{ color: 'red', borderColor: 'red' }}>
              Logout
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Search
            placeholder="Search by title"
            allowClear
            enterButton
            onSearch={handleSearch}
            style={{ color: theme === 'dark' ? '#fff' : '#000' }}
          />
        </Col>
        <Col xs={24} md={12}>
          <Select
            defaultValue="all"
            onChange={(value) => setFilter(value)}
            style={{ width: '100%' }}
          >
            <Option value="all">All Tasks</Option>
            <Option value="pending">Pending</Option>
            <Option value="completed">Completed</Option>
            <Option value="incomplete">Incomplete</Option>
          </Select>
        </Col>
      </Row>

      {/* 👇 Added scroll wrapper */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <Table
          dataSource={filteredTasks}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onDoubleClick: () => handleRowClick(record),
          })}
          style={{ minWidth: 800 }} // 👈 prevent table collapse
        />
      </div>

      <Modal
        title={currentTask ? 'Edit Task' : 'Add Task'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleModalSave}
        okText="Save"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input style={theme === 'dark' ? { color: '#fff' } : {}} />
          </Form.Item>
          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: 'Please select due date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              inputReadOnly
              popupClassName={theme === 'dark' ? 'dark-datepicker' : ''}
            />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} style={theme === 'dark' ? { color: '#fff' } : {}} />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select style={theme === 'dark' ? { color: '#fff' } : {}}>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="incomplete">Incomplete</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageTasks;
