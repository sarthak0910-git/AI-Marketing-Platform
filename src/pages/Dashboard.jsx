import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  Search, BarChart2, PenTool, Calendar, Activity,
  Users, Zap, Lightbulb, ChevronRight, ChevronDown,
  TrendingUp, TrendingDown, ArrowUpRight, Globe, Hash,
  Target, Clock, Star, Bell, Settings, Menu, X,
  Plus, Play, Pause, MoreHorizontal, CheckCircle2,
  AlertCircle, Info, Flame, Eye, Share2, Heart,
  FileText, RefreshCw, Filter, Download, Send,
  Loader,
  Sparkles, Bot, LogOut
} from "lucide-react";

import Badge from "../components/Badge";
import IntentBadge from "../components/IntentBadge";
import analyticsData from "../data/analyticsData";
import keywords from "../data/keywords";
import competitors from "../data/competitors";
import scheduledPosts from "../data/scheduledPosts";
import automationWorkflows from "../data/automationWorkflows";
import seoIssues from "../data/seoIssues";
import recommendations from "../data/recommendations";
import engagementData from "../data/engagementData";

import StatCard from "../components/StatCard";
import SEOModule from "../components/SEOModule";
import KeywordModule from "../components/KeywordModule";
import CompetitorModule from "../components/CompetitorModule";
import api from "../services/api";
import jsPDF from "jspdf";


// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const channelData = [
  { name: "Organic", value: 38, color: "#10b981" },
  { name: "Social", value: 24, color: "#6366f1" },
  { name: "Direct", value: 18, color: "#f59e0b" },
  { name: "Paid", value: 13, color: "#ef4444" },
  { name: "Referral", value: 7, color: "#8b5cf6" },
];


const platformIcons = {
  Share2: <Share2 size={14} />,
  Users: <Users size={14} />,
  Hash: <Hash size={14} />,
  Globe: <Globe size={14} />,
};
const platformColors = {
  Share2: "#1d9bf0",
  Users: "#0a66c2",
  Hash: "#e1306c",
  Globe: "#1877f2",
};


// ─── PLATFORM TAG ────────────────────────────────────────────────────────────
function PlatformTag({ platform }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "3px 8px", borderRadius: 20, background: platformColors[platform] + "22", color: platformColors[platform], fontWeight: 600 }}>
      {platformIcons[platform]} {platform}
    </span>
  );
}


// ─── MODULES

function ContentModule() {
  const [contentType, setContentType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const types = [
    { key: "blog", label: "Blog Post", icon: FileText },
    { key: "social", label: "Social Media", icon: Share2 },
    { key: "ad", label: "Ad Copy", icon: Target },
    { key: "email", label: "Email", icon: Send },
  ];

  const prompts = {
    blog: (t) => `Write an SEO-optimized blog post outline for the topic: "${t}". Include: 1) A compelling H1 title, 2) Meta description (under 155 chars), 3) 5-7 H2 subheadings with brief descriptions, 4) 3 internal linking suggestions. Format clearly with labels.`,
    social: (t) => `Write 4 platform-specific social media posts for: "${t}". Create one each for Share2/X (max 280 chars), Users (professional, 150-200 words), Hash (engaging with hashtags), and Globe (community-friendly). Label each clearly.`,
    ad: (t) => `Write Google Ads copy for: "${t}". Include: 3 Headlines (max 30 chars each), 2 Descriptions (max 90 chars each), and 2 Globe Ad variations (headline + primary text). Label each element.`,
    email: (t) => `Write a marketing email for: "${t}". Include: Subject line (max 50 chars), Preview text (max 90 chars), Email body with opening hook, 3 key points, strong CTA, and sign-off. Label each section.`,
  };

  const generate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await api.post("/content/generate-content", {
        topic,
        contentType,
        prompt: prompts[contentType](topic),
      });

      setResult(res.data.content);
    } catch (err) {
      console.error(err);
      setError("Generation failed. Please try again.");
    }

    setLoading(false);
  };


  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const lines = doc.splitTextToSize(result, 180);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(lines, 10, 10);

    doc.save(`${topic}.pdf`);
  };



  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>AI Content Generator</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {types.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setContentType(key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "1px solid", borderColor: contentType === key ? "#6366f1" : "var(--border)", background: contentType === key ? "#6366f122" : "var(--card)", color: contentType === key ? "#a5b4fc" : "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: contentType === key ? 600 : 400, transition: "all 0.15s" }}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} placeholder={`Enter a topic or product for ${types.find(t => t.key === contentType)?.label.toLowerCase()}…`}
          style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 14, outline: "none" }} />
        <button onClick={generate} disabled={loading || !topic.trim()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, border: "none", background: loading ? "#4f46e566" : "#6366f1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading || !topic.trim() ? "not-allowed" : "pointer", opacity: !topic.trim() ? 0.5 : 1, transition: "all 0.15s" }}>
          {loading ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} />Generating…</> : <><Sparkles size={15} />Generate</>}
        </button>
      </div>
      {result && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}><Bot size={15} color="#6366f1" />Generated Content</span>
            <div style={{ display: "flex", gap: 8 }}>
            <button onClick={async () => {
  try {
    await navigator.clipboard.writeText(result);
    alert("✅ Content Copied!");
  } catch (err) {
    console.error(err);
    alert("❌ Copy Failed");
  }
}} style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 11, cursor: "pointer" }}>
              Copy
            </button>

            <button onClick={downloadPDF} style={{ padding: "4px 12px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 11, cursor: "pointer" }}>
              Download PDF
            </button>
          </div>
          </div>
          <pre style={{ margin: 0, fontSize: 13, color: "var(--text-dim)", whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "inherit" }}>{result}</pre>
        </div>
      )}
      {error && <div style={{ padding: 16, borderRadius: 10, background: "#ef444422", border: "1px solid #ef444444", color: "#fca5a5", fontSize: 13 }}>{error}</div>}
      {!result && !loading && !error && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 32, textAlign: "center" }}>
          <Sparkles size={32} color="#6366f1" style={{ marginBottom: 12 }} />
          <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "var(--text)" }}>AI-Powered Content Generation</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Enter a topic above and click Generate to create professional marketing content instantly.</p>
        </div>
      )}
    </div>
  );
}

function SocialModule() {
  const [view, setView] = useState("queue");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Social Media Management</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {["queue", "calendar"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid", borderColor: view === v ? "#6366f1" : "var(--border)", background: view === v ? "#6366f133" : "transparent", color: view === v ? "#a5b4fc" : "var(--muted)", fontSize: 12, cursor: "pointer", fontWeight: view === v ? 600 : 400, textTransform: "capitalize" }}>{v}</button>
          ))}
          <button style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "#6366f1", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><Plus size={13} />New Post</button>
        </div>
      </div>
      {view === "queue" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {scheduledPosts.map(post => (
            <div key={post.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: platformColors[post.platform] + "22", display: "flex", alignItems: "center", justifyContent: "center", color: platformColors[post.platform], flexShrink: 0 }}>
                {platformIcons[post.platform]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <PlatformTag platform={post.platform} />
                  <Badge color={post.status === "scheduled" ? "green" : "gray"}>{post.status}</Badge>
                  {post.image && <Badge color="blue">Image</Badge>}
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.content}</p>
                <span style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{post.time}</span>
              </div>
              <button style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", cursor: "pointer" }}><MoreHorizontal size={14} /></button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>June 2025</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <div key={d} style={{ padding: "6px 4px", textAlign: "center", fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 1;
              const hasPosts = [1, 2, 4, 6, 9, 11, 13, 14, 16, 18, 21, 23, 25, 28].includes(day);
              const isToday = day === 0;
              return (
                <div key={i} style={{ aspectRatio: "1", padding: 4, borderRadius: 8, background: isToday ? "#6366f133" : "transparent", border: isToday ? "1px solid #6366f155" : "1px solid transparent", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => !isToday && (e.currentTarget.style.background = "#ffffff06")}
                  onMouseLeave={e => !isToday && (e.currentTarget.style.background = "transparent")}>
                  {day > 0 && day <= 30 && (
                    <>
                      <p style={{ margin: 0, fontSize: 11, color: isToday ? "#a5b4fc" : "var(--text-dim)", fontWeight: isToday ? 700 : 400 }}>{day}</p>
                      {hasPosts && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", marginTop: 2 }} />}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsModule() {
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Analytics Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard label="Sessions" value="87.4K" change={12.4} icon={Activity} accent="#6366f1" />
        <StatCard label="Unique Users" value="52.1K" change={8.7} icon={Users} accent="#10b981" />
        <StatCard label="Pageviews" value="241K" change={15.2} icon={Eye} accent="#f59e0b" />
        <StatCard label="Bounce Rate" value="48.3%" change={-6.1} icon={TrendingDown} accent="#ef4444" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Traffic Over Time (30 Days)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analyticsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#888" }} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: "#888" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="sessions" stroke="#6366f1" fill="url(#gs)" strokeWidth={2} name="Sessions" />
              <Area type="monotone" dataKey="users" stroke="#10b981" fill="url(#gu)" strokeWidth={2} name="Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Channel Attribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={channelData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {channelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {channelData.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, display: "inline-block" }} />{c.name}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
        <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Engagement Radar</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={engagementData}>
            <PolarGrid stroke="#ffffff12" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#888" }} />
            <Radar name="Performance" dataKey="val" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


function AutomationModule() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>Marketing Automation</h2>
        <button style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "#6366f1", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} />New Workflow</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {automationWorkflows.map(wf => (
          <div key={wf.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: wf.active ? "#6366f122" : "#ffffff0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color={wf.active ? "#6366f1" : "#666"} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{wf.name}</span>
                <Badge color={wf.active ? "green" : "gray"}>{wf.active ? "Active" : "Paused"}</Badge>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Trigger: {wf.trigger} • {wf.steps} steps</span>
            </div>
            <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>{wf.runs}</p>
                <p style={{ margin: 0, fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Runs</p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700, color: wf.active ? "#10b981" : "var(--muted)", fontFamily: "'Sora', sans-serif" }}>{wf.active ? `${wf.success}%` : "—"}</p>
                <p style={{ margin: 0, fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Success</p>
              </div>
            </div>
            <button style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", cursor: "pointer" }}>{wf.active ? <Pause size={14} /> : <Play size={14} />}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationsModule() {
  const impactColor = { High: "#10b981", Medium: "#f59e0b", Low: "#6366f1" };
  const effortColor = { Low: "#10b981", Medium: "#f59e0b", High: "#ef4444" };
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>AI Recommendations</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={{ background: "linear-gradient(135deg, #6366f122 0%, #8b5cf622 100%)", border: "1px solid #6366f144", borderRadius: 12, padding: 18 }}>
          <Flame size={20} color="#f59e0b" style={{ marginBottom: 10 }} />
          <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>12</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Actionable opportunities identified this week</p>
        </div>
        <div style={{ background: "linear-gradient(135deg, #10b98122 0%, #06b6d422 100%)", border: "1px solid #10b98144", borderRadius: 12, padding: 18 }}>
          <ArrowUpRight size={20} color="#10b981" style={{ marginBottom: 10 }} />
          <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>+18.4K</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Potential monthly traffic from top picks</p>
        </div>
        <div style={{ background: "linear-gradient(135deg, #f59e0b22 0%, #ef444422 100%)", border: "1px solid #f59e0b44", borderRadius: 12, padding: 18 }}>
          <Hash size={20} color="#6366f1" style={{ marginBottom: 10 }} />
          <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>247</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Trending hashtags tracked across platforms</p>
        </div>
      </div>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Top Recommendations</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Ranked by impact × effort</span>
        </div>
        {recommendations.map((rec, i) => (
          <div key={i} style={{ padding: "16px 20px", borderBottom: i < recommendations.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#ffffff12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--muted)", flexShrink: 0 }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{rec.title}</p>
              <Badge color="purple">{rec.category}</Badge>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: impactColor[rec.impact] }}>↑ {rec.impact} impact</span>
              <span style={{ fontSize: 11, color: effortColor[rec.effort] }}>⚡ {rec.effort} effort</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>{rec.traffic}</span>
            </div>
            <button style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #6366f144", background: "#6366f111", color: "#a5b4fc", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Apply</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

const navItems = [
  { key: "seo", label: "SEO Analysis", icon: Globe },
  { key: "keywords", label: "Keywords", icon: Search },
  { key: "content", label: "AI Content", icon: PenTool },
  { key: "social", label: "Social Media", icon: Share2 },
  { key: "analytics", label: "Analytics", icon: BarChart2 },
  { key: "competitors", label: "Competitors", icon: Users },
  { key: "automation", label: "Automation", icon: Zap },
  { key: "recommendations", label: "AI Insights", icon: Lightbulb },
];

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("analytics");
  const [collapsed, setCollapsed] = useState(false);

  const views = {
    seo: <SEOModule />, keywords: <KeywordModule />, content: <ContentModule />,
    social: <SocialModule />, analytics: <AnalyticsModule />, competitors: <CompetitorModule />,
    automation: <AutomationModule />, recommendations: <RecommendationsModule />,
  };

  const activeItem = navItems.find(n => n.key === active);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0d0e14;
          --surface: #13141c;
          --card: #1a1b26;
          --border: #ffffff0f;
          --text: #e8e8f0;
          --text-dim: #a8a8c0;
          --muted: #666688;
          font-family: 'DM Sans', sans-serif;
        }
        body { background: var(--bg); color: var(--text); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff18; border-radius: 4px; }
      `}</style>
      <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: collapsed ? 60 : 220, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", transition: "width 0.2s ease", overflow: "hidden" }}>
          {/* Logo */}
          <div style={{ padding: "18px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Flame size={16} color="#fff" />
            </div>
            {!collapsed && <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif", whiteSpace: "nowrap" }}>Ignite AI</span>}
          </div>
          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
            {navItems.map(({ key, label, icon: Icon }) => {
              const isActive = active === key;
              return (
                <button key={key} onClick={() => setActive(key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 14px" : "9px 12px", borderRadius: 8, border: "none", background: isActive ? "#6366f122" : "transparent", color: isActive ? "#a5b4fc" : "var(--muted)", cursor: "pointer", marginBottom: 2, transition: "all 0.15s", justifyContent: collapsed ? "center" : "flex-start" }}
                  title={collapsed ? label : undefined}>
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, whiteSpace: "nowrap" }}>{label}</span>}
                  {!collapsed && isActive && <ChevronRight size={12} style={{ marginLeft: "auto" }} />}
                </button>
              );
            })}
          </nav>
          {/* Collapse toggle */}
          <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
            <button onClick={() => setCollapsed(!collapsed)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer" }}>
              <Menu size={16} />
              {!collapsed && <span style={{ fontSize: 12 }}>Collapse</span>}
            </button>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <header style={{ height: 56, padding: "0 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {activeItem && <activeItem.icon size={16} color="#6366f1" />}
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{activeItem?.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--muted)" }}>
                <Search size={13} />
                <span style={{ fontSize: 13 }}>Search…</span>
              </div>
              <button style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Bell size={15} /></button>
              <button style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Settings size={15} /></button>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>JD</div>
              {/* Logout Button */}
              <button
                id="logout-btn"
                onClick={handleLogout}
                title="Logout"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1px solid #ef444433",
                  background: "#ef444411",
                  color: "#fca5a5",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#ef444422";
                  e.currentTarget.style.borderColor = "#ef444466";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#ef444411";
                  e.currentTarget.style.borderColor = "#ef444433";
                }}
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          </header>

          {/* Content */}
          <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            {views[active]}
          </main>
        </div>
      </div>
    </>
  );
}
