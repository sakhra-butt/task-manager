
import React, { useState } from "react";
import { Row, Col, Drawer, Menu, Button, Avatar, Tooltip, Space, Typography, Progress } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";


import { MenuOutlined, UserOutlined, LogoutOutlined, DashboardOutlined, UnorderedListOutlined, ClockCircleOutlined, SmileOutlined, MailOutlined, BulbOutlined, MoonOutlined } from "@ant-design/icons";


import { logout } from "../features/authSlice";
import { useTheme } from "../context/ThemeContext";
import { fetchTasks } from "../features/taskSlice";

const { Title, Text } = Typography;

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const tasks = useSelector((state) => state.tasks.list || []);
  const userTasks = tasks.filter((task) => String(task.user) === String(user?._id));
  const completedTasks = userTasks.filter((task) => task.status === "completed");
  const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;
  // For theme icon, you can use a placeholder or connect to your theme context
  const themeIcon = <SmileOutlined style={{ fontSize: 24, color: "#1890ff" }} />;
  const { theme, toggleTheme } = useTheme();

  React.useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setDrawerVisible(false);
  };

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
      {/* Top Navbar */}
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
            Profile
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
      {/* Sidebar Drawer */}
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
              style: {
                transition: "all 0.3s ease",
                background: location.pathname === "/profile" ? "linear-gradient(135deg, #1890ff, #722ed1)" : undefined,
                color: location.pathname === "/profile" ? "#fff" : undefined,
              },
            },
          ]}
        />
      </Drawer>
      {/* Main Content */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '0 8px' }}>
        <Title
          level={2}
          style={{
            textAlign: "left",
            margin: "32px 0 8px 0",
            background: "linear-gradient(135deg, #1890ff, #722ed1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: '2rem',
            wordBreak: 'break-word',
          }}
        >
          Welcome to Your Personal Space!
        </Title>
        <div
          style={{
            padding: 24,
            maxWidth: 600,
            background: theme === "dark"
              ? "#232526"
              : "linear-gradient(135deg, #f8fafc 0%, #e6f0fa 100%)",
            borderRadius: 20,
            boxShadow: "0 8px 32px 0 rgba(24, 144, 255, 0.10)",
            border: "2px solid #e6f0fa",
            position: "relative",
            width: '100%',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            boxSizing: 'border-box',
          }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }} align="middle">
            <Col xs={24} sm={8} style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Avatar size={64} icon={<UserOutlined />} style={{ background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)" }} />
            </Col>
            <Col xs={24} sm={16} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, flexWrap: 'wrap' }}>
                <UserOutlined style={{ color: '#1890ff' }} />
                <span>{user?.name || "-"}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, marginTop: 8, flexWrap: 'wrap' }}>
                <MailOutlined style={{ color: '#722ed1' }} />
                <span>{user?.email || "-"}</span>
              </div>
            </Col>
          </Row>
          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: 'wrap' }}>
            <Text strong>Theme: </Text>
            <Button
              shape="circle"
              size="large"
              icon={theme === "dark" ? <MoonOutlined /> : <BulbOutlined />}
              onClick={toggleTheme}
              style={{
                background: theme === "dark" ? "#222" : "#f0f0f0",
                color: theme === "dark" ? "#ffd700" : "#1890ff",
                border: 'none',
                boxShadow: '0 2px 8px rgba(24,144,255,0.10)'
              }}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            />
            <span style={{ fontWeight: 500 }}>{theme === "dark" ? "Dark" : "Light"} Mode</span>
          </div>
          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", width: '100%', flexWrap: 'wrap' }}>
            <Text strong>Task Completion: </Text>
            <Progress percent={completionRate} status="active" style={{ width: '100%', maxWidth: 200, marginLeft: 16, background: theme === "dark" ? "#232526" : undefined }}
              strokeColor={theme === "dark" ? '#1890ff' : undefined}
              format={percent => <span style={{ color: theme === 'dark' ? '#fff' : undefined }}>{percent}%</span>}
            />
          </div>
        </div>
      </div>
      <style>{`
                @media (max-width: 600px) {
                    .ant-typography {
                        font-size: 1.2rem !important;
                    }
                }
            `}</style>
    </div>
  );
};

export default Profile; 