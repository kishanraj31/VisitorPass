import { Link } from "react-router-dom";
import "./PageStyles.css";

export const NotAuthorizedPage = () => (
  <div className="page-container error-page" id="not-authorized-page">
    <div className="error-content">
      <div className="error-code">403</div>
      <h1>Not Authorized</h1>
      <p>You don't have permission to view this page.</p>
      <Link to="/" id="link-home-403" className="btn-primary">Go Home</Link>
    </div>
  </div>
);

export const NotFoundPage = () => (
  <div className="page-container error-page" id="not-found-page">
    <div className="error-content">
      <div className="error-code">404</div>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" id="link-home-404" className="btn-primary">Go Home</Link>
    </div>
  </div>
);
