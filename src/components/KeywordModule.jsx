import { useState } from "react";
import { TrendingUp } from "lucide-react";

import keywords from "../data/keywords";
import Badge from "./Badge";
import IntentBadge from "./IntentBadge";

function KeywordModule() {
  const [filter, setFilter] = useState("all");
  const intents = ["all", "informational", "commercial", "transactional", "navigational"];
  const filtered = filter === "all" ? keywords : keywords.filter(k => k.intent === filter);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Keyword Research</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {intents.map(i => (
            <button key={i} onClick={() => setFilter(i)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid", borderColor: filter === i ? "#6366f1" : "var(--border)", background: filter === i ? "#6366f133" : "transparent", color: filter === i ? "#a5b4fc" : "var(--muted)", fontSize: 11, cursor: "pointer", fontWeight: filter === i ? 600 : 400 }}>{i}</button>
          ))}
        </div>
      </div>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Keyword", "Volume", "CPC", "Difficulty", "Intent", "SERP Features", "Trend"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((kw, i) => (
              <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffffff06"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{kw.keyword}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-dim)" }}>{kw.volume.toLocaleString()}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#10b981", fontWeight: 600 }}>${kw.cpc.toFixed(2)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 48, height: 5, borderRadius: 3, background: "#ffffff14" }}>
                      <div style={{ width: `${kw.difficulty}%`, height: "100%", borderRadius: 3, background: kw.difficulty > 65 ? "#ef4444" : kw.difficulty > 45 ? "#f59e0b" : "#10b981" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{kw.difficulty}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}><IntentBadge intent={kw.intent} /></td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {kw.serp.map((s, j) => <Badge key={j} color="purple">{s}</Badge>)}
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {kw.trend === "up"
                    ? <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: 3 }}><TrendingUp size={13} /> Up</span>
                    : <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 3 }}>— Stable</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default KeywordModule;