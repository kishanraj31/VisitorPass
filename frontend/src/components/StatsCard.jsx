import "./StatsCard.css";

const StatsCard = ({ label, value, icon, color = "#6366f1" }) => {
  return (
    <div className="stats-card" style={{ "--accent": color }} id={`stats-${label.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <p className="stats-value">{value ?? "—"}</p>
        <p className="stats-label">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
