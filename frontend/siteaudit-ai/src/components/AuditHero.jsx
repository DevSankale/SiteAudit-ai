function AuditHero({ report }) {
  if (!report) return null;

  const getStatus = (score) => {
    if (score >= 90) return "Excellent Website Health";
    if (score >= 75) return "Good Website Health";
    if (score >= 60) return "Needs Improvement";
    return "Critical Issues Found";
  };

  return (
    <section className="audit-hero">
      <div className="audit-hero-content">
        <p className="report-label">
          SiteAudit AI Report
        </p>

        <h2 className="website-url">
          {report.website}
        </h2>

        <div className="overall-score">
          {report.score}
        </div>

        <p className="health-status">
          {getStatus(report.score)}
        </p>

        <p className="scan-date">
          Last Scanned: {new Date().toLocaleDateString()}
        </p>
      </div>
    </section>
  );
}

export default AuditHero;