import { Outlet } from "react-router-dom";
import { Layout, Button, Space } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";

const { Header: AntHeader, Content } = Layout;

export default function AppLayout() {
  const { mode, toggleTheme } = useTheme();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AntHeader
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: mode === "dark" ? "#001529" : "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: mode === "dark" ? "#fff" : "#000",
          }}
        >
          Project & Task Manager
        </div>
        <Space>
          <Button
            type="text"
            icon={mode === "light" ? <BulbOutlined /> : <BulbFilled />}
            onClick={toggleTheme}
            style={{ color: mode === "dark" ? "#fff" : "#000" }}
          >
            {mode === "light" ? "Dark" : "Light"} Mode
          </Button>
        </Space>
      </AntHeader>
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
