import { useState } from "react";
import { checkPassStatus } from "../api/visitorApi";
import PassCard from "../components/PassCard";
import "./PageStyles.css";

const CheckPassStatusPage = () => {
  const [email, setEmail] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setStatusData(null);

    try {
      const res = await checkPassStatus(email);
      setStatusData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error checking status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="landing-card" style={{ maxWidth: '600px', margin: '2rem auto', background: 'var(--bg-surface)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Check Pass Status</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>
          Enter the email address you used to pre-register.
        </p>

        <form onSubmit={handleCheck} style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="visitor@example.com"
              required
              className="full-width"
              style={{ padding: '1rem', fontSize: '1.1rem' }}
            />
          </div>
          <button type="submit" className="btn-primary full-width" style={{ padding: '1rem', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {error && <div className="error-message" style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>{error}</div>}

        {statusData && statusData.appointment && (
          <div className="status-result" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#e2e8f0' }}>Request Status</h3>
            <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <p><strong>Host:</strong> {statusData.appointment.hostId?.name}</p>
              <p><strong>Scheduled For:</strong> {new Date(statusData.appointment.scheduledTime).toLocaleString("en-IN")}</p>
              <p style={{ marginTop: '0.75rem' }}>
                Status: <span className={`badge badge-${statusData.appointment.status}`} style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '500', 
                  backgroundColor: statusData.appointment.status === 'approved' ? 'rgba(34,197,94,0.2)' : 
                                  statusData.appointment.status === 'pending' ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)',
                  color: statusData.appointment.status === 'approved' ? '#4ade80' : 
                         statusData.appointment.status === 'pending' ? '#facc15' : '#f87171'
                }}>
                  {statusData.appointment.status.toUpperCase()}
                </span>
              </p>
            </div>

            {statusData.pass && statusData.appointment.status === "approved" && (
              <div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#e2e8f0' }}>Your Digital Pass</h3>
                <PassCard pass={statusData.pass} />
              </div>
            )}

            {!statusData.pass && statusData.appointment.status === "pending" && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Your request is currently pending host approval. Please check back later.</p>
            )}

            {statusData.appointment.status === "rejected" && (
              <p style={{ color: '#f87171', textAlign: 'center' }}>Unfortunately, your visit request was declined.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckPassStatusPage;
