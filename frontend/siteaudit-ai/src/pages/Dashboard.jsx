import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    const fetchHistory = async () => {
      const result = await getAuditHistory();
      setHistory(result);
    };
    fetchHistory();
  }, []);

  const handleAudit = async () => {
    setLoading(true);

    try {
      const result = await runAudit(url);
      setData(result);

      // Refresh history after audit
      const updatedHistory = await getAuditHistory();
      setHistory(updatedHistory);
    } catch (error) {
      console.error("Audit failed:", error);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="hero-badge">AI-Powered Website Intelligence</div>
        <h1 className="hero-title">Audit Any Website in Seconds</h1>
        <p className="hero-subtitle">
          Analyze SEO, UX, Mobile Experience and Performance with actionable recommendations.
        </p>
      </div>

      {/* INPUT SECTION */}
      <div className="input-wrapper">
        <div style={styles.inputBox}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL..."
            style={styles.input}
          />

          <button
            onClick={handleAudit}
            style={styles.button}
            className="runAuditButton"
          >
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
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      )}

      {/* =========================
          PREMIUM AUDIT REPORT
         ========================= */}
      {data && (
        <>
          {/* HERO REPORT */}
          <AuditHero
            report={{
              website: data.url || url,
              score: data.overallScore,
            }}
          />

          {/* SCORE CARDS */}
          <div style={styles.grid}>
            <ScoreCard label="SEO" value={data.seoScore} />
            <ScoreCard label="UX" value={data.uxScore} />
            <ScoreCard label="Performance" value={data.performanceScore} />
            <ScoreCard label="Mobile" value={data.mobileScore} />
          </div>

          {/* ISSUES */}
          <h2 style={{ marginTop: 40 }}>Issues Found</h2>

          {data.issues &&
            Object.entries(
              data.issues.reduce((acc, issue) => {
                if (!acc[issue.category]) acc[issue.category] = [];
                acc[issue.category].push(issue);
                return acc;
              }, {})
            ).map(([category, issues]) => (
              <div key={category}>
                <h3 style={{ marginTop: 30, marginBottom: 15 }}>
                  {category} Issues
                </h3>

                <div style={styles.issues}>
                  {issues.map((issue, i) => (
                    <div key={i} style={styles.issueCard}>
                      <div style={styles.severityBadge}>
                        {issue.severity.toUpperCase()}
                      </div>

                      <h3 style={{ marginTop: 10 }}>
                        {issue.issue}
                      </h3>

                      <p>
                        <b>Impact:</b> {issue.impact}
                      </p>

                      <p>
                        <b>Fix:</b> {issue.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </>
      )}

      {/* RECENT AUDITS */}
      <div style={{ marginTop: 60 }}>
        <h2>Recent Audits</h2>

        {history.length > 0 ? (
          <div style={styles.historyGrid}>
            {history.map((audit) => (
              <Link
                key={audit.id}
                to={`/report/${audit.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={styles.historyCard}>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {audit.url}
                  </p>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <span style={styles.scoreTag}>
                      SEO: {audit.seoScore}
                    </span>
                    <span style={styles.scoreTag}>
                      UX: {audit.uxScore}
                    </span>
                    <span style={styles.scoreTag}>
                      Performance: {audit.performanceScore}
                    </span>
                    <span style={styles.scoreTag}>
                      Mobile: {audit.mobileScore}
                    </span>
                  </div>

                  <p style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>
                    Overall: <b>{audit.overallScore}</b>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ opacity: 0.6 }}>No audits yet</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 40,
    maxWidth: 1100,
    margin: "0 auto",
  },

  inputBox: {
    display: "flex",
    gap: 10,
    width: "100%",
  },

  input: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    border: "none",
    fontSize: 14,
    outline: "none",
  },

  button: {
    padding: "14px 20px",
    borderRadius: 10,
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    border: "1px solid transparent",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 20,
  },

  issues: {
    display: "grid",
    gap: 15,
    marginTop: 20,
  },

  issueCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },

  severityBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    background: "#f0f0f0",
  },

  historyGrid: {
    display: "grid",
    gap: 15,
    marginTop: 20,
  },

  historyCard: {
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },

  scoreTag: {
    background: "#f0f0f0",
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
  },
};

export default Dashboard;