import axios from "axios";
import { Link } from "react-router-dom";

/* =========================
   API FUNCTION (FIXED)
========================= */
const API_URL = import.meta.env.VITE_API_URL;

export const getAuditHistory = async () => {
  const response = await axios.get(`${API_URL}/audits`);
  return response.data;
};

/* =========================
   UI COMPONENT
========================= */
function AuditHistory({ audits = [] }) {
  return (
    <div>
      <h2>Recent Audits</h2>

      {audits.length === 0 ? (
        <p>No audits found yet.</p>
      ) : (
        audits.map((audit) => (
          <div key={audit.id}>
            <p>{audit.url}</p>

            <p>Score: {audit.overallScore}</p>

            <Link to={`/report/${audit.id}`}>
              View Report
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

export default AuditHistory;