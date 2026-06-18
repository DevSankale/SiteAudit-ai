import { useEffect, useState } from "react";

function ScoreCard({ label, value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;

    const timer = setInterval(() => {
      current += 1;

      if (current >= value) {
        current = value;
        clearInterval(timer);
      }

      setCount(current);
    }, 15);

    return () => clearInterval(timer);
  }, [value]);

  const getColor = () => {
    if (value >= 80) return "#16a34a";
    if (value >= 60) return "#f59e0b";
    return "#dc2626";
  };

  const getStatus = () => {
    if (value >= 80) return "Excellent";
    if (value >= 60) return "Good";
    return "Needs Work";
  };

  return (
    <div className="score-card">
      <p style={{ fontSize: "14px", fontWeight: "600", color: "#666" }}>
        {label}
      </p>

      <div style={{ fontSize: "28px", fontWeight: "700", margin: "10px 0" }}>
        {count}
      </div>

      <p style={{ fontSize: "13px", color: "#999", margin: "5px 0 0 0" }}>
        {getStatus()}
      </p>

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{
            width: `${count}%`,
            backgroundColor: getColor(),
          }}
        ></div>
      </div>
    </div>
  );
}

export default ScoreCard;
