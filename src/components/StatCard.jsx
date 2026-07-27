import { TrendingUp, TrendingDown } from "lucide-react";

function StatCard({ label, value, change, icon: Icon, accent }) {
  const up = change >= 0;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 12, right: 14, width: 36, height: 36, borderRadius: 8, background: accent + "1a", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
        <Icon size={18} />
      </div>
      <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>{value}</p>
      <span style={{ fontSize: 12, color: up ? "#10b981" : "#ef4444", display: "flex", alignItems: "center", gap: 3 }}>
        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {up ? "+" : ""}{change}% vs last month
      </span>
    </div>
  );
}
export default StatCard;