interface BadgeProps {
  label: string;
  color?: "green" | "red" | "yellow" | "blue" | "gray" | "indigo";
  size?: "sm" | "md";
}

const colors: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  yellow: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  gray: "bg-gray-50 text-gray-600 border-gray-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export default function Badge({ label, color = "gray", size = "sm" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${
        colors[color]
      } ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"}`}
    >
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { color: BadgeProps["color"]; icon: string }> = {
    High: { color: "red", icon: "🔴" },
    Medium: { color: "yellow", icon: "🟡" },
    Low: { color: "green", icon: "🟢" },
  };
  const m = map[priority] || { color: "gray" as const, icon: "⚪" };
  return <Badge label={`${m.icon} ${priority}`} color={m.color} />;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeProps["color"]> = {
    New: "blue",
    "In Progress": "yellow",
    "Waiting for Client": "indigo",
    "Waiting Internally": "indigo",
    Resolved: "green",
  };
  return <Badge label={status} color={map[status] || "gray"} />;
}