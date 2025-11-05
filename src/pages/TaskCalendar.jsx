import React, { useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import moment from "moment";

import {
  Calendar,
  Badge,
  Typography,
  Row,
  Col,
  Drawer,
  Menu,
  Button,
  Avatar,
  Tooltip,
  Space,
  Modal,
  Descriptions,
} from "antd";

import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import { logout } from "../features/authSlice";
import { useTheme } from "../context/ThemeContext";

const { Title } = Typography;

const TaskCalendar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.tasks.list || []);
  // userTasks filtering
  const userTasks = tasks.filter(
    (task) => String(task.user) === String(user?._id)
  );

  // Debug: log userTasks and date matching
  console.log("userTasks:", userTasks);

  // getListData
  const getListData = (date) => {
    const dateStr = moment(date).format("YYYY-MM-DD");
    const matches = userTasks.filter(
      (task) =>
        task.dueDate &&
        moment.utc(task.dueDate).local().format("YYYY-MM-DD") === dateStr
    );
    console.log("date:", dateStr, "matches:", matches);
    return matches;
  };

  //  cellRender logic
  const cellRender = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    const listData = userTasks.filter(
      (task) =>
        task.dueDate && moment(task.dueDate).format("YYYY-MM-DD") === dateStr
    );
    return (
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          textAlign: "center",
        }}
      >
        {listData.map((item) => (
          <li
            key={item._id}
            style={{
              fontSize: 13,
              fontWeight: 500,
              textAlign: "center",
              color: theme === "dark" ? "#fff" : "#222",
            }}
          >
            {item.title}
          </li>
        ))}
      </ul>
    );
  };

  // handleLogout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // handleMenuClick
  const handleMenuClick = ({ key }) => {
    navigate(key);
    setDrawerVisible(false);
  };

  const { theme } = useTheme();

  return (
    <div
      className={
        theme === "dark"
          ? "dashboard-container dark-theme"
          : "dashboard-container"
      }
      style={{
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        backgroundColor: theme === "dark" ? "#121212" : "#ffffff",
        color: theme === "dark" ? "#fff" : undefined,
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
            Calendar
          </span>
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
      {/* Sidebar Drawer  */}
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
          selectedKeys={["/calendar"]}
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
              style: {
                transition: "all 0.3s ease",
              },
            },
            {
              key: "/manage-tasks",
              icon: <UnorderedListOutlined />,
              label: "Manage Tasks",
              style: {
                transition: "all 0.3s ease",
              },
            },
            {
              key: "/calendar",
              icon: <ClockCircleOutlined />,
              label: "Calendar",
              style: {
                transition: "all 0.3s ease",
                background:
                  location.pathname === "/calendar"
                    ? "linear-gradient(135deg, #1890ff, #722ed1)"
                    : undefined,
                color: location.pathname === "/calendar" ? "#fff" : undefined,
              },
            },
            {
              key: "/profile",
              icon: <UserOutlined />,
              label: "Profile",
              style: {
                transition: "all 0.3s ease",
              },
            },
          ]}
        />
      </Drawer>
      {/* Main Content */}
      <div
        className={theme === "dark" ? "calendar-main-content-dark" : ""}
        style={{
          padding: 0,
          minHeight: "calc(100vh - 64px)",
          background: theme === "dark" ? "#000" : "#f5f7fa",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          width: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            background: theme === "dark" ? "#232526" : "#f5f6fa",
            marginTop: 24,
            marginBottom: 8,
            padding: "24px 0 16px 0",
          }}
        >
          <Title
            level={2}
            style={{
              textAlign: "left",
              margin: 0,
              background: "linear-gradient(135deg, #1890ff, #722ed1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginLeft: "24px",
            }}
          >
            Your Month at a Glance.
          </Title>
        </div>
        <div
          style={{
            width: "100%",
            background: theme === "dark" ? "#393b3f" : "#fff",
            borderRadius: 0,
            padding: 0,
            margin: 0,
          }}
          className={theme === "dark" ? "calendar-header-area-dark" : ""}
        >
          <style>{`
                        .ant-picker-calendar-header {
                          margin-left: 71%;
                        }
                        .ant-picker-calendar-year-select {
                          margin-right: 16px !important;
                        }
                        .ant-picker-calendar-month-select {
                          margin-right: 16px !important;
                        }
                        .ant-picker-calendar-mode-switch {
                          margin-right: 0 !important;
                        }
                    `}</style>
          <Calendar
            cellRender={cellRender}
            fullscreen={true}
            className={theme === "dark" ? "dark-calendar" : ""}
          />
        </div>
        {theme === "dark" && (
          <style>{`
                    .dark-theme {
                      background: #121212 !important;
                      color: #fff !important;
                    }
                    .dark-theme .ant-picker-calendar,
                    .dark-theme .ant-picker-panel,
                    .dark-theme .ant-picker-content th,
                    .dark-theme .ant-picker-content td,
                    .dark-theme .ant-picker-cell-inner {
                      background: #121212 !important;
                      color: #fff !important;
                    }
                    .calendar-header-area-dark {
                      background: #232526 !important;
                      border: 2px solid #232526 !important;
                      border-radius: 8px;
                    }
                    .dark-calendar .ant-picker-header,
                    .dark-calendar .ant-picker-header button,
                    .dark-calendar .ant-picker-header-view,
                    .dark-calendar .ant-picker-calendar-mode-switch,
                    .dark-calendar .ant-picker-calendar-year-select,
                    .dark-calendar .ant-picker-calendar-month-select {
                      background: #393b3f !important;
                      color: #fff !important;
                      border: none !important;
                    }
                    /* Make year and month select buttons white with dark text in dark mode */
                    .dark-calendar .ant-picker-calendar-year-select,
                    .dark-calendar .ant-picker-calendar-month-select {
                      background: #fff !important;
                      color: #232526 !important;
                      border: 1px solid #232526 !important;
                    }
                    .dark-calendar .ant-picker-calendar-year-select .ant-select-selector,
                    .dark-calendar .ant-picker-calendar-month-select .ant-select-selector {
                      background: #fff !important;
                      color: #232526 !important;
                      border: none !important;
                    }
                    .dark-calendar .ant-picker-calendar-year-select .ant-select-selection-item,
                    .dark-calendar .ant-picker-calendar-month-select .ant-select-selection-item {
                      color: #232526 !important;
                    }
                    .dark-calendar .ant-picker-calendar-year-select .ant-select-arrow,
                    .dark-calendar .ant-picker-calendar-month-select .ant-select-arrow {
                      color: #232526 !important;
                    }
                    /* Make the border of the white area above the calendar dark in dark mode */
                    .calendar-header-area-dark {
                      border: 2px solid #232526 !important;
                      border-radius: 8px;
                    }
                    .dark-calendar .ant-picker-calendar-mode-switch-active {
                      background: #232526 !important;
                      color: #fff !important;
                    }
                    .dark-calendar .ant-picker-calendar-mode-switch,
                    .dark-calendar .ant-picker-calendar-year-select,
                    .dark-calendar .ant-picker-calendar-month-select {
                      background: #393b3f !important;
                      color: #fff !important;
                      border: none !important;
                    }
                    .dark-calendar .ant-picker-calendar-mode-switch input,
                    .dark-calendar .ant-picker-calendar-year-select input,
                    .dark-calendar .ant-picker-calendar-month-select input {
                      background: #393b3f !important;
                      color: #fff !important;
                    }
                    /* Center calendar cell content and ensure equal column width */
                    .ant-picker-calendar .ant-picker-content th,
                    .ant-picker-calendar .ant-picker-content td {
                      text-align: center !important;
                      vertical-align: middle !important;
                      width: 14.28% !important;
                      padding: 0 !important;
                    }
                    .ant-picker-calendar .ant-picker-cell-inner {
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      min-height: 60px;
                      font-size: 16px;
                    }
                    .ant-picker-calendar .ant-picker-content ul {
                      padding: 0;
                      margin: 0;
                      list-style: none;
                      text-align: center;
                    }
                    .ant-picker-calendar .ant-picker-content li {
                      text-align: center;
                      margin: 0 auto;
                    }
                  `}</style>
        )}
        {/* Also the same centering styles in light mode */}
        {theme !== "dark" && (
          <style>{`
                        .ant-picker-calendar .ant-picker-content th,
                        .ant-picker-calendar .ant-picker-content td {
                            text-align: center !important;
                            vertical-align: middle !important;
                            width: 14.28% !important;
                            padding: 0 !important;
                        }
                        .ant-picker-calendar .ant-picker-cell-inner {
                            display: flex !important;
                            flex-direction: column !important;
                            align-items: center !important;
                            justify-content: center !important;
                            min-height: 60px;
                            font-size: 16px;
                        }
                        .ant-picker-calendar .ant-picker-content ul {
                            padding: 0;
                            margin: 0;
                            list-style: none;
                            text-align: center;
                        }
                        .ant-picker-calendar .ant-picker-content li {
                            text-align: center;
                            margin: 0 auto;
                        }
                    `}</style>
        )}
        <Modal
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          title={selectedTask ? selectedTask.title : "Task Details"}
        >
          {selectedTask && (
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Due Date">
                {selectedTask.dueDate
                  ? moment(selectedTask.dueDate).format("YYYY-MM-DD")
                  : "No due date"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedTask.status.charAt(0).toUpperCase() +
                  selectedTask.status.slice(1)}
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                {selectedTask.priority
                  ? selectedTask.priority.charAt(0).toUpperCase() +
                    selectedTask.priority.slice(1)
                  : "Medium"}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedTask.description || "No description"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default TaskCalendar;
