import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <main className="center-card" data-testid="unauthorized-page" aria-label="Unauthorized page">
      <h1 data-testid="unauthorized-title">Unauthorized</h1>
      <p data-testid="unauthorized-message">You do not have permission to access this page.</p>
      <Link data-testid="unauthorized-home-button" aria-label="Go home from unauthorized page" to="/">
        Go Home
      </Link>
      <Link data-testid="unauthorized-login-button" aria-label="Go to login page" to="/login">
        Login
      </Link>
    </main>
  );
}
