import { Link } from "react-router-dom";
import "./PageStyles.css";

const LandingPage = () => {
  return (
    <div className="page-container">
      <div className="landing-card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', background: 'var(--bg-surface)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🪪</div>
        <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Visitor Pass System</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
          Welcome to the digital visitor management portal.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/pre-register" className="btn-primary" style={{ padding: '1rem', fontSize: '1.1rem' }}>
            Pre-Register as Visitor
          </Link>
          <Link to="/check-status" className="btn-secondary" style={{ padding: '1rem', fontSize: '1.1rem' }}>
            Check My Pass Status
          </Link>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Staff Members</p>
          <Link to="/login" className="btn-outline" style={{ display: 'inline-block' }}>
            Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
