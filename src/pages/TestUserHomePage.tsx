import { useState } from "react";
import { useApp } from "../context/AppContext";
import SummaryCard from "../components/SummaryCard";

export default function TestUserHomePage() {
  const { users, currentUser, updateOwnProfile, showToast } = useApp();

  const [name, setName] = useState(currentUser?.name || "");
  const [password, setPassword] = useState("");
  const [profileError, setProfileError] = useState("");

  function handleUpdateProfile(requirePassword = false) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setProfileError("Name is required");
      showToast("Name is required", "error");
      return;
    }
    if (trimmedName.length < 2) {
      setProfileError("Name must be at least 2 characters");
      showToast("Name must be at least 2 characters", "error");
      return;
    }
    if (requirePassword && !password.trim()) {
      setProfileError("Please enter a new password (minimum 6 characters)");
      showToast("Please enter a new password", "error");
      return;
    }
    if (password.trim() && password.trim().length < 6) {
      setProfileError("Password must be at least 6 characters");
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    setProfileError("");
    updateOwnProfile(trimmedName, password.trim());
    if (password.trim()) setPassword("");
  }

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

        {profileError && (
          <div className="error" data-testid="test-user-profile-error" role="alert" style={{ marginBottom: "10px" }}>
            {profileError}
          </div>
        )}

        <label htmlFor="test-user-profile-name-input">Name</label>
        <input
          id="test-user-profile-name-input"
          data-testid="test-user-profile-name-input"
          aria-label="Profile name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (profileError) setProfileError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleUpdateProfile(false);
            }
          }}
        />

        <label htmlFor="test-user-profile-password-input">New Password</label>
        <input
          id="test-user-profile-password-input"
          data-testid="test-user-change-password-input"
          aria-label="New password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (profileError) setProfileError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleUpdateProfile(false);
            }
          }}
          placeholder="Optional (min 6 characters)"
          type="password"
        />

        <div className="actions" data-testid="test-user-profile-actions">
          <button
            data-testid="test-user-update-profile-button"
            aria-label="Update own profile"
            onClick={() => handleUpdateProfile(false)}
          >
            Update Own Profile
          </button>
          <button
            type="button"
            data-testid="test-user-change-password-button"
            aria-label="Change password"
            onClick={() => handleUpdateProfile(true)}
          >
            Change Password
          </button>
        </div>
      </section>
    </main>
  );
}

