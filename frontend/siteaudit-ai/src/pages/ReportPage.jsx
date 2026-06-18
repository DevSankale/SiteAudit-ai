import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  // =========================
  // DOWNLOAD PDF (FIXED)
  // =========================
  const downloadPDF = () => {
    window.open(`${API_URL}/audits/${id}/pdf`, "_blank");
  };

  // =========================
  // FETCH REPORT (FIXED)
  // =========================
  useEffect(() => {
    axios
      .get(`${API_URL}/audits/${id}`)
      .then((res) => setReport(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!report) {
    return <h2 style={{ textAlign: "center" }}>Loading Report...</h2>;
  }

  const getStatus = (score) => {
    if (score >= 90) return "Excellent Website Health";
    if (score >= 75) return "Good Website Health";
    if (score >= 60) return "Needs Improvement";
    return "Critical Issues Found";
  };

  const getColor = (score) => {
    if (score >= 90) return "#22c55e";
    if (score >= 75) return "#eab308";
    if (score >= 60) return "#f97316";
    return "#ef4444";
  };

  const Bar = ({ label, value }) => (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{label}</strong>
        <span>{value}/100</span>
      </div>

      <div
        style={{
          height: 8,
          background: "#e5e7eb",
          borderRadius: 5,
          marginTop: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: getColor(value),
            transition: "0.4s ease",
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* TOP BAR */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #eee",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <button onClick={downloadPDF} className="audit-button">
          Download PDF Report
        </button>
      </div>

      <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "20px" }}>
        {/* HERO CARD */}
        <div
          style={{
            background: "white",
            padding: 30,
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            marginBottom: 30,
          }}
        >
          <h1>Website Audit Report</h1>
          <p style={{ color: "#666" }}>{report.url}</p>

          <div style={{ marginTop: 20 }}>
            <h2 style={{ color: getColor(report.overallScore) }}>
              {report.overallScore}/100
            </h2>

            <span
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                background: getColor(report.overallScore),
                color: "white",
                fontSize: 12,
              }}
            >
              {getStatus(report.overallScore)}
            </span>
          </div>
        </div>

        {/* SCORE BARS */}
        <div
          style={{
            background: "white",
            padding: 30,
            borderRadius: 16,
            marginBottom: 30,
          }}
        >
          <h2>Score Breakdown</h2>

          <Bar label="SEO" value={report.seoScore} />
          <Bar label="UX" value={report.uxScore} />
          <Bar label="Performance" value={report.performanceScore} />
          <Bar label="Mobile" value={report.mobileScore} />
        </div>

        {/* ISSUES */}
        <div
          style={{
            background: "white",
            padding: 30,
            borderRadius: 16,
          }}
        >
          <h2>Issues Found</h2>

          {report.issues?.length > 0 ? (
            report.issues.map((issue, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #eee",
                  padding: 20,
                  borderRadius: 12,
                  marginTop: 15,
                }}
              >
                <span
                  style={{
                    background:
                      issue.severity === "critical"
                        ? "#ef4444"
                        : issue.severity === "high"
                        ? "#f97316"
                        : "#eab308",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                  }}
                >
                  {issue.severity.toUpperCase()}
                </span>

                <h3 style={{ marginTop: 10 }}>{issue.issue}</h3>
                <p>
                  <b>Impact:</b> {issue.impact}
                </p>
                <p>
                  <b>Fix:</b> {issue.fix}
                </p>
              </div>
            ))
          ) : (
            <p>No issues found 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportPage;