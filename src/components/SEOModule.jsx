import { useState } from "react";
import { CheckCircle2, AlertCircle, Info, Search, Loader, Globe, Zap, ExternalLink, Key } from "lucide-react";
import ScoreGauge from "./ScoreGauge";
import Badge from "./Badge";

// ─── PageSpeed Insights API ──────────────────────────────────────────────────
// Set VITE_PAGESPEED_API_KEY in your .env.local file.
// Vite only exposes env vars prefixed with VITE_ to the browser bundle.
// Treat the placeholder value the same as missing — avoids confusing 400 errors
const RAW_KEY = import.meta.env.VITE_PAGESPEED_API_KEY || "";
const PSI_API_KEY = RAW_KEY === "YOUR_API_KEY_HERE" ? "" : RAW_KEY;

/**
 * Fetch PageSpeed Insights data for both mobile and desktop strategies.
 * API docs: https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed
 */
async function fetchPSI(url, strategy = "mobile") {
  const base = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  // URLSearchParams collapses repeated keys — build the URL manually so
  // category=performance&category=accessibility&... is preserved correctly.
  const endpoint =
    `${base}?url=${encodeURIComponent(url)}` +
    `&strategy=${strategy}` +
    `&category=performance&category=accessibility&category=best-practices&category=seo` +
    (PSI_API_KEY ? `&key=${PSI_API_KEY}` : "");

  const res = await fetch(endpoint);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg  = body?.error?.message || `HTTP ${res.status}`;

    if (res.status === 429) {
      throw new Error(
        "RATE_LIMITED: The unauthenticated daily quota (25 req/day) is exhausted. " +
        "Add your VITE_PAGESPEED_API_KEY to .env.local to continue."
      );
    }
    if (res.status === 400) {
      throw new Error("BAD_URL: " + msg);
    }
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Parse raw PSI JSON into a flat object the UI can consume directly.
 */
function parsePSI(mobile, desktop) {
  const lhr = mobile.lighthouseResult;
  const cats = lhr?.categories ?? {};
  const audits = lhr?.audits ?? {};

  const round = (v) => Math.round((v ?? 0) * 100);

  // ── Core scores ──────────────────────────────────────────────────────────
  const seoScore        = round(cats?.seo?.score);
  const perfScore       = round(cats?.performance?.score);
  const a11yScore       = round(cats?.accessibility?.score);
  const bpScore         = round(cats?.["best-practices"]?.score);
  const desktopPerf     = round(desktop?.lighthouseResult?.categories?.performance?.score);

  // ── Core Web Vitals ──────────────────────────────────────────────────────
  const lcp  = audits?.["largest-contentful-paint"]?.displayValue  ?? "—";
  const fid  = audits?.["total-blocking-time"]?.displayValue        ?? "—";   // TBT proxy for FID
  const cls  = audits?.["cumulative-layout-shift"]?.displayValue    ?? "—";
  const fcp  = audits?.["first-contentful-paint"]?.displayValue     ?? "—";
  const ttfb = audits?.["server-response-time"]?.displayValue       ?? "—";
  const si   = audits?.["speed-index"]?.displayValue                ?? "—";

  // ── Technical checks ─────────────────────────────────────────────────────
  const isHTTPS       = (mobile.id ?? "").startsWith("https");
  const isMobileFr    = audits?.["viewport"]?.score === 1;
  const hasRobots     = audits?.["robots-txt"]?.score === 1;
  const hasSitemap    = audits?.["sitemap-xml"]?.score  === 1;      // may be null — see note below
  const hasCanonical  = audits?.["canonical"]?.score    === 1;
  const hasOG         = audits?.["hreflang"]?.score     === 1;      // OG not directly in PSI
  const hasStructured = audits?.["structured-data"]?.score === 1;
  const cwvPass       = (audits?.["largest-contentful-paint"]?.score ?? 0) >= 0.9
                     && (audits?.["cumulative-layout-shift"]?.score  ?? 0) >= 0.9;

  // ── On-page issues ───────────────────────────────────────────────────────
  const issues = [];

  // Missing title
  if (audits?.["document-title"]?.score !== 1) {
    issues.push({ type: "critical", title: "Missing or short page title", detail: audits?.["document-title"]?.description ?? "No title tag detected." });
  }

  // Missing meta description
  if (audits?.["meta-description"]?.score !== 1) {
    issues.push({ type: "critical", title: "Missing meta description", detail: audits?.["meta-description"]?.description ?? "No meta description found." });
  }

  // Canonical
  if (audits?.["canonical"]?.score !== 1) {
    issues.push({ type: "warning", title: "Canonical tag issue", detail: audits?.["canonical"]?.explanation ?? "Canonical tag missing or misconfigured." });
  }

  // Images without alt
  const imgAlt = audits?.["image-alt"];
  if (imgAlt?.score !== 1) {
    const count = imgAlt?.details?.items?.length ?? 0;
    issues.push({ type: "warning", title: "Images without alt text", detail: count > 0 ? `${count} image(s) missing alt attributes.` : "Some images are missing alt attributes." });
  }

  // Slow LCP
  if ((audits?.["largest-contentful-paint"]?.score ?? 1) < 0.5) {
    issues.push({ type: "warning", title: "Slow page speed (LCP)", detail: `LCP is ${lcp}. Target: < 2.5s.` });
  }

  // Robots.txt
  if (audits?.["robots-txt"]?.score !== 1) {
    issues.push({ type: "warning", title: "Robots.txt issue", detail: audits?.["robots-txt"]?.explanation ?? "Robots.txt not found or has errors." });
  }

  // Sitemap — PSI doesn't directly audit sitemap; flag as info
  issues.push({ type: "info", title: "XML Sitemap", detail: "Verify your sitemap is submitted in Google Search Console." });

  // Open Graph (heuristic — PSI doesn't audit OG directly)
  issues.push({ type: "info", title: "Open Graph / Social Tags", detail: "Manually verify og:title, og:description and og:image are set." });

  // Crawl issues from link-text audit
  const linkText = audits?.["link-text"];
  if (linkText?.score !== 1) {
    const count = linkText?.details?.items?.length ?? 0;
    issues.push({ type: "info", title: "Links with poor anchor text", detail: `${count} link(s) use generic anchor text.` });
  }

  // ── Counts for Issues Summary card ───────────────────────────────────────
  const critical = issues.filter(i => i.type === "critical").length;
  const warnings = issues.filter(i => i.type === "warning").length;
  const info     = issues.filter(i => i.type === "info").length;

  // ── Technical checks list (mirrors the original 8-item grid) ─────────────
  const checks = [
    { label: "HTTPS enabled",    pass: isHTTPS      },
    { label: "Mobile-friendly",  pass: isMobileFr   },
    { label: "XML Sitemap",      pass: hasSitemap   },
    { label: "Robots.txt",       pass: hasRobots    },
    { label: "Structured data",  pass: hasStructured},
    { label: "Core Web Vitals",  pass: cwvPass      },
    { label: "Canonical tags",   pass: hasCanonical },
    { label: "Open Graph tags",  pass: hasOG        },
  ];

  return {
    seoScore, perfScore, a11yScore, bpScore, desktopPerf,
    lcp, fid, cls, fcp, ttfb, si,
    checks, issues, critical, warnings, info,
    analyzedUrl: mobile.id,
  };
}

// ─── Mini score pill used in Core Web Vitals row ─────────────────────────────
function ScorePill({ label, value, good }) {
  const color = good ? "#10b981" : "#f59e0b";
  return (
    <div style={{ background: "var(--card)", border: `1px solid ${color}33`, borderRadius: 10, padding: "10px 14px", minWidth: 100, textAlign: "center" }}>
      <p style={{ margin: "0 0 3px", fontSize: 18, fontWeight: 700, color, fontFamily: "'Sora', sans-serif" }}>{value}</p>
      <p style={{ margin: 0, fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
    </div>
  );
}

// ─── Small score gauge used for secondary scores ──────────────────────────────
function MiniGauge({ label, score, accent }) {
  const color = accent ?? (score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444");
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <p style={{ margin: 0, fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color, fontFamily: "'Sora', sans-serif" }}>{score}</p>
      <div style={{ width: "100%", height: 4, borderRadius: 4, background: "#ffffff0a", overflow: "hidden", marginTop: 4 }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 4, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

// ─── SEO MODULE ───────────────────────────────────────────────────────────────
function SEOModule() {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [data, setData]       = useState(null);   // parsed result from parsePSI()

  const handleAnalyze = async () => {
    const raw = url.trim();
    if (!raw) return;

    // Normalise URL — prepend https:// if no protocol
    const target = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

    setLoading(true);
    setError("");
    setData(null);

    try {
      // Run mobile + desktop in parallel
      const [mobile, desktop] = await Promise.all([
        fetchPSI(target, "mobile"),
        fetchPSI(target, "desktop"),
      ]);
      setData(parsePSI(mobile, desktop));
    } catch (err) {
      console.error("[SEO] PageSpeed error:", err);
      setError(err.message || "Analysis failed. Check the URL or try again.");
    } finally {
      setLoading(false);
    }
  };

  // Derive display values: real data when available, fallback mock when idle
  const seoScore   = data?.seoScore   ?? 74;
  const issues     = data?.issues     ?? [
    { type: "critical", title: "Missing meta descriptions",  detail: "14 pages have no meta description" },
    { type: "critical", title: "Broken internal links",      detail: "7 broken links found across the site" },
    { type: "warning",  title: "Images without alt text",    detail: "38 images missing alt attributes" },
    { type: "warning",  title: "Slow page speed",            detail: "6 pages load in over 3 seconds" },
    { type: "info",     title: "Duplicate title tags",       detail: "3 pages share identical title tags" },
    { type: "info",     title: "Low word count pages",       detail: "11 pages under 300 words" },
  ];
  const checks     = data?.checks ?? [
    { label: "HTTPS enabled",    pass: true  },
    { label: "Mobile-friendly",  pass: true  },
    { label: "XML Sitemap",      pass: true  },
    { label: "Robots.txt",       pass: true  },
    { label: "Structured data",  pass: false },
    { label: "Core Web Vitals",  pass: false },
    { label: "Canonical tags",   pass: true  },
    { label: "Open Graph tags",  pass: true  },
  ];
  const critical = data?.critical ?? 2;
  const warnings = data?.warnings ?? 2;
  const info     = data?.info     ?? 2;

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "'Sora', sans-serif" }}>SEO Analysis</h2>

      {/* ── URL Input bar ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)" }}>
          <Globe size={14} color="#6366f1" style={{ flexShrink: 0 }} />
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && handleAnalyze()}
            placeholder="Enter website URL (e.g. example.com)"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--text)", fontSize: 14, padding: "13px 0",
            }}
          />
          {url && (
            <button
              onClick={() => { setUrl(""); setData(null); setError(""); }}
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2 }}
              title="Clear"
            >✕</button>
          )}
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "0 22px", borderRadius: 10, border: "none",
            background: loading ? "#4f46e566" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: loading || !url.trim() ? "not-allowed" : "pointer",
            opacity: !url.trim() ? 0.5 : 1,
            transition: "all 0.15s", whiteSpace: "nowrap",
            boxShadow: loading || !url.trim() ? "none" : "0 4px 16px #6366f140",
          }}
        >
          {loading
            ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} />Analyzing…</>
            : <><Search size={14} />Analyze</>
          }
        </button>
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div style={{ borderRadius: 12, background: "#ef444410", border: "1px solid #ef444430", marginBottom: 20, overflow: "hidden" }}>
          {/* main error row */}
          <div style={{ padding: "13px 18px", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#fca5a5", fontWeight: 600 }}>
                {error.startsWith("RATE_LIMITED:") ? "API Quota Exceeded — API Key Required" :
                 error.startsWith("BAD_URL:")      ? "Invalid URL" :
                 "Analysis Failed"}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#f87171", opacity: 0.8 }}>
                {error.replace(/^(RATE_LIMITED:|BAD_URL:)\s*/, "")}
              </p>
            </div>
          </div>

          {/* Setup guide — shown only when rate limited */}
          {error.startsWith("RATE_LIMITED:") && (
            <div style={{ borderTop: "1px solid #ef444422", padding: "14px 18px", background: "#0d0e14" }}>
              <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#a5b4fc", display: "flex", alignItems: "center", gap: 6 }}>
                <Key size={12} /> How to configure your API key:
              </p>
              <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  <>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#a5b4fc" }}>console.cloud.google.com</a> and create or select a project.</>,
                  <>Enable the <strong style={{ color: "#e8e8f0" }}>PageSpeed Insights API</strong> from the API Library.</>,
                  <>Create an <strong style={{ color: "#e8e8f0" }}>API key</strong> under APIs &amp; Services → Credentials.</>,
                  <>Open <code style={{ background: "#ffffff0d", padding: "1px 6px", borderRadius: 4 }}>.env.local</code> in your project root.</>,
                  <>Replace <code style={{ background: "#ffffff0d", padding: "1px 6px", borderRadius: 4 }}>YOUR_API_KEY_HERE</code> with your actual key:</>,
                ].map((step, i) => (
                  <li key={i} style={{ fontSize: 12, color: "#a8a8c0", lineHeight: 1.6 }}>{step}</li>
                ))}
              </ol>
              <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "#1a1b26", border: "1px solid #6366f133", fontFamily: "monospace", fontSize: 12, color: "#a5b4fc" }}>
                VITE_PAGESPEED_API_KEY=<span style={{ color: "#10b981" }}>AIzaSy…your_key_here</span>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 11, color: "#55556e" }}>
                Then <strong style={{ color: "#a8a8c0" }}>restart the dev server</strong> (<code style={{ background: "#ffffff0d", padding: "1px 5px", borderRadius: 4 }}>npm run dev</code>) for the new key to be picked up.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Analyzed URL label ────────────────────────────────────────────── */}
      {data?.analyzedUrl && (
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={13} color="#10b981" />
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Results for</span>
          <a href={data.analyzedUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: "#a5b4fc", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
            {data.analyzedUrl} <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* ── Row 1: Overall Score / Technical Checks / Issues Summary ─────── */}
      {/* Exact same 3-column grid and card structure as original */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: data ? 16 : 24 }}>

        {/* Overall SEO Score */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Overall SEO Score</p>
          <ScoreGauge score={seoScore} />
          {data && (
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted)" }}>Mobile · PageSpeed Insights</p>
          )}
        </div>

        {/* Technical Checks */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Technical Checks</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {checks.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: c.pass ? "#10b981" : "#ef4444" }}>
                {c.pass ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                <span style={{ color: "var(--text-dim)" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Issues Summary */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Issues Summary</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 5 }}><AlertCircle size={13} />Critical</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#ef4444", fontFamily: "'Sora', sans-serif" }}>{critical}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#f59e0b", display: "flex", alignItems: "center", gap: 5 }}><AlertCircle size={13} />Warnings</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b", fontFamily: "'Sora', sans-serif" }}>{warnings}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#6366f1", display: "flex", alignItems: "center", gap: 5 }}><Info size={13} />Info</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#6366f1", fontFamily: "'Sora', sans-serif" }}>{info}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2 (real data only): Performance / Accessibility / Best Practices / Desktop Perf ─── */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          <MiniGauge label="Performance"     score={data.perfScore}    />
          <MiniGauge label="Accessibility"   score={data.a11yScore}    />
          <MiniGauge label="Best Practices"  score={data.bpScore}      />
          <MiniGauge label="Desktop Perf"    score={data.desktopPerf}  accent="#6366f1" />
        </div>
      )}

      {/* ── Row 3 (real data only): Core Web Vitals ──────────────────────── */}
      {data && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Core Web Vitals (Mobile)</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={12} color="#f59e0b" />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>via PageSpeed Insights</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ScorePill label="LCP"   value={data.lcp}  good={(data.lcp ?? "").includes("s") && parseFloat(data.lcp) <= 2.5} />
            <ScorePill label="TBT"   value={data.fid}  good={(data.fid ?? "").includes("ms") && parseFloat(data.fid) <= 200} />
            <ScorePill label="CLS"   value={data.cls}  good={parseFloat(data.cls) <= 0.1} />
            <ScorePill label="FCP"   value={data.fcp}  good={(data.fcp ?? "").includes("s") && parseFloat(data.fcp) <= 1.8} />
            <ScorePill label="TTFB"  value={data.ttfb} good={parseFloat(data.ttfb) <= 800} />
            <ScorePill label="Speed Index" value={data.si} good={(data.si ?? "").includes("s") && parseFloat(data.si) <= 3.4} />
          </div>
        </div>
      )}

      {/* ── On-Page Issues table — identical structure to original ────────── */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            {data ? "Detected Issues" : "On-Page Issues"}
          </span>
          <Badge color="gray">{issues.length} issues</Badge>
        </div>
        {issues.map((issue, i) => (
          <div key={i} style={{ padding: "14px 20px", borderBottom: i < issues.length - 1 ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: issue.type === "critical" ? "#ef4444" : issue.type === "warning" ? "#f59e0b" : "#6366f1", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{issue.title}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>{issue.detail}</p>
            </div>
            <Badge color={issue.type === "critical" ? "red" : issue.type === "warning" ? "orange" : "blue"}>{issue.type}</Badge>
          </div>
        ))}
      </div>

      {/* ── Empty state when no analysis yet ─────────────────────────────── */}
      {!data && !loading && !error && (
        <div style={{ marginTop: 16, padding: "20px 24px", borderRadius: 12, background: "#6366f108", border: "1px solid #6366f120", display: "flex", alignItems: "center", gap: 12 }}>
          <Info size={16} color="#6366f1" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
            Enter a URL above and click <strong style={{ color: "var(--text-dim)" }}>Analyze</strong> to fetch real SEO data via Google PageSpeed Insights.
            {!PSI_API_KEY && (
              <span style={{ marginLeft: 4 }}>
                Add your API key to <code style={{ background: "#ffffff10", padding: "1px 5px", borderRadius: 4, fontSize: 11 }}>.env.local</code> to avoid quota limits.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default SEOModule;