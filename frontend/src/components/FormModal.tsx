import type { ReactNode } from "react";
import { Modal, Button } from "./ui";

export function FormField(props: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
        {props.label}
      </span>
      {props.children}
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }
) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
        className || ""
      }`}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string }
) {
  const { className, ...rest } = props;
  return (
    <select
      {...rest}
      className={`rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
        className || ""
      }`}
    />
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
      open={open}
      title={title}
      onClose={onClose}
      actions={
        <div className="flex justify-center sm:justify-end gap-2 w-full">
          <Button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={disabled}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="grid gap-3">{props.children}</div>
    </Modal>
  );
}
