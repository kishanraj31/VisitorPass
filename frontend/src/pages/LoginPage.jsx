import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "host" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.role === "visitor") {
      navigate("/check-status");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.role);
      const roleRoutes = {
        admin: "/admin",
        frontdesk: "/frontdesk",
        host: "/host"
      };
      navigate(roleRoutes[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check credentials and role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🪪</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to Visitor Pass System</p>

        {error && <div className="auth-error" id="login-error">{error}</div>}

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label htmlFor="login-role">Select Role</label>
            <select
              id="login-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="frontdesk">Frontdesk</option>
              <option value="host">Host (Employee)</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>

          {form.role === "visitor" ? (
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Visitors do not require a password to log in.</p>
              <button id="btn-visitor-status" type="submit" className="btn-primary full-width">
                Check Pass Status
              </button>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button id="login-submit" type="submit" className="btn-primary full-width" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </>
          )}
        </form>

        <p className="auth-footer">
          <Link to="/" id="link-home">Return to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
