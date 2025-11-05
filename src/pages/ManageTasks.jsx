// Core/Library
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

// Third-party
import {
  Table, Button, Space, Typography, Tag, Input, Select, Popconfirm, Row, Col, Modal, Form, DatePicker, Avatar, Dropdown, Empty, Drawer, Menu, Tooltip, Card,
} from "antd";
import {
  UserOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, FilterOutlined, CheckCircleOutlined, ExclamationCircleOutlined, MenuOutlined, DashboardOutlined, UnorderedListOutlined, LogoutOutlined, ClockCircleOutlined, AudioOutlined,
} from "@ant-design/icons";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import { message } from "antd";
import * as chrono from "chrono-node";

// Local
import { useTheme } from "../context/ThemeContext";
import {
  fetchTasks, addTask, updateTask, deleteTask, clearError,
} from "../features/taskSlice";
import { logout } from "../features/authSlice";

// Styles
import "../styles/theme.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const ManageTasks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const { token, user } = useSelector((state) => state.auth);

  // For undefined state
  const taskState = useSelector((state) => state.tasks);
  const tasks = taskState?.list || [];
  const loading = taskState?.loading || false;
  const error = taskState?.error || null;

  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [form] = Form.useForm();

  const recognitionRef = React.useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [pendingVoiceFields, setPendingVoiceFields] = useState([]);
  const [voiceData, setVoiceData] = useState({ title: '', dueDate: null, priority: '', description: '' });
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [listeningMessage, setListeningMessage] = useState("");
  // Add this for debugging
  const [lastTranscript, setLastTranscript] = useState("");
  // Remove the voiceMode state and toggle UI
  // Only use smart parsing logic in recognition.onresult

  const startSmartVoiceInput = () => {
    setIsListening(true);
    setPendingVoiceFields([]);
    setVoiceData({ title: '', dueDate: null, priority: '', description: '' });
    setAwaitingConfirmation(false);
    handleSmartVoiceListening();
  };

  const handleSmartVoiceListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.error("Your browser does not support Speech Recognition.");
      setIsListening(false);
      setListeningMessage("");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US"; // Force English for reliability
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
      setListeningMessage("Listening... Speak now.");
    };
    recognition.onaudiostart = () => console.log("Audio capturing started");
    recognition.onsoundstart = () => console.log("Sound has been detected");
    recognition.onsoundend = () => console.log("Sound has stopped being detected");
    recognition.onspeechstart = () => console.log("Speech has been detected");
    recognition.onspeechend = () => console.log("Speech has stopped being detected");
    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
      setListeningMessage("");
    };
    recognition.onresult = (event) => {
      if (!event.results || !event.results[0] || !event.results[0][0]) {
        message.warning("No speech detected. Please try again.");
        setIsListening(false);
        setListeningMessage("");
        return;
      }
      const transcript = event.results[0][0].transcript.trim();
      console.log('DEBUG: transcript received:', transcript);

      // Strict sequence: title, due date, description, priority, status
      let title = '';
      let dueDate = null;
      let description = '';
      let priority = '';
      let status = '';

      // 1. Extract due date (first date-like phrase)
      const chronoResult = chrono.parse(transcript);
      let dateText = '';
      if (chronoResult && chronoResult.length > 0) {
        dueDate = moment(chronoResult[0].start.date());
        dateText = chronoResult[0].text;
      }

      // 2. Split transcript by dateText
      let beforeDate = transcript;
      let afterDate = '';
      if (dateText) {
        const idx = transcript.indexOf(dateText);
        beforeDate = transcript.slice(0, idx).trim();
        afterDate = transcript.slice(idx + dateText.length).trim();
      }

      // 3. Title is before the date, but only update if beforeDate is not empty
      if (beforeDate) {
        title = beforeDate;
      } else if (!dateText) {
        // If no date was found, treat the whole transcript as a possible title
        title = transcript;
      }

      // If the user only said a date, keep the previous title
      if (!title && voiceData?.title) {
        title = voiceData.title;
      }

      // If the user only said a title, keep the previous dueDate
      if (!dueDate && voiceData?.dueDate) {
        dueDate = voiceData.dueDate;
      }

      // 4. Description is the first phrase after the date, before any priority/status keywords
      let descEndIdx = afterDate.length;
      let prioMatch = afterDate.match(/\b(high|medium|low)( priority)?\b/i);
      let statMatch = afterDate.match(/\b(pending|completed|incomplete)\b/i);
      let prioIdx = prioMatch ? afterDate.indexOf(prioMatch[0]) : -1;
      let statIdx = statMatch ? afterDate.indexOf(statMatch[0]) : -1;
      let nextKeywordIdx = -1;
      if (prioIdx !== -1 && statIdx !== -1) nextKeywordIdx = Math.min(prioIdx, statIdx);
      else if (prioIdx !== -1) nextKeywordIdx = prioIdx;
      else if (statIdx !== -1) nextKeywordIdx = statIdx;
      if (nextKeywordIdx !== -1) descEndIdx = nextKeywordIdx;
      description = afterDate.slice(0, descEndIdx).trim();

      // 5. Priority (first priority keyword after date/description)
      if (prioMatch) priority = prioMatch[1].toLowerCase();

      // 6. Status (first status keyword after date/description)
      if (statMatch) status = statMatch[1].toLowerCase();

      // Fallbacks
      if (!title && voiceData?.title) {
        title = voiceData.title;
      }
      if (!priority) priority = 'medium';
      if (!status) status = 'pending';

      form.setFieldsValue({
        title: title || '',
        dueDate: dueDate || null,
        description: description || '',
        status: status,
        priority: priority,
      });
      setVoiceData((prev) => ({ ...prev, title, dueDate, description, status, priority }));
      let missing = [];
      if (!title) missing.push('title');
      if (!dueDate) missing.push('due date');
      setPendingVoiceFields(missing);
      if (missing.length === 0) {
        setIsListening(false);
        setAwaitingConfirmation(false);
        setListeningMessage("");
        setTimeout(() => handleModalSave(), 500);
        message.success("Task saved from voice input");
      } else {
        message.warning(`Missing: ${missing.join(', ')}. Please say them now.`);
        setTimeout(() => handleSmartVoiceListening(), 700);
      }
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setListeningMessage("");
      setAwaitingConfirmation(false);
      if (event.error === "no-speech") {
        message.warning("No speech detected. Please try again and speak clearly.");
      } else if (event.error === "aborted") {
        message.info("Voice input was interrupted. Please try again.");
      } else if (event.error === "not-allowed") {
        message.error("Microphone access denied. Please allow mic permissions.");
      } else {
        message.error("Speech recognition error: " + event.error);
      }
    };
    recognition.start();
  };

  // Priority color map
  const priorityColorMap = {
    high: "red",
    medium: "green",
    low: "orange",
  };

  // Cycle priority function
  const cyclePriority = (priority) => {
    if (priority === "medium") return "low";
    if (priority === "low") return "high";
    return "medium";
  };

  const [priorityFilter, setPriorityFilter] = useState("all");

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
      localStorage.clear();
      showSuccessToast("Logged out successfully");
      navigate("/login");
    }, 1000);
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setIsDrawerOpen(false);
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
        priority: record.priority || "medium",
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
        priority: values.priority || "medium",
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

      // Ensure modal closes and tasks refresh after save
      setIsModalVisible(false);
      dispatch(fetchTasks());
    } catch (error) {
      // Only rely on the global error toast (useEffect on 'error')
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

  const handleTogglePriority = async (id, currentPriority) => {
    try {
      const newPriority = cyclePriority(currentPriority);
      const toastId = showLoadingToast("Updating priority...");
      await dispatch(updateTask({ id, updates: { priority: newPriority } })).unwrap();
      toast.dismiss(toastId);
      showSuccessToast(`Task priority updated to ${newPriority}`);
    } catch (error) {
      showErrorToast("Failed to update priority");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    // Cycle through statuses: pending -> completed -> incomplete -> pending
    let newStatus;
    if (currentStatus === "pending") newStatus = "completed";
    else if (currentStatus === "completed") newStatus = "incomplete";
    else newStatus = "pending";
    try {
      const toastId = showLoadingToast("Updating status...");
      await dispatch(updateTask({ id, updates: { status: newStatus } })).unwrap();
      toast.dismiss(toastId);
      showSuccessToast(`Task status updated to ${newStatus}`);
    } catch (error) {
      showErrorToast("Failed to update status");
    }
  };

  // Priority tag renderer
  const getPriorityTag = (priority, id) => (
    <Tag
      color={priorityColorMap[priority] || "green"}
      onClick={() => handleTogglePriority(id, priority)}
      style={{ cursor: "pointer" }}
      title="Click to change priority"
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Tag>
  );

  // Clear all filters function
  const clearAllFilters = () => {
    setFilter("all");
    setSearchText("");
    setPriorityFilter("all");
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
    const hasFilters = filter !== "all" || searchText !== "" || priorityFilter !== "all";

    if (hasFilters) {
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
      align: "center",
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
      align: "center",
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
      align: "center",
      responsive: ["md"],
      render: (text) => (
        <Tooltip title={text || "No description"} placement="topLeft">
          <span style={{ cursor: text ? "pointer" : "default" }}>
            {text || "No description"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "20%",
      align: "center",
      render: (_, record) => getStatusTag(record.status, record._id),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: "20%",
      align: "center",
      render: (priority = "medium", record) => getPriorityTag(priority, record._id),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      align: "center",
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

  const filteredTasks = tasks
    .filter((task) => {
      if (!task || !task.title) return false;
      const matchStatus = filter === "all" || task.status === filter;
      const matchPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchSearch = task.title.toLowerCase().includes(searchText);
      return matchStatus && matchPriority && matchSearch;
    })
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
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

  return (
    <div
      className={`manage-task-page ${theme}-theme`}
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        backgroundColor: theme === "dark" ? "#18191a" : "#ffffff",
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

      {/* ✅ Top Navbar - Consistent with Dashboard */}
      <Row
        justify="space-between"
        align="middle"
        style={{
          background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
          padding: "0 24px",
          color: "#fff",
          flexWrap: "nowrap",
          boxShadow: "none",
          height: "56px",
          borderRadius: 0,
          alignItems: "center",
        }}
      >
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <MenuOutlined
              onClick={openDrawer}
              style={{
                fontSize: "20px",
                color: "#fff",
                marginRight: "16px",
                cursor: "pointer",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
              }}
            />
            <span style={{ color: "#fff", fontSize: "20px", fontWeight: 600, marginLeft: 0 }}>
              User Task Management
            </span>
          </div>
        </Col>
        <Col>
          <Space align="center">
            <Tooltip title={user?.email || "User"}>
              <Avatar
                style={{
                  backgroundColor: "#001529",
                  marginRight: "10px",
                  transition: "transform 0.3s ease",
                }}
                icon={<UserOutlined />}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ transition: "all 0.3s ease" }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(24,144,255,0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Logout
            </Button>
          </Space>
        </Col>
      </Row>
      <style>{`
        @media (max-width: 576px) {
          .ant-typography {
            font-size: 1.1rem !important;
          }
          .ant-avatar {
            margin-bottom: 8px;
          }
          .ant-btn-primary {
            min-width: 100% !important;
            margin-bottom: 8px;
          }
        }
      `}</style>

      {/* ✅ Sidebar Drawer - Consistent with Dashboard */}
      <Drawer
        title="Menu"
        placement="left"
        closable={true}
        onClose={closeDrawer}
        open={isDrawerOpen}
        width={260}
        styles={{
          body: {
            padding: 0,
            background: theme === 'dark' ? '#23272f' : undefined,
          },
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{
            border: "none",
            background: "linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%)",
            minHeight: "100vh",
            fontWeight: 500,
          }}
          items={[
            {
              key: "/dashboard",
              icon: <DashboardOutlined />,
              label: "Dashboard",
              style: { transition: "all 0.3s ease" },
            },
            {
              key: "/manage-tasks",
              icon: <UnorderedListOutlined />,
              label: "Manage Tasks",
              style: { transition: "all 0.3s ease" },
            },
            {
              key: "/calendar",
              icon: <ClockCircleOutlined />,
              label: "Calendar",
              style: { transition: "all 0.3s ease" },
            },
            {
              key: "/profile",
              icon: <UserOutlined />,
              label: "Profile",
              style: { transition: "all 0.3s ease" },
            },
          ]}
        />
      </Drawer>

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
            animation: "fadeInUp 0.8s ease-out",
            flexWrap: 'wrap',
          }}
        >
          <Col xs={24} sm={14} md={16} lg={18} xl={18} style={{ marginBottom: 12 }}>
            <Title
              level={2}
              style={{
                textAlign: "left",
                margin: window.innerWidth < 576 ? "16px 0 8px 0" : "32px 0 8px 32px",
                background: "linear-gradient(135deg, #1890ff, #722ed1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: window.innerWidth < 576 ? '1.3rem' : undefined,
                wordBreak: 'break-word',
              }}
            >
              Stay Organized, Stay Ahead!
            </Title>
          </Col>
          <Col xs={24} sm={10} md={8} lg={6} xl={6} style={{ display: 'flex', justifyContent: window.innerWidth < 576 ? 'flex-start' : 'flex-end', alignItems: 'center', marginBottom: window.innerWidth < 576 ? 12 : 0 }}>
            <Button
              type="primary"
              onClick={() => handleRowClick(null)}
              style={{
                minWidth: window.innerWidth < 576 ? '100%' : '100px',
                height: "40px",
                fontSize: "14px",
                background: "linear-gradient(135deg, #1890ff, #722ed1)",
                border: "none",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(24,144,255,0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 16px rgba(24,144,255,0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(24,144,255,0.3)";
              }}
            >
              + Add Task
            </Button>
          </Col>
        </Row>
        <style>{`
          @media (max-width: 576px) {
            .ant-typography {
              font-size: 1.2rem !important;
            }
            .ant-btn-primary {
              min-width: 100% !important;
              margin-bottom: 8px;
            }
          }
        `}</style>

        {/* Search and Filter Controls */}
        <Row
          gutter={[16, 16]}
          style={{
            marginBottom: 24,
            animation: "fadeInUp 1s ease-out",
          }}
        >
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
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ width: "100%" }}
              placeholder="Filter by priority"
            >
              <Option value="all">All Priorities</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>
          {(filter !== "all" || searchText || priorityFilter !== "all") && (
            <Col xs={24} sm={12} md={6} lg={4}>
              <Button
                onClick={clearAllFilters}
                style={{ width: "100%", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Clear Filters
              </Button>
            </Col>
          )}
        </Row>

        {/* Tasks Table - Fixed and Centered */}
        <div
          style={{
            animation: "fadeInUp 1.2s ease-out",
          }}
        >
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
              borderRadius: "8px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </div>

      {/* Task Modal */}
      <Modal
        title={currentTask ? "Edit Task" : "Add Task"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalSave}
        okText="Save"
        width={600}
        destroyOnHidden
        maskClosable={false}
        confirmLoading={loading}
      >
        {/* Removed Voice Input Mode toggle */}
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Enter task title" }]}
          >
            <Input
              placeholder="Enter task title"
            />
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
          <Form.Item label="Priority" name="priority">
            <Select placeholder="Select task priority">
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>
        </Form>
        {/* Floating mic button for smart voice input */}
        {!currentTask && (
          <Button
            type="primary"
            shape="circle"
            icon={<AudioOutlined />}
            size="large"
            style={{
              position: 'fixed',
              bottom: 40,
              left: 40,
              zIndex: 2000,
              background: isListening ? '#722ed1' : '#1890ff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
            onClick={startSmartVoiceInput}
            loading={isListening}
            title="Add task by voice (all fields)"
          />
        )}
      </Modal>

      {isListening && (
        <div style={{ position: 'fixed', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#fffbe6', color: '#faad14', padding: '8px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          {listeningMessage || 'Listening...'}
        </div>
      )}

      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translate3d(0, -100%, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .ant-menu-item:hover {
          transform: translateX(8px) !important;
          background: linear-gradient(135deg, #1890ff, #722ed1) !important;
          color: white !important;
        }

        .ant-menu-item-selected {
          background: linear-gradient(135deg, #1890ff, #722ed1) !important;
          color: white !important;
        }

        .ant-table-tbody > tr:hover > td {
          background: ${theme === "dark" ? "#404040" : "#f5f5f5"} !important;
          transition: all 0.3s ease !important;
        }
      `}</style>
    </div>
  );
};

export default ManageTasks;
