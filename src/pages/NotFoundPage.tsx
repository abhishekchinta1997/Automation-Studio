import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="center-card" data-testid="not-found-page" aria-label="Page not found">
      <div data-testid="not-found-error-illustration" aria-hidden="true">404</div>
      <h1 data-testid="not-found-title">404</h1>
      <p data-testid="not-found-message">Page not found.</p>
      <Link data-testid="not-found-home-button" aria-label="Return home from not found page" to="/">
        Go Home
      </Link>
    </main>
  );
}
