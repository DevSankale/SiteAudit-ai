import axios from "axios";

export const getAuditHistory = async () => {
  const response = await axios.get(
    "http://localhost:5000/audits"
  );

  return response.data;
};

import { Link } from "react-router-dom";

function AuditHistory({ audits }) {
  return (
    <div>
      <h2>Recent Audits</h2>

      {audits.map((audit) => (
        <div key={audit.id}>
          <p>{audit.url}</p>

          <p>Score: {audit.overallScore}</p>

          <Link to={`/report/${audit.id}`}>
            View Report
          </Link>
        </div>
      ))}
    </div>
  );
}

export default AuditHistory;