import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Input,
  Select,
  Popconfirm,
  Row,
  Col,
  Modal,
  Form,
  DatePicker,
  Avatar,
  Dropdown,
  Empty,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
//import Switch from "react-switch";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  fetchTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../features/taskSlice";
import { logout } from "../features/authSlice";
import "../styles/theme.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const ManageTasks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { token, user } = useSelector((state) => state.auth);

  //  for undefined state
  const taskState = useSelector((state) => state.tasks);
  const tasks = taskState?.list || [];
  const loading = taskState?.loading || false;
  const error = taskState?.error || null;

  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [form] = Form.useForm();

  // Fixed toast notification functions
  const showSuccessToast = (title) => {
    toast.success(title, {
      duration: 3000,
      position: "top-center",
      style: {
        background: theme === "dark" ? "#262626" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        border: "1px solid #52c41a",
        borderRadius: "8px",
        padding: "16px",
      },
    });
  };

  const showErrorToast = (title) => {
    toast.error(title, {
      duration: 4000,
      position: "top-center",
      style: {
        background: theme === "dark" ? "#262626" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        border: "1px solid #ff4d4f",
        borderRadius: "8px",
        padding: "16px",
      },
    });
  };

  const showWarningToast = (title) => {
    toast(title, {
      duration: 3000,
      position: "top-center",
      icon: "⚠️",
      style: {
        background: theme === "dark" ? "#262626" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        border: "1px solid #faad14",
        borderRadius: "8px",
        padding: "16px",
      },
    });
  };

  const showLoadingToast = (title) => {
    return toast.loading(title, {
      position: "top-center",
      style: {
        background: theme === "dark" ? "#262626" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        borderRadius: "8px",
        padding: "16px",
      },
    });
  };

  useEffect(() => {
    if (!token) {
      showWarningToast("Please log in to access your tasks");
      navigate("/login");
    } else {
      dispatch(fetchTasks());
    }
  }, [token, dispatch, navigate]);

  // Enhanced error handling with detailed toasts
  useEffect(() => {
    if (error) {
      showErrorToast(`Operation failed: ${error}`);
    }
  }, [error]);

  const handleLogout = () => {
    const toastId = showLoadingToast("Logging out...");
    setTimeout(() => {
      toast.dismiss(toastId);
      dispatch(logout());
      showSuccessToast("Logged out successfully");
      navigate("/login");
    }, 1000);
  };

  const handleSearch = (value) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchText(trimmedValue);
  };

  const handleRowClick = (record = null) => {
    setCurrentTask(record);
    if (record) {
      form.setFieldsValue({
        title: record.title,
        dueDate: record.dueDate ? moment(record.dueDate) : null,
        description: record.description || "",
        status: record.status || "pending",
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalSave = async () => {
    try {
      const values = await form.validateFields();
      const taskData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : null,
        status: values.status || "pending",
      };

      const toastId = showLoadingToast(
        currentTask ? "Updating task..." : "Creating task..."
      );

      if (currentTask) {
        await dispatch(
          updateTask({ id: currentTask._id, updates: taskData })
        ).unwrap();
        toast.dismiss(toastId);
        showSuccessToast("Task updated successfully");
      } else {
        await dispatch(addTask(taskData)).unwrap();
        toast.dismiss(toastId);
        showSuccessToast("Task created successfully");
      }

      setIsModalVisible(false);
    } catch (error) {
      const errorMessage = error?.message || error || "Unknown error occurred";
      showErrorToast(
        currentTask ? "Failed to update task" : "Failed to create task"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      const taskToDelete = tasks.find((task) => task._id === id);
      const toastId = showLoadingToast("Deleting task...");

      await dispatch(deleteTask(id)).unwrap();
      toast.dismiss(toastId);
      showSuccessToast("Task deleted successfully");
    } catch (error) {
      showErrorToast("Failed to delete task");
    }
  };

  const cycleStatus = (status) => {
    if (status === "pending") return "completed";
    if (status === "completed") return "incomplete";
    return "pending";
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = cycleStatus(currentStatus);
      const toastId = showLoadingToast("Updating status...");

      await dispatch(
        updateTask({ id, updates: { status: newStatus } })
      ).unwrap();

      toast.dismiss(toastId);
      showSuccessToast(`Task status updated to ${newStatus}`);
    } catch (error) {
      showErrorToast("Failed to update status");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (!task || !task.title) return false;
    const matchStatus = filter === "all" || task.status === filter;
    const matchSearch = task.title.toLowerCase().includes(searchText);
    return matchStatus && matchSearch;
  });

  const getStatusTag = (status, id) => {
    const colorMap = {
      pending: "orange",
      completed: "green",
      incomplete: "red",
    };

    return (
      <Tag
        color={colorMap[status] || "orange"}
        onClick={() => handleToggleStatus(id, status)}
        style={{ cursor: "pointer" }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setFilter("all");
    setSearchText("");
  };

  // Filter change handler
  const handleFilterChange = (value) => {
    setFilter(value);
  };

  // Modal cancel handler
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Custom empty state component
  const renderEmptyState = () => {
    const hasFilters = filter !== "all" || searchText !== "";

    if (hasFilters) {
      // No results for current filters
      return (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          <SearchOutlined
            style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }}
          />
          <Title
            level={3}
            style={{
              color: theme === "dark" ? "#fff" : "#000",
              marginBottom: 8,
            }}
          >
            No tasks match your search
          </Title>
          <Text
            style={{
              color: theme === "dark" ? "#bfbfbf" : "#666",
              display: "block",
              fontSize: 16,
            }}
          >
            Try adjusting your filters or search terms
          </Text>
        </div>
      );
    } else {
      // No tasks at all
      return (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          <CheckCircleOutlined
            style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }}
          />
          <Title
            level={3}
            style={{
              color: theme === "dark" ? "#fff" : "#000",
              marginBottom: 8,
            }}
          >
            No tasks yet
          </Title>
          <Text
            style={{
              color: theme === "dark" ? "#bfbfbf" : "#666",
              display: "block",
              marginBottom: 24,
              fontSize: 16,
            }}
          >
            Start organizing your work by creating your first task
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={() => handleRowClick(null)}
            icon={<PlusOutlined />}
          >
            Create your first task
          </Button>
        </div>
      );
    }
  };

  // Fixed columns array with proper centering
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "20%",
      ellipsis: true,
      align: "center", // Center align the content
      render: (text, record) => (
        <span
          style={{
            textDecoration:
              record.status === "completed" ? "line-through" : "none",
            cursor: "pointer",
          }}
          onClick={() => handleRowClick(record)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: "20%",
      align: "center", // Center align the content
      responsive: ["sm"],
      render: (date) => {
        if (!date) return "No Due Date";
        return moment(date).format("YYYY-MM-DD");
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "20%",
      ellipsis: true,
      align: "center", // Center align the content
      responsive: ["md"],
      render: (text) => text || "No description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "20%",
      align: "center", // Center align the content
      render: (_, record) => getStatusTag(record.status, record._id),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      align: "center", // Center align the content
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleRowClick(record)}
            size="small"
            style={{
              padding: "2px 4px",
              minWidth: "auto",
              height: "28px",
            }}
            title="Edit"
          />
          <Popconfirm
            title="Are you sure to delete this task?"
            description={`This will permanently delete "${record.title}"`}
            onConfirm={() => handleDelete(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{
                padding: "2px 4px",
                minWidth: "auto",
                height: "28px",
              }}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Helper function to get user email with better fallback logic
  const getUserEmail = () => {
    if (user?.email) {
      return user.email;
    } else if (user?.name) {
      return user.name;
    } else {
      return "User";
    }
  };

  // User menu for dropdown
  const userMenu = {
    items: [
      {
        key: "email",
        label: (
          <div style={{ padding: "8px 0", minWidth: "200px" }}>
            <strong>Logged in as:</strong>
            <br />
            <span style={{ color: theme === "dark" ? "#1890ff" : "#1890ff" }}>
              {getUserEmail()}
            </span>
          </div>
        ),
        disabled: true,
      },
    ],
  };

  return (
    <div
      className={`manage-task-page ${theme}-theme`}
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Toast Container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === "dark" ? "#262626" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            border: `1px solid ${theme === "dark" ? "#404040" : "#e8e8e8"}`,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
            padding: "16px",
          },
        }}
      />

      {/* Top Navbar  */}
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: theme === "dark" ? "#2f2f2f" : "#f5f5f5",
          borderBottom: `1px solid ${theme === "dark" ? "#404040" : "#e8e8e8"}`,
          margin: 0,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title
              level={4}
              style={{
                color: theme === "dark" ? "#fff" : "#000",
                margin: 0,
                fontWeight: "500",
              }}
            >
              Welcome!
            </Title>
          </Col>
          <Col>
            <Space align="center">
              <Dropdown
                menu={userMenu}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Avatar
                  icon={<UserOutlined />}
                  size={32}
                  style={{
                    cursor: "pointer",
                    backgroundColor: theme === "dark" ? "#1890ff" : "#1890ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </Dropdown>
              <Button
                type="default"
                onClick={handleLogout}
                style={{ color: "red", borderColor: "red" }}
              >
                Logout
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <div style={{ padding: "0 16px" }}>
        {/* App Header with Manage Tasks */}
        <Row
          justify="space-between"
          align="middle"
          style={{
            marginBottom: 24,
            marginTop: 24,
            paddingTop: 8,
          }}
        >
          <Col xs={24} sm={14} md={16} lg={18} xl={18}>
            <Title
              level={2}
              style={{
                color: theme === "dark" ? "#fff" : "#000",
                margin: 0,
                textAlign: "left",
                lineHeight: "40px",
              }}
            >
              Manage Tasks
            </Title>
          </Col>
          <Col xs={24} sm={10} md={8} lg={6} xl={6}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: window.innerWidth < 576 ? "12px" : "0",
              }}
            >
              <Button
                type="primary"
                onClick={() => handleRowClick(null)}
                style={{
                  minWidth: "100px",
                  height: "40px",
                  fontSize: "14px",
                }}
              >
                + Add Task
              </Button>
            </div>
          </Col>
        </Row>

        {/* Search and Filter Controls */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Search by title"
              allowClear
              enterButton
              value={searchText}
              onSearch={handleSearch}
              onChange={(e) => {
                const value = e.target.value.trim().toLowerCase();
                setSearchText(value);
              }}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              value={filter}
              onChange={handleFilterChange}
              style={{ width: "100%" }}
              placeholder="Filter by status"
            >
              <Option value="all">All Tasks</Option>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="incomplete">Incomplete</Option>
            </Select>
          </Col>
          {(filter !== "all" || searchText) && (
            <Col xs={24} sm={12} md={6} lg={4}>
              <Button onClick={clearAllFilters} style={{ width: "100%" }}>
                Clear Filters
              </Button>
            </Col>
          )}
        </Row>

        {/* Tasks Table - Fixed and Centered */}
        <Table
          dataSource={filteredTasks}
          columns={columns}
          rowKey="_id"
          loading={loading}
          locale={{
            emptyText: renderEmptyState(),
          }}
          pagination={
            filteredTasks.length > 0
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} tasks`,
                  style: {
                    textAlign: "center",
                    marginTop: "16px",
                  },
                }
              : false
          }
          scroll={{ x: 800 }}
          style={{
            backgroundColor: theme === "dark" ? "#2f2f2f" : "#ffffff",
          }}
        />
      </div>

      {/* Task Modal */}
      <Modal
        title={currentTask ? "Edit Task" : "Add Task"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalSave}
        okText="Save"
        width={600}
        destroyOnClose
        maskClosable={false}
        confirmLoading={loading}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Enter task title" }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>
          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: "Select due date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select due date"
            />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Enter task description (optional)"
            />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select placeholder="Select task status">
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
