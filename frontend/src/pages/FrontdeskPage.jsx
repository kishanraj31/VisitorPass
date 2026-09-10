import { useState, useEffect, useCallback } from "react";
import { getAppointments } from "../api/appointmentApi";
import { issuePass, getPass } from "../api/passApi";
import { checkIn, checkOut } from "../api/checkLogApi";
import QRScanner from "../components/QRScanner";
import PassCard from "../components/PassCard";
import "./PageStyles.css";

const FrontdeskPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuingPassFor, setIssuingPassFor] = useState(null);
  const [issuedPass, setIssuedPass] = useState(null);
  
  const [scanMode, setScanMode] = useState("qr"); // 'qr' | 'manual'
  const [scanAction, setScanAction] = useState("checkin"); // 'checkin' | 'checkout'
  
  const [scanMessage, setScanMessage] = useState(null);
  const [manualPassId, setManualPassId] = useState("");

  const fetchApproved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppointments({ status: "approved" });
      setAppointments(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApproved(); }, [fetchApproved]);

  const handleIssuePass = async (appointmentId) => {
    setIssuingPassFor(appointmentId);
    try {
      const res = await issuePass(appointmentId);
      const passRes = await getPass(res.data._id);
      setIssuedPass(passRes.data);
      fetchApproved(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to issue pass.");
    } finally {
      setIssuingPassFor(null);
    }
  };

  const handleScan = async (qrCodeData) => {
    setScanMessage(null);
    try {
      if (scanAction === "checkin") {
        await checkIn({ qrCodeData });
        setScanMessage({ type: "success", text: "✅ Check-in recorded successfully!" });
      } else {
        await checkOut({ qrCodeData });
        setScanMessage({ type: "success", text: "✅ Check-out recorded successfully!" });
      }
    } catch (err) {
      setScanMessage({ type: "error", text: err.response?.data?.message || "Scan failed." });
    }
  };

  const handleManualAction = async () => {
    if (!manualPassId) return;
    try {
      if (scanAction === "checkin") {
        await checkIn({ passId: manualPassId });
        setScanMessage({ type: "success", text: "✅ Check-in recorded!" });
      } else {
        await checkOut({ passId: manualPassId });
        setScanMessage({ type: "success", text: "✅ Check-out recorded!" });
      }
      setManualPassId("");
    } catch (err) {
      setScanMessage({ type: "error", text: err.response?.data?.message || "Action failed." });
    }
  };

  return (
    <div className="page-container" id="frontdesk-page">
      <div className="page-header">
        <h1 className="page-title">Front Desk</h1>
        <p className="page-subtitle">Issue passes and manage visitor check-in/out.</p>
      </div>

      <div className="frontdesk-grid">
        <section className="fd-section" id="approved-appointments">
          <h2 className="section-title">Approved Appointments</h2>
          {loading ? (
            <div className="loading-text">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">No approved appointments waiting for a pass.</div>
          ) : (
            <div className="appt-issue-list">
              {appointments.map((appt) => (
                <div key={appt._id} className="appt-issue-row" id={`appt-issue-${appt._id}`}>
                  <div>
                    <strong>{appt.visitorId?.name}</strong>
                    <p className="small-text">{appt.visitorId?.company} — {new Date(appt.scheduledTime).toLocaleString("en-IN")}</p>
                  </div>
                  <button
                    className="btn-primary"
                    id={`btn-issue-${appt._id}`}
                    onClick={() => handleIssuePass(appt._id)}
                    disabled={issuingPassFor === appt._id}
                  >
                    {issuingPassFor === appt._id ? "Issuing..." : "Issue Pass"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {issuedPass && (
            <div className="issued-pass-section" id="issued-pass-preview">
              <h3 style={{ color: "#34d399", marginBottom: "1rem" }}>Pass Issued Successfully!</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>You can print this badge or the visitor can check their email.</p>
              <PassCard pass={issuedPass} showRevoke onRevoke={() => setIssuedPass(null)} />
            </div>
          )}
        </section>

        <section className="fd-section" id="checkin-checkout">
          <h2 className="section-title">Check-In / Check-Out</h2>

          <div className="scan-mode-tabs" style={{ marginBottom: "1rem" }}>
            <button
              id="tab-action-checkin"
              className={`filter-tab ${scanAction === "checkin" ? "active" : ""}`}
              onClick={() => { setScanAction("checkin"); setScanMessage(null); }}
              style={{ background: scanAction === "checkin" ? "var(--success-color)" : "", color: scanAction === "checkin" ? "#000" : "" }}
            >
              Check-In Mode
            </button>
            <button
              id="tab-action-checkout"
              className={`filter-tab ${scanAction === "checkout" ? "active" : ""}`}
              onClick={() => { setScanAction("checkout"); setScanMessage(null); }}
              style={{ background: scanAction === "checkout" ? "var(--warning-color)" : "", color: scanAction === "checkout" ? "#000" : "" }}
            >
              Check-Out Mode
            </button>
          </div>

          <div className="scan-mode-tabs">
            <button
              id="tab-mode-qr"
              className={`filter-tab ${scanMode === "qr" ? "active" : ""}`}
              onClick={() => { setScanMode("qr"); setScanMessage(null); }}
            >
              📷 Use QR Scanner
            </button>
            <button
              id="tab-mode-manual"
              className={`filter-tab ${scanMode === "manual" ? "active" : ""}`}
              onClick={() => { setScanMode("manual"); setScanMessage(null); }}
            >
              ✋ Manual Entry
            </button>
          </div>

          {scanMode === "qr" && (
            <QRScanner onScan={handleScan} label={`Scan visitor's QR code to ${scanAction}`} />
          )}

          {scanMode === "manual" && (
            <div className="checkout-manual" id="manual-entry-box" style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <label htmlFor="manual-passid" style={{ display: 'block', marginBottom: '1rem', color: '#e2e8f0' }}>Enter Pass ID to {scanAction}:</label>
              <div className="checkout-row" style={{ display: 'flex', gap: '1rem' }}>
                <input
                  id="manual-passid"
                  value={manualPassId}
                  onChange={(e) => setManualPassId(e.target.value)}
                  placeholder="Pass ObjectId..."
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-base)', color: '#fff' }}
                />
                <button id="btn-manual-action" className="btn-primary" onClick={handleManualAction}>
                  {scanAction === "checkin" ? "Check In" : "Check Out"}
                </button>
              </div>
            </div>
          )}

          {scanMessage && (
            <div
              className={`scan-message ${scanMessage.type}`}
              id="scan-result-message"
              style={{ marginTop: '1.5rem', textAlign: 'center' }}
            >
              {scanMessage.text}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FrontdeskPage;
