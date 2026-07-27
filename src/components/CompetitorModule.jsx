import competitors from "../data/competitors";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";


function CompetitorModule() {
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Competitor Analysis</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {competitors.map((c, i) => (
          <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{c.name}</p>
                <span style={{ fontSize: 11, color: c.change > 0 ? "#10b981" : "#ef4444", display: "flex", alignItems: "center", gap: 3 }}>
                  {c.change > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {c.change > 0 ? "+" : ""}{c.change}%
                </span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#6366f1", fontFamily: "'Sora', sans-serif" }}>{c.seoScore}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Traffic</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{c.traffic}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Keywords</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{c.keywords.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Backlinks</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{c.backlinks}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
        <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>SEO Score Comparison</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={competitors} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#888" }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#888" }} width={100} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="seoScore" fill="#6366f1" radius={[0, 4, 4, 0]} name="SEO Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default CompetitorModule;