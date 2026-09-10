import { useState, useEffect, useCallback } from "react";
import { getAppointments } from "../api/appointmentApi";
import AppointmentCard from "../components/AppointmentCard";
import "./PageStyles.css";

const HostDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await getAppointments(params);
      setAppointments(res.data);
    } catch {
      // silently fail; user stays on the page
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const statuses = ["all", "pending", "approved", "rejected", "completed"];

  return (
    <div className="page-container" id="host-dashboard">
      <div className="page-header">
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">Approve or reject incoming visit requests from your visitors.</p>
      </div>

      <div className="filter-tabs" id="appt-filter-tabs">
        {statuses.map((s) => (
          <button
            key={s}
            id={`filter-${s}`}
            className={`filter-tab ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-text">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state" id="no-appointments">
          <p>No appointments found{filter !== "all" ? ` with status "${filter}"` : ""}.</p>
        </div>
      ) : (
        <div className="card-grid" id="appointments-list">
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              onStatusChange={fetchAppointments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HostDashboardPage;
