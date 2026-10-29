import { useState } from "react";
import { useApp } from "../context/AppContext";
import SummaryCard from "../components/SummaryCard";

export default function TestUserHomePage() {
  const { users, currentUser, updateOwnProfile } = useApp();

  const [name, setName] = useState(currentUser?.name || "");
  const [password, setPassword] = useState("");

  return (
    <main data-testid="test-user-dashboard" aria-label="Test user dashboard">
      <header data-testid="test-user-dashboard-header">
        <h1 data-testid="test-user-dashboard-title">Test User Home</h1>
        <p data-testid="test-user-dashboard-subtitle">Read-only access dashboard</p>
      </header>

      <section className="cards" data-testid="test-user-dashboard-cards" aria-label="Dashboard summary cards">
        <SummaryCard
          testId="test-user-total-users-card"
          title="Total Users"
          value={users.length}
        />
        <SummaryCard
          testId="test-user-admin-users-card"
          title="Admin Users"
          value={users.filter((u) => u.role === "Admin User" ||u.role === "Super User").length}
        />
        <SummaryCard
          testId="test-user-test-users-card"
          title="Test Users"
          value={users.filter((u) => u.role === "Test User").length}
        />
      </section>

      <section className="card profile" data-testid="test-user-profile-card" aria-label="Own profile">
        <h2 data-testid="test-user-profile-title">Own Profile</h2>
        <p data-testid="test-user-profile-email">Email: {currentUser?.email}</p>
        <p data-testid="test-user-profile-role">Role: {currentUser?.role}</p>

        <label htmlFor="test-user-profile-name-input">Name</label>
        <input
          id="test-user-profile-name-input"
          data-testid="test-user-profile-name-input"
          aria-label="Profile name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="test-user-profile-password-input">New Password</label>
        <input
          id="test-user-profile-password-input"
          data-testid="test-user-change-password-input"
          aria-label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Optional"
          type="password"
        />

        <div className="actions" data-testid="test-user-profile-actions">
          <button
            data-testid="test-user-update-profile-button"
            aria-label="Update own profile"
            onClick={() => updateOwnProfile(name, password)}
          >
            Update Own Profile
          </button>
          <button
            type="button"
            data-testid="test-user-change-password-button"
            aria-label="Change password"
            onClick={() => updateOwnProfile(name, password)}
          >
            Change Password
          </button>
        </div>
      </section>
    </main>
  );
}

