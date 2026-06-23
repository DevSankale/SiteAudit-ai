import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { runAudit } from "../api/audit";
import { getAuditHistory } from "../api/history";
import ScoreCard from "../components/ScoreCard";
import AuditHero from "../components/AuditHero";
import "../index.css";
import "../App.css";

function Dashboard() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // ✅ hover state for CTA button
  const [hover, setHover] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const result = await getAuditHistory();
      setHistory(result || []);
    };
    fetchHistory();
  }, []);

  const handleAudit = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setData(null);

    try {
      const result = await runAudit(url);

      console.log("AUDIT RESULT:", result);

      setData(result);

      const updatedHistory = await getAuditHistory();
      setHistory(updatedHistory || []);
    } catch (error) {
      console.error("Audit failed:", error);
    }

    setLoading(false);
  };

  const latestAuditId = history?.[0]?.id;

  return (
    <div style={styles.container}>
      {/* HERO */}
      <div className="hero-section">
        <div className="hero-badge">AI-Powered Website Intelligence</div>
        <h1 className="hero-title">Audit Any Website in Seconds</h1>
        <p className="hero-subtitle">
          Analyze SEO, UX, Mobile Experience and Performance with actionable insights.
        </p>
      </div>

      {/* INPUT */}
      <div className="input-wrapper">
        <div style={styles.inputBox}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL..."
            style={styles.input}
          />

          <button onClick={handleAudit} style={styles.button}>
            {loading ? "Auditing..." : "Run Audit"}
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="skeleton-grid">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      )}

      {/* RESULTS */}
      {data && (
        <>
          <AuditHero
            report={{
              website: data.url,
              score: data.overallScore,
            }}
          />

          {/* SCORES */}
          <div style={styles.grid}>
            <ScoreCard label="SEO" value={data.seoScore} />
            <ScoreCard label="UX" value={data.uxScore} />
            <ScoreCard label="Performance" value={data.performanceScore} />
            <ScoreCard label="Mobile" value={data.mobileScore} />
          </div>

          {/* ISSUES */}
          <div style={{ marginTop: 40 }}>
            <h2>Issues Found</h2>

            {data.issues?.length ? (
              data.issues.map((issue, i) => (
                <div key={i} style={styles.issueCard}>
                  <div style={styles.badge}>
                    {issue.severity?.toUpperCase()}
                  </div>

                  <h3>{issue.issue}</h3>
                  <p><b>Impact:</b> {issue.impact}</p>
                  <p><b>Fix:</b> {issue.fix}</p>
                </div>
              ))
            ) : (
              <p>No issues found 🎉</p>
            )}
          </div>

          {/* CTA WITH HOVER EFFECT */}
          {latestAuditId && (
            <div style={styles.ctaWrapper}>
              <div style={styles.ctaCard}>
                <h3>Full Report Available</h3>
                <p>Deep insights, PDF export, and full breakdown.</p>

                <button
                  onClick={() => navigate(`/report/${latestAuditId}`)}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  style={{
                    ...styles.ctaButton,
                    background: hover ? "#e5e7eb" : "#fff",
                    transform: hover ? "translateY(-2px)" : "translateY(0px)",
                    boxShadow: hover
                      ? "0 8px 20px rgba(0,0,0,0.15)"
                      : "0 0 0 rgba(0,0,0,0)",
                  }}
                >
                  📊 View Full Report
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* HISTORY */}
      <div style={{ marginTop: 60 }}>
        <h2>Recent Audits</h2>

        {history.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No audits yet</p>
        ) : (
          history.map((audit) => (
            <Link
              key={audit.id}
              to={`/report/${audit.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={styles.historyCard}>
                <p>{audit.url}</p>

                <div style={styles.historyScores}>
                  SEO {audit.seoScore} | UX {audit.uxScore} | Perf {audit.performanceScore} | Mob {audit.mobileScore}
                </div>

                <b>Overall: {audit.overallScore}</b>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  container: {
    padding: 40,
    maxWidth: 1100,
    margin: "0 auto",
  },

  inputBox: {
    display: "flex",
    gap: 10,
  },

  input: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    border: "1px solid #ddd",
  },

  button: {
    padding: "14px 20px",
    borderRadius: 10,
    background: "#111",
    color: "#fff",
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
    marginTop: 30,
  },

  issueCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    marginTop: 15,
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },

  badge: {
    display: "inline-block",
    padding: "5px 10px",
    background: "#eee",
    borderRadius: 6,
    fontSize: 12,
    marginBottom: 10,
  },

  ctaWrapper: {
    marginTop: 40,
    display: "flex",
    justifyContent: "center",
  },

  ctaCard: {
    background: "#111",
    color: "#fff",
    padding: 20,
    borderRadius: 12,
    textAlign: "center",
  },

  ctaButton: {
    marginTop: 10,
    padding: "10px 16px",
    background: "#fff",
    color: "#111",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.25s ease",
  },

  historyCard: {
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    boxShadow: "0 5px 10px rgba(0,0,0,0.05)",
  },

  historyScores: {
    fontSize: 12,
    opacity: 0.7,
  },
};

export default Dashboard;