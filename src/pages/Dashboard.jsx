// Core/Library
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

// Third-party
import {
  Row,
  Col,
  Card,
  Button,
  Avatar,
  Drawer,
  Menu,
  Tooltip,
  Space,
  Typography,
} from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

// Local
import { useTheme } from "../context/ThemeContext";
import { logout } from "../features/authSlice";
import { fetchTasks } from "../features/taskSlice";

// Styles
import "../styles/Dashboard.scss";

const COLORS = ["#52c41a", "#f5222d", "#faad14"];
const GRADIENT_COLORS = ["#1890ff", "#722ed1"];
const { Title } = Typography;

// Dashboard
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    completed: 0,
    incomplete: 0,
    pending: 0,
  });

  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.tasks.list || []);
  const { theme } = useTheme();

  // userTasks
  const userTasks = tasks.filter((task) => task.user === user?._id);
  const completedTasks = userTasks.filter(
    (task) => task.status === "completed"
  );
  const incompleteTasks = userTasks.filter(
    (task) => task.status === "incomplete"
  );
  const pendingTasks = userTasks.filter((task) => task.status === "pending");

  // useEffect for animated values
  useEffect(() => {
    setAnimatedValues({
      completed: completedTasks.length,
      incomplete: incompleteTasks.length,
      pending: pendingTasks.length,
    });
  }, [completedTasks.length, incompleteTasks.length, pendingTasks.length]);

  // useEffect for fetching tasks
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // pieData
  const pieData = [
    { name: "Completed", value: completedTasks.length, color: "#52c41a" },
    { name: "Incomplete", value: incompleteTasks.length, color: "#f5222d" },
    { name: "Pending", value: pendingTasks.length, color: "#faad14" },
  ];

  // generateProductivityData
  const generateProductivityData = () => {
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayName = date.toLocaleDateString("en", { weekday: "short" });
      const dateStr = date.toISOString().split("T")[0];
      const dayTasks = userTasks.filter((task) => {
        const taskDate = new Date(task.createdAt || task.dueDate);
        return taskDate.toISOString().split("T")[0] === dateStr;
      });
      const completedCount = dayTasks.filter(
        (task) => task.status === "completed"
      ).length;
      const totalCount = dayTasks.length;
      const productivity =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      last7Days.push({
        day: dayName,
        completed: completedCount,
        total: totalCount,
        productivity: productivity,
      });
    }
    return last7Days;
  };

  const productivityData = generateProductivityData();

  // generateMonthlyData
  const generateMonthlyData = () => {
    const monthlyData = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = monthDate.toLocaleDateString("en", { month: "short" });
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const monthTasks = userTasks.filter((task) => {
        const taskDate = new Date(task.createdAt || task.dueDate);
        return taskDate.getFullYear() === year && taskDate.getMonth() === month;
      });
      const completed = monthTasks.filter(
        (task) => task.status === "completed"
      ).length;
      const pending = monthTasks.filter(
        (task) => task.status === "pending"
      ).length;
      const incomplete = monthTasks.filter(
        (task) => task.status === "incomplete"
      ).length;
      monthlyData.push({
        month: monthName,
        completed,
        pending,
        incomplete,
        total: completed + pending + incomplete,
      });
    }
    return monthlyData;
  };

  const monthlyData = generateMonthlyData();

  // generateTaskTrends
  const generateTaskTrends = () => {
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayName = date.toLocaleDateString("en", { weekday: "short" });
      const completedOnDay = userTasks.filter((task) => {
        if (task.status !== "completed" || !task.updatedAt) return false;
        const completedDate = new Date(task.updatedAt);
        return completedDate.toDateString() === date.toDateString();
      }).length;
      const dueOnDay = userTasks.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate.toDateString() === date.toDateString();
      }).length;
      last7Days.push({
        day: dayName,
        completed: completedOnDay,
        total: dueOnDay || completedOnDay,
      });
    }
    return last7Days;
  };

  const taskTrendsData = generateTaskTrends();

  // priorityPieData
  const priorityPieData = [
    {
      name: "High",
      value: userTasks.filter((t) => t.priority === "high").length,
      color: "#f5222d",
    },
    {
      name: "Medium",
      value: userTasks.filter((t) => t.priority === "medium").length,
      color: "#52c41a",
    },
    {
      name: "Low",
      value: userTasks.filter((t) => t.priority === "low").length,
      color: "#faad14",
    },
  ];

  // statusPriorityData
  const statusPriorityData = ["completed", "pending", "incomplete"].map(
    (status) => {
      const high = userTasks.filter(
        (t) => t.status === status && t.priority === "high"
      ).length;
      const medium = userTasks.filter(
        (t) => t.status === status && t.priority === "medium"
      ).length;
      const low = userTasks.filter(
        (t) => t.status === status && t.priority === "low"
      ).length;
      return {
        status: status.charAt(0).toUpperCase() + status.slice(1),
        High: high,
        Medium: medium,
        Low: low,
      };
    }
  );

  // handleLogout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // CustomTooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color }}>
              {`${item.name}: ${item.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // handleMenuClick
  const handleMenuClick = ({ key }) => {
    navigate(key);
    setDrawerVisible(false);
  };

  const completionRate =
    userTasks.length > 0
      ? Math.round((completedTasks.length / userTasks.length) * 100)
      : 0;

  return (
    <div
      className="dashboard-container"
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        backgroundColor: theme === "dark" ? "#18191a" : "#ffffff",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Top Navbar - Consistent with ManageTasks */}
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <MenuOutlined
              onClick={() => setDrawerVisible(true)}
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
            <span style={{ color: "#fff", fontSize: "20px", fontWeight: 600 }}>
              Dashboard
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

      {/* Sidebar Drawer - Consistent with ManageTasks */}
      <Drawer
        title="Menu"
        placement="left"
        closable={true}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={260}
        styles={{
          body: {
            padding: 0,
            background: theme === "dark" ? "#23272f" : undefined,
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
      <div style={{ padding: "0 20px" }}>
        {/* Dashboard Header */}
        <Row
          justify="space-between"
          align="middle"
          style={{
            marginBottom: 32,
            marginTop: 24,
            paddingTop: 8,
            animation: "fadeInUp 0.8s ease-out",
          }}
        >
          <Col xs={24}>
            <Title
              level={2}
              style={{
                color: "#000",
                margin: 0,
                textAlign: "left",
                lineHeight: "40px",
                background: "linear-gradient(135deg, #1890ff, #722ed1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Welcome back, {user?.name ? user.name : "User"}!
            </Title>
          </Col>
        </Row>

        {/* Statistics Cards - FIXED SPACING */}
        <Row
          gutter={[16, 16]}
          className="stats-row"
          style={{
            animation: "fadeInUp 1s ease-out",
            marginBottom: 16,
          }}
        >
          <Col xs={24} sm={12} md={12} lg={6}>
            <Card
              className="stat-card completed-card"
              style={{
                background: theme === "dark" ? "#232526" : "#fff",
                minHeight: 50,
                padding: 8,
              }}
            >
              <div className="stat-content" style={{ padding: "2px 0" }}>
                <div
                  className="stat-icon"
                  style={{
                    fontSize: 24,
                    padding: 10,
                    minWidth: 40,
                    minHeight: 40,
                  }}
                >
                  <CheckCircleOutlined />
                </div>
                <div className="stat-info">
                  <h3>{animatedValues.completed}</h3>
                  <p>Completed Tasks</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Card
              className="stat-card incomplete-card"
              style={{
                background: theme === "dark" ? "#232526" : "#fff",
                minHeight: 50,
                padding: 8,
              }}
            >
              <div className="stat-content" style={{ padding: "2px 0" }}>
                <div
                  className="stat-icon"
                  style={{
                    fontSize: 24,
                    padding: 10,
                    minWidth: 40,
                    minHeight: 40,
                  }}
                >
                  <ExclamationCircleOutlined />
                </div>
                <div className="stat-info">
                  <h3>{animatedValues.incomplete}</h3>
                  <p>Incomplete Tasks</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Card
              className="stat-card pending-card"
              style={{
                background: theme === "dark" ? "#232526" : "#fff",
                minHeight: 50,
                padding: 8,
              }}
            >
              <div className="stat-content" style={{ padding: "2px 0" }}>
                <div
                  className="stat-icon"
                  style={{
                    fontSize: 24,
                    padding: 10,
                    minWidth: 40,
                    minHeight: 40,
                  }}
                >
                  <ClockCircleOutlined />
                </div>
                <div className="stat-info">
                  <h3>{animatedValues.pending}</h3>
                  <p>Pending Tasks</p>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Card
              className="stat-card completion-card"
              style={{
                background: theme === "dark" ? "#232526" : "#fff",
                minHeight: 50,
                padding: 8,
              }}
            >
              <div className="stat-content" style={{ padding: "2px 0" }}>
                <div
                  className="stat-icon"
                  style={{
                    fontSize: 24,
                    padding: 10,
                    minWidth: 40,
                    minHeight: 40,
                  }}
                >
                  <TrophyOutlined />
                </div>
                <div className="stat-info">
                  <h3>{completionRate}%</h3>
                  <p>Completion Rate</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts Section - FIXED SPACING */}
        <Row
          gutter={[16, 16]}
          className="charts-row"
          style={{
            animation: "fadeInUp 1.2s ease-out",
            marginBottom: 16,
          }}
        >
          <Col xs={24} md={12} lg={12}>
            <Card
              title="Task Priority Distribution"
              className="chart-card"
              style={{
                background: theme === "dark" ? "#232526" : "#fff",
                padding: 8,
                minHeight: 120,
              }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={priorityPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityPieData.map((entry, index) => (
                      <Cell key={`cell-priority-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          {/* Status & Priority Breakdown Bar Chart */}
          <Col xs={24} md={12} lg={12}>
            <Card
              title="Status & Priority Breakdown"
              className="chart-card"
              style={{
                background: theme === "dark" ? "#232526" : "#fff",
                padding: 8,
                minHeight: 120,
              }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusPriorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <ReTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="High" fill="#f5222d" />
                  <Bar dataKey="Medium" fill="#52c41a" />
                  <Bar dataKey="Low" fill="#faad14" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Task Completion Trends and Recent Tasks - FIXED SPACING */}
        <Row
          gutter={[16, 16]}
          className="charts-row"
          style={{
            animation: "fadeInUp 1.4s ease-out",
            marginBottom: 16,
          }}
        >
          {/* Task Completion Trends (moved here) */}
          <Col xs={24} lg={16}>
            <Card
              title="Task Completion Trends (Last 7 Days)"
              className="performance-card"
              style={{
                background: theme === "dark" ? "#232526" : "#fff",
                height: 346,
                minHeight: 346,
                maxHeight: 346,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={taskTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ReTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#52c41a"
                    strokeWidth={3}
                    dot={{ fill: "#52c41a", strokeWidth: 2, r: 6 }}
                    name="Tasks Completed"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#1890ff"
                    strokeWidth={3}
                    dot={{ fill: "#1890ff", strokeWidth: 2, r: 6 }}
                    name="Tasks Due"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Recent Tasks Summary */}
          <Col xs={24} lg={8}>
            <Card
              title="Recent Tasks"
              className="recent-tasks-card"
              style={{
                background: theme === "dark" ? "#232526" : "#fff",
                height: 346,
                minHeight: 346,
                maxHeight: 346,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                className="task-summary"
                style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}
              >
                {userTasks.slice(0, 5).map((task, index) => (
                  <div key={task._id || index} className="task-item">
                    <div className="task-info">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                        }}
                      >
                        <span className="task-title">{task.title}</span>
                        <span className="task-date">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "No due date"}
                        </span>
                      </div>
                      <span className={`task-status status-${task.status}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
                {userTasks.length === 0 && (
                  <div className="no-tasks">
                    <p>No tasks found. Create your first task!</p>
                    <Button
                      type="primary"
                      onClick={() => navigate("/manage-tasks")}
                    >
                      Go to Tasks
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

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

        .stat-card {
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: none;
          min-height: 120px;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 8px 0;
        }

        .stat-icon {
          font-size: 32px;
          padding: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 64px;
          min-height: 64px;
        }

        .completed-card .stat-icon {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .incomplete-card .stat-icon {
          background: rgba(245, 34, 45, 0.1);
          color: #f5222d;
        }

        .pending-card .stat-icon {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .completion-card .stat-icon {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        .stat-info {
          text-align: right;
          flex: 1;
          padding-left: 16px;
        }

        .stat-info h3 {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
          color: #262626;
          line-height: 1;
        }

        .stat-info p {
          font-size: 14px;
          color: #8c8c8c;
          margin: 4px 0 0 0;
          white-space: nowrap;
        }

        .chart-card {
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          min-height: 380px;
        }

        .chart-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .recent-tasks-card {
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          min-height: 380px;
        }

        .task-summary {
          max-height: 300px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        .task-item {
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: stretch;
        }

        .task-item:last-child {
          border-bottom: none;
        }

        .task-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .task-title {
          font-weight: 500;
          color: #262626;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
        }

        .task-status {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .status-completed {
          background: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        .status-pending {
          background: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        .status-incomplete {
          background: rgba(245, 34, 45, 0.1);
          color: #f5222d;
        }

        .task-date {
          font-size: 12px;
          color: #8c8c8c;
          text-align: left;
        }

        .no-tasks {
          text-align: center;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .no-tasks p {
          margin-bottom: 16px;
          color: #8c8c8c;
        }

        .performance-card {
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .custom-tooltip {
          background: white;
          padding: 12px;
          border: 1px solid #d9d9d9;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .custom-tooltip .label {
          font-weight: 600;
          margin-bottom: 4px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 0 12px;
          }

          .stat-info h3 {
            font-size: 24px;
          }

          .stat-icon {
            font-size: 24px;
            padding: 12px;
            min-width: 48px;
            min-height: 48px;
          }
        }
        .stat-card .ant-card-body {
          padding: 15px !important;
          border-radius: 8px !important;
        }
        .recent-tasks-card .ant-card-body {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
