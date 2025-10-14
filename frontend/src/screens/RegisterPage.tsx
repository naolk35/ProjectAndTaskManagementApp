import { useState } from "react";
import { useRegisterMutation } from "../api/endpoints";
import { normalizeRtkError } from "../api/baseApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Alert, Select, Typography } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();
  const normalizedError = normalizeRtkError(error);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (values: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "manager" | "employee";
  }) => {
    const res = await register(values).unwrap();
    dispatch(setCredentials(res));
    if (res.user.role === "admin") navigate("/admin");
    else if (res.user.role === "manager") navigate("/manager");
    else navigate("/employee");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "64px auto" }}>
      <Card>
        <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>
          Register
        </Title>
        <Form
          form={form}
          name="register"
          onFinish={onSubmit}
          layout="vertical"
          size="large"
          initialValues={{ role: "employee" }}
        >
          {normalizedError && (
            <Alert
              message={
                normalizedError.type === "CONFLICT"
                  ? "Email is already in use"
                  : normalizedError.type === "BAD_REQUEST" ||
                    normalizedError.type === "VALIDATION_ERROR"
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
              message="Registered successfully"
              type="success"
              style={{ marginBottom: "16px" }}
            />
          )}

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select placeholder="Select your role">
              <Option value="employee">Employee</Option>
              <Option value="manager">Project Manager</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{ width: "100%" }}
              icon={isLoading ? <LoadingOutlined /> : undefined}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <Text>
          Have an account?{" "}
          <Link to="/login" style={{ color: "#4f46e5" }}>
            Login
          </Link>
        </Text>
      </div>
    </div>
  );
}
