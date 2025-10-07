import { Badge } from "./ui";

export function StatusBadge({
  status,
}: {
  status: "pending" | "in_progress" | "completed";
}) {
  if (status === "completed") return <Badge tone="success">Completed</Badge>;
  if (status === "in_progress") return <Badge tone="info">In Progress</Badge>;
  return <Badge tone="warning">Pending</Badge>;
}
