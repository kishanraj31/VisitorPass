import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" id="nav-logo">
          <span className="brand-icon">🪪</span> VisitorPass
        </Link>
      </div>

      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login" id="nav-login">Login</Link>
            <Link to="/pre-register" id="nav-preregister" className="btn-outline">
              Visitor Pre-Register
            </Link>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <Link to="/admin" id="nav-admin">Dashboard</Link>
            <Link to="/frontdesk" id="nav-frontdesk-admin">Front Desk</Link>
          </>
        )}

        {user?.role === "frontdesk" && (
          <Link to="/frontdesk" id="nav-frontdesk">Front Desk</Link>
        )}

        {user?.role === "host" && (
          <Link to="/host" id="nav-host">My Appointments</Link>
        )}

        {user?.role === "visitor" && (
          <Link to="/my-pass" id="nav-my-pass">My Pass</Link>
        )}

        {user && (
          <div className="navbar-user">
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
            <span className="user-name">{user.name}</span>
            <button id="nav-logout" className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
