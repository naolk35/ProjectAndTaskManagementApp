import { Tag } from "antd";

export function StatusBadge({
  status,
}: {
  status: "pending" | "in_progress" | "completed";
}) {
  if (status === "completed") return <Tag color="green">Completed</Tag>;
  if (status === "in_progress") return <Tag color="blue">In Progress</Tag>;
  return <Tag color="gold">Pending</Tag>;
}
