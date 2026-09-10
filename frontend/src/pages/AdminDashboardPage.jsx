import { useState, useEffect, useCallback } from "react";
import { getStats, exportCSV } from "../api/dashboardApi";
import { getLogs } from "../api/checkLogApi";
import { getVisitors } from "../api/visitorApi";
import { preRegisterVisitor } from "../api/visitorApi";
import { getHosts, getStaff, createStaff } from "../api/authApi";
import { getAppointments } from "../api/appointmentApi";
import StatsCard from "../components/StatsCard";
import "./PageStyles.css";
import "./AdminDashboard.css";

const TABS = ["Overview", "Visitors", "Appointments", "Check Logs", "Manage Staff"];

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState(null);

  // Visitors tab state
  const [visitors, setVisitors] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", company: "", purpose: "", hostId: "" });
  const [hosts, setHosts] = useState([]);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Appointments tab state
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [apptFilter, setApptFilter] = useState("all");

  // Logs tab state
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilters, setLogFilters] = useState({ startDate: "", endDate: "" });

  // Manage Staff tab state
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "", role: "host", phone: "" });
  const [staffError, setStaffError] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);

  // Load stats on mount
  useEffect(() => {
    getStats().then((res) => setStats(res.data)).catch(() => {});
    getHosts().then((res) => setHosts(res.data)).catch(() => {});
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "Visitors") fetchVisitors();
    if (activeTab === "Appointments") fetchAppointments();
    if (activeTab === "Check Logs") fetchLogs();
    if (activeTab === "Manage Staff") fetchStaffList();
  }, [activeTab]);

  const fetchVisitors = async () => {
    setLoadingVisitors(true);
    try {
      const res = await getVisitors();
      setVisitors(res.data);
    } catch {
      /* silently ignore */
    } finally {
      setLoadingVisitors(false);
    }
  };

  const fetchAppointments = useCallback(async (status = apptFilter) => {
    setLoadingAppts(true);
    try {
      const params = status !== "all" ? { status } : {};
      const res = await getAppointments(params);
      setAppointments(res.data);
    } finally {
      setLoadingAppts(false);
    }
  }, [apptFilter]);

  const fetchLogs = async (params = {}) => {
    setLoadingLogs(true);
    try {
      const res = await getLogs(params);
      setLogs(res.data);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchStaffList = async () => {
    setLoadingStaff(true);
    try {
      const res = await getStaff();
      setStaff(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleAddFormChange = (e) =>
    setAddForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email) {
      setAddError("Name and email are required.");
      return;
    }
    setAddLoading(true);
    setAddError("");
    try {
      const fd = new FormData();
      Object.entries(addForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
      await preRegisterVisitor(fd);
      setAddForm({ name: "", email: "", phone: "", company: "", purpose: "", hostId: "" });
      setShowAddVisitor(false);
      fetchVisitors();
      // Refresh stats
      getStats().then((res) => setStats(res.data)).catch(() => {});
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add visitor.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await exportCSV();
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "checklogs.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed.");
    }
  };

  const applyLogFilters = () => {
    const params = {};
    if (logFilters.startDate) params.startDate = logFilters.startDate;
    if (logFilters.endDate) params.endDate = logFilters.endDate;
    fetchLogs(params);
  };

  const STATUS_COLORS = {
    pending: "status-pending", approved: "status-approved",
    rejected: "status-rejected", completed: "status-completed",
  };

  const handleStaffFormChange = (e) =>
    setStaffForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError("");
    try {
      await createStaff(staffForm);
      setStaffForm({ name: "", email: "", password: "", role: "host", phone: "" });
      setShowAddStaff(false);
      fetchStaffList();
      getHosts().then((res) => setHosts(res.data)).catch(() => {});
    } catch (err) {
      setStaffError(err.response?.data?.message || "Failed to create staff account.");
    } finally {
      setStaffLoading(false);
    }
  };

  return (
    <div className="page-container" id="admin-dashboard">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage visitors, appointments, passes, and activity logs.</p>
      </div>

      {/* Tab navigation */}
      <div className="admin-tabs" id="admin-tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab}
            id={`tab-${tab.toLowerCase().replace(" ", "-")}`}
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Overview" && "📊 "}
            {tab === "Visitors" && "👤 "}
            {tab === "Appointments" && "📅 "}
            {tab === "Check Logs" && "📋 "}
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "Overview" && (
        <div id="tab-overview-content">
          {stats ? (
            <div className="stats-grid" id="admin-stats">
              <div
                className="stats-card-wrapper"
                onClick={() => setActiveTab("Visitors")}
                title="Click to view all visitors"
              >
                <StatsCard label="Visitors Today" value={stats.totalVisitorsToday} icon="👤" color="#6366f1" />
              </div>
              <div
                className="stats-card-wrapper"
                onClick={() => setActiveTab("Check Logs")}
                title="Click to view check logs"
              >
                <StatsCard label="Currently On-Site" value={stats.currentlyCheckedIn} icon="🏢" color="#10b981" />
              </div>
              <div
                className="stats-card-wrapper"
                onClick={() => { setActiveTab("Appointments"); setApptFilter("pending"); }}
                title="Click to view pending appointments"
              >
                <StatsCard label="Pending Approvals" value={stats.pendingAppointments} icon="⏳" color="#f59e0b" />
              </div>
              <div
                className="stats-card-wrapper"
                onClick={() => setActiveTab("Check Logs")}
                title="Click to view check logs"
              >
                <StatsCard label="Passes Issued Today" value={stats.passesIssued} icon="🪪" color="#3b82f6" />
              </div>
            </div>
          ) : (
            <div className="loading-text">Loading stats...</div>
          )}

          <div className="overview-hint" id="overview-hint">
            <span>💡</span> Click any stat card above to jump to that section.
          </div>
        </div>
      )}

      {/* ── VISITORS TAB ── */}
      {activeTab === "Visitors" && (
        <div id="tab-visitors-content">
          <div className="section-header">
            <h2 className="section-title">All Visitors ({visitors.length})</h2>
            <button
              id="btn-add-visitor"
              className="btn-primary"
              onClick={() => { setShowAddVisitor(!showAddVisitor); setAddError(""); }}
            >
              {showAddVisitor ? "✕ Cancel" : "+ Add Visitor"}
            </button>
          </div>

          {showAddVisitor && (
            <div className="add-visitor-form card" id="add-visitor-form">
              <h3 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>New Visitor</h3>
              {addError && <div className="error-banner">{addError}</div>}
              <form onSubmit={handleAddVisitor} id="admin-add-visitor-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="av-name">Full Name *</label>
                    <input id="av-name" name="name" value={addForm.name} onChange={handleAddFormChange} placeholder="Visitor Name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="av-email">Email *</label>
                    <input id="av-email" type="email" name="email" value={addForm.email} onChange={handleAddFormChange} placeholder="visitor@company.com" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="av-phone">Phone</label>
                    <input id="av-phone" name="phone" value={addForm.phone} onChange={handleAddFormChange} placeholder="+91 98765 43210" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="av-company">Company</label>
                    <input id="av-company" name="company" value={addForm.company} onChange={handleAddFormChange} placeholder="Company Name" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="av-purpose">Purpose</label>
                    <input id="av-purpose" name="purpose" value={addForm.purpose} onChange={handleAddFormChange} placeholder="Meeting, Demo..." />
                  </div>
                  <div className="form-group">
                    <label htmlFor="av-host">Assign Host</label>
                    <select id="av-host" name="hostId" value={addForm.hostId} onChange={handleAddFormChange} required>
                      <option value="">-- Select Host --</option>
                      {hosts.map((h) => (
                        <option key={h._id} value={h._id}>{h.name} ({h.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button id="btn-submit-add-visitor" type="submit" className="btn-primary" disabled={addLoading}>
                    {addLoading ? "Adding..." : "Add Visitor"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowAddVisitor(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingVisitors ? (
            <div className="loading-text">Loading visitors...</div>
          ) : visitors.length === 0 ? (
            <div className="empty-state" id="no-visitors">
              <p>No visitors yet. Add one using the button above, or let visitors self-register at <strong>/pre-register</strong>.</p>
            </div>
          ) : (
            <div className="table-wrapper" id="visitors-table-wrapper">
              <table className="data-table" id="visitors-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Company</th>
                    <th>Purpose</th>
                    <th>Host</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((v, i) => (
                    <tr key={v._id} id={`visitor-row-${v._id}`}>
                      <td style={{ color: "#475569" }}>{i + 1}</td>
                      <td style={{ color: "#e2e8f0", fontWeight: 600 }}>{v.name}</td>
                      <td>{v.email}</td>
                      <td>{v.phone || "—"}</td>
                      <td>{v.company || "—"}</td>
                      <td>{v.purpose || "—"}</td>
                      <td>{v.hostId?.name || "—"}</td>
                      <td>{new Date(v.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── APPOINTMENTS TAB ── */}
      {activeTab === "Appointments" && (
        <div id="tab-appointments-content">
          <div className="section-header">
            <h2 className="section-title">All Appointments ({appointments.length})</h2>
          </div>

          <div className="filter-tabs" id="appt-status-filter">
            {["all", "pending", "approved", "rejected", "completed"].map((s) => (
              <button
                key={s}
                id={`admin-filter-${s}`}
                className={`filter-tab ${apptFilter === s ? "active" : ""}`}
                onClick={() => {
                  setApptFilter(s);
                  fetchAppointments(s);
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {loadingAppts ? (
            <div className="loading-text">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">No appointments found{apptFilter !== "all" ? ` with status "${apptFilter}"` : ""}.</div>
          ) : (
            <div className="table-wrapper" id="appointments-table-wrapper">
              <table className="data-table" id="appointments-table">
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Company</th>
                    <th>Host</th>
                    <th>Scheduled</th>
                    <th>Purpose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a._id} id={`appt-row-${a._id}`}>
                      <td style={{ color: "#e2e8f0", fontWeight: 600 }}>{a.visitorId?.name || "—"}</td>
                      <td>{a.visitorId?.company || "—"}</td>
                      <td>{a.hostId?.name || "—"}</td>
                      <td>{new Date(a.scheduledTime).toLocaleString("en-IN")}</td>
                      <td>{a.purpose || "—"}</td>
                      <td>
                        <span className={`status-badge ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── CHECK LOGS TAB ── */}
      {activeTab === "Check Logs" && (
        <div id="tab-checklogs-content">
          <div className="section-header">
            <h2 className="section-title">Check Logs ({logs.length})</h2>
            <button id="btn-export-csv" className="btn-secondary" onClick={handleExportCSV}>
              ⬇ Export CSV
            </button>
          </div>

          <div className="filter-row" id="log-filters">
            <div className="form-group">
              <label htmlFor="filter-start">From</label>
              <input
                id="filter-start"
                type="date"
                name="startDate"
                value={logFilters.startDate}
                onChange={(e) => setLogFilters((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="filter-end">To</label>
              <input
                id="filter-end"
                type="date"
                name="endDate"
                value={logFilters.endDate}
                onChange={(e) => setLogFilters((p) => ({ ...p, endDate: e.target.value }))}
              />
            </div>
            <button id="btn-apply-filters" className="btn-primary" onClick={applyLogFilters}>Apply</button>
            <button
              id="btn-clear-filters"
              className="btn-secondary"
              onClick={() => { setLogFilters({ startDate: "", endDate: "" }); fetchLogs(); }}
            >
              Clear
            </button>
          </div>

          {loadingLogs ? (
            <div className="loading-text">Loading logs...</div>
          ) : (
            <div className="table-wrapper" id="logs-table-wrapper">
              <table className="data-table" id="logs-table">
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Company</th>
                    <th>Host</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Scanned By</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>No logs found.</td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const appt = log.passId?.appointmentId;
                      const visitor = appt?.visitorId;
                      const host = appt?.hostId;
                      return (
                        <tr key={log._id} id={`log-${log._id}`}>
                          <td style={{ color: "#e2e8f0", fontWeight: 600 }}>{visitor?.name || "—"}</td>
                          <td>{visitor?.company || "—"}</td>
                          <td>{host?.name || "—"}</td>
                          <td>{log.checkInTime ? new Date(log.checkInTime).toLocaleString("en-IN") : "—"}</td>
                          <td>
                            {log.checkOutTime
                              ? new Date(log.checkOutTime).toLocaleString("en-IN")
                              : <span className="on-site">● On-site</span>}
                          </td>
                          <td>{log.scannedBy?.name || "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MANAGE STAFF TAB ── */}
      {activeTab === "Manage Staff" && (
        <div id="tab-staff-content">
          <div className="section-header">
            <h2 className="section-title">Manage Staff ({staff.length})</h2>
            <button
              className="btn-primary"
              onClick={() => { setShowAddStaff(!showAddStaff); setStaffError(""); }}
            >
              {showAddStaff ? "✕ Cancel" : "+ Add Staff"}
            </button>
          </div>

          {showAddStaff && (
            <div className="add-visitor-form card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>New Staff Account</h3>
              {staffError && <div className="error-banner">{staffError}</div>}
              <form onSubmit={handleAddStaff}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input name="name" value={staffForm.name} onChange={handleStaffFormChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" value={staffForm.email} onChange={handleStaffFormChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Password *</label>
                    <input type="password" name="password" value={staffForm.password} onChange={handleStaffFormChange} required />
                  </div>
                  <div className="form-group">
                    <label>Role *</label>
                    <select name="role" value={staffForm.role} onChange={handleStaffFormChange} required>
                      <option value="host">Host</option>
                      <option value="frontdesk">Frontdesk</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={staffForm.phone} onChange={handleStaffFormChange} />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="submit" className="btn-primary" disabled={staffLoading}>
                    {staffLoading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingStaff ? (
            <div className="loading-text">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="empty-state">No staff accounts found.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s._id}>
                      <td style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {s.role}
                        </span>
                      </td>
                      <td>{s.phone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
