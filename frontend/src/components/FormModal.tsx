import type { ReactNode } from "react";
import { Modal, Button, Form, Input, Select, Space } from "antd";

const { Option } = Select;

export function FormField(props: { label: string; children: ReactNode }) {
  return <Form.Item label={props.label}>{props.children}</Form.Item>;
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }
) {
  const { className, ...rest } = props;
  return <Input {...rest} />;
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    className?: string;
    options?: Array<{ value: string; label: string }>;
  }
) {
  const { className, options = [], ...rest } = props;
  return (
    <Select {...rest} style={{ width: "100%" }}>
      {options.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
}

export function FormModal(props: {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  submitLabel?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const {
    title,
    open,
    onClose,
    onSubmit,
    submitLabel = "Save",
    disabled,
  } = props;

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={onSubmit}
          disabled={disabled}
        >
          {submitLabel}
        </Button>,
      ]}
      width={600}
    >
      <div style={{ marginTop: "16px" }}>{props.children}</div>
    </Modal>
  );
}
