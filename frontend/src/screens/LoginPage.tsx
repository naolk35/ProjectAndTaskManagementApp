import { useState } from "react";
import { useLoginMutation } from "../api/endpoints";
import { normalizeRtkError } from "../api/baseApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Alert, Space, Typography } from "antd";
import { UserOutlined, LockOutlined, LoadingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [login, { isLoading, error, isSuccess }] = useLoginMutation();
  const normalizedError = normalizeRtkError(error);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (values: { email: string; password: string }) => {
    const res = await login(values).unwrap();
    dispatch(setCredentials(res));
    if (res.user.role === "admin") navigate("/admin");
    else if (res.user.role === "manager") navigate("/manager");
    else navigate("/employee");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "64px auto" }}>
      <Card>
        <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>
          Login
        </Title>
        <Form
          form={form}
          name="login"
          onFinish={onSubmit}
          layout="vertical"
          size="large"
        >
          {normalizedError && (
            <Alert
              message={
                normalizedError.type === "UNAUTHORIZED"
                  ? "Invalid email or password"
                  : normalizedError.type === "BAD_REQUEST"
                  ? normalizedError.message
                  : normalizedError.type === "INTERNAL"
                  ? "Server error. Please try again later."
                  : normalizedError.message
              }
              type="error"
              style={{ marginBottom: "16px" }}
            />
          )}
          {isSuccess && (
            <Alert
              message="Logged in successfully"
              type="success"
              style={{ marginBottom: "16px" }}
            />
          )}

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ width: "100%" }}
              icon={isLoading ? <LoadingOutlined /> : undefined}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <Text>
          No account?{" "}
          <Link to="/register" style={{ color: "#4f46e5" }}>
            Register
          </Link>
        </Text>
      </div>
    </div>
  );
}
