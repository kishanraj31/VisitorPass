import { useState } from "react";
import { approveAppointment, rejectAppointment } from "../api/appointmentApi";
import "./AppointmentCard.css";

const STATUS_COLORS = {
  pending: "status-pending",
  approved: "status-approved",
  rejected: "status-rejected",
  completed: "status-completed",
};

const AppointmentCard = ({ appointment, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const { visitorId, scheduledTime, status, purpose, _id } = appointment;

  const handleAction = async (action) => {
    setLoading(true);
    try {
      if (action === "approve") await approveAppointment(_id);
      else await rejectAppointment(_id);
      onStatusChange?.();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appt-card" id={`appt-${_id}`}>
      <div className="appt-header">
        <div>
          <h3 className="appt-visitor-name">{visitorId?.name || "Visitor"}</h3>
          <p className="appt-company">{visitorId?.company || "—"}</p>
        </div>
        <span className={`status-badge ${STATUS_COLORS[status]}`}>{status}</span>
      </div>

      <div className="appt-details">
        <div className="appt-detail-item">
          <span className="detail-label">📅 Scheduled</span>
          <span>{new Date(scheduledTime).toLocaleString("en-IN")}</span>
        </div>
        <div className="appt-detail-item">
          <span className="detail-label">✉️ Email</span>
          <span>{visitorId?.email}</span>
        </div>
        <div className="appt-detail-item">
          <span className="detail-label">📋 Purpose</span>
          <span>{purpose || "—"}</span>
        </div>
      </div>

      {status === "pending" && (
        <div className="appt-actions">
          <button
            id={`btn-approve-${_id}`}
            className="btn-approve"
            onClick={() => handleAction("approve")}
            disabled={loading}
          >
            ✓ Approve
          </button>
          <button
            id={`btn-reject-${_id}`}
            className="btn-reject"
            onClick={() => handleAction("reject")}
            disabled={loading}
          >
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
