function Badge({ children, color }) {
  const map = {
    green: "#10b981",
    blue: "#6366f1",
    orange: "#f59e0b",
    red: "#ef4444",
    purple: "#8b5cf6",
    gray: "#6b7280",
  };

  const c = map[color] || map.gray;

  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 20,
        background: c + "22",
        color: c,
        fontWeight: 600,
        border: `1px solid ${c}33`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export default Badge;