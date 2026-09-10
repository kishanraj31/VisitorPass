import { useState, useEffect } from "react";
import VisitorForm from "../components/VisitorForm";
import { preRegisterVisitor } from "../api/visitorApi";
import { getHosts } from "../api/authApi";
import "./PageStyles.css";

const VisitorPreRegisterPage = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Silently fails for unauthenticated visitors — host dropdown stays empty
    getHosts().then((res) => setHosts(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");
    try {
      await preRegisterVisitor(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-container" id="pre-register-success">
        <div className="success-box">
          <div className="success-icon">✅</div>
          <h2>Registration Successful!</h2>
          <p>Your details have been submitted. The host will approve your appointment and the front desk will issue your pass.</p>
          <button className="btn-primary" onClick={() => setSuccess(false)} id="btn-register-again">
            Register Another Visit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" id="pre-register-page">
      <div className="page-header">
        <h1 className="page-title">Visitor Pre-Registration</h1>
        <p className="page-subtitle">Fill in your details before visiting. Your host will be notified for approval.</p>
      </div>

      {error && <div className="error-banner" id="preregister-error">{error}</div>}

      <div className="card">
        <VisitorForm onSubmit={handleSubmit} loading={loading} hosts={hosts} />
      </div>
    </div>
  );
};

export default VisitorPreRegisterPage;
