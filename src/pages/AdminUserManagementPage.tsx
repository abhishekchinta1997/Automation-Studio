import { FormEvent, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { AppUser, Role, UserStatus } from "../types/user";

type ExtendedUser = AppUser & {
  locked?: boolean;
  userGroup?: string;
};

type ExtendedForm = {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
  userGroup: string;
};

type SortKey =
  | "id"
  | "name"
  | "email"
  | "role"
  | "status"
  | "createdDate"
  | "lastLogin";

type SortDirection = "asc" | "desc";
type SearchMode = "exact" | "partial" | "starts";
type ModalMode = "create" | "edit" | null;

const SUPER_USER_EMAIL = "admin@example.com";
const SUPER_USER_ID = "USR-1001";

const emptyForm: ExtendedForm = {
  name: "",
  email: "",
  password: "",
  role: "Test User" as Role,
  status: "Active" as UserStatus,
  userGroup: "Engineering",
};

function isSuperUser(user?: Partial<ExtendedUser> | null) {
  return user?.email === SUPER_USER_EMAIL || user?.id === SUPER_USER_ID;
}

function isAdminUser(user?: Partial<ExtendedUser> | null) {
  return user?.role === "Admin User";
}

function isTestUser(user?: Partial<ExtendedUser> | null) {
  return user?.role === "Test User";
}

function getCreatedTime(user: ExtendedUser) {
  return new Date(user.createdDate).getTime() || 0;
}

function getLastLoginValue(user: ExtendedUser) {
  return String(user.lastLogin || "").trim().toLowerCase();
}

function isNeverLoggedIn(user: ExtendedUser) {
  const value = getLastLoginValue(user);
  return !value || value === "never" || value === "n/a" || value === "not logged in";
}

function getUserIdNumber(id: string) {
  const match = id.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function testIdSlug(value: string) {
  return String(value || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminUserManagementPage() {
  const {
    users,
    currentUser,
    createUser,
    updateUser,
    deleteUsers,
    bulkStatus,
    resetPassword,
    createRandomUsers,
    showToast,
  } = useApp();

  const appUsers = users as ExtendedUser[];
  const loggedInUser = currentUser as ExtendedUser | null;
  const loggedInIsSuperUser = isSuperUser(loggedInUser);

  const [searchMode, setSearchMode] = useState<SearchMode>("partial");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<ExtendedUser | null>(null);
  const [form, setForm] = useState<ExtendedForm>(emptyForm);
  const [error, setError] = useState("");
  const [bulkCount, setBulkCount] = useState(3);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [recentlyCreated, setRecentlyCreated] = useState(false);
  const [neverLoggedIn, setNeverLoggedIn] = useState(false);
  const [lockedUsers, setLockedUsers] = useState(false);
  const [confirm, setConfirm] = useState<{
    message: string;
    action: () => void;
  } | null>(null);

  const [generateUserModal, setGenerateUserModal] =
  useState(false);

  const [resetModalUser, setResetModalUser] =
  useState<ExtendedUser | null>(null);

const [newPassword, setNewPassword] =
  useState("");

const [resetPasswordError, setResetPasswordError] =
  useState("");

  function normalizeUser(user: ExtendedUser): ExtendedUser {
    if (isSuperUser(user)) {
      return {
        ...user,
        id: SUPER_USER_ID,
        email: SUPER_USER_EMAIL,
        role: "Super User" as Role,
        status: "Active" as UserStatus,
        locked: false,
      };
    }

    return {
      ...user,
      locked: Boolean(user.locked),
    };
  }

  const normalizedUsers = useMemo(
    () => appUsers.map((user) => normalizeUser(user)),
    [appUsers],
  );

  const recentDateLimit = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }, []);

  function canManageUser(target: ExtendedUser) {
  // nobody can manage super user
  if (isSuperUser(target)) return false;

  // super user can manage everyone
  if (loggedInIsSuperUser) return true;

  // admin user can manage admin + test users
  if (isAdminUser(loggedInUser)) {
    return (
      isAdminUser(target) ||
      isTestUser(target)
    );
  }

  return false;
}

  function canSelectUser(target: ExtendedUser) {
    return canManageUser(target);
  }

  function canChangeRole(target: ExtendedUser) {
    if (!canManageUser(target)) return false;

    // allow changing both admin and test users
    return (
      isAdminUser(target) ||
      isTestUser(target)
    );
  }

    function canDeleteUser(target: ExtendedUser) {
    if (isSuperUser(target)) return false;

    // admin can delete only test users
    if (isAdminUser(loggedInUser)) {
      return isTestUser(target);
    }

    // super user can delete everyone except super user
    return loggedInIsSuperUser;
  }

  function openCreate() {
    setForm({
      ...emptyForm,
      role: loggedInIsSuperUser ? ("Test User" as Role) : ("Test User" as Role),
    });
    setEditing(null);
    setError("");
    setModal("create");
  }

  function openEdit(user: ExtendedUser) {
    if (!canManageUser(user)) {
      showToast("You do not have permission to edit this user", "error");
      return;
    }

    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      status: user.status,
      userGroup: user.userGroup || "Engineering",
    });
    setError("");
    setModal("edit");
  }

  function validate() {
    if (!form.name.trim()) return "Name required";
    if (!form.email.trim()) return "Email required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      return "Valid email format required";
    }
    if (modal === "create") {
  if (!form.password) {
    return "Password required";
  }

  if (form.password.length < 6) {
    return "Password minimum length is 6";
  }
}

    if (!loggedInIsSuperUser && form.role !== "Test User") {
      return "Admin users can create or update Test Users only";
    }

    return "";
  }

  function save(event: FormEvent) {
    event.preventDefault();

    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    if (modal === "create") {
      const createError = createUser(form);
      if (createError) {
        setError(createError);
        return;
      }

      showToast(`User ${form.name} created successfully`, "success");
    } else if (editing) {
      if (!canManageUser(editing)) {
        setError("You do not have permission to update this user");
        return;
      }

      const duplicateEmail = normalizedUsers.some(
        (user) =>
          user.email.toLowerCase() === form.email.toLowerCase() &&
          user.id !== editing.id,
      );

      if (duplicateEmail) {
        setError("Duplicate email already exists");
        return;
      }

      const updatedForm = {
        ...form,
      };

      if (!form.password.trim()) {
        delete (updatedForm as Partial<ExtendedForm>).password;
      }

      updateUser(editing.id, updatedForm);
      showToast(`User ${form.name} updated`, "success");
    }

    setModal(null);
  }

  function matchesSearch(user: ExtendedUser) {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    const values = [user.name, user.email].map((value) => value.toLowerCase());

    if (searchMode === "exact") return values.some((value) => value === query);
    if (searchMode === "starts") {
      return values.some((value) => value.startsWith(query));
    }

    return values.some((value) => value.includes(query));
  }

  function compareUsers(a: ExtendedUser, b: ExtendedUser) {
    let result = 0;

    if (sortKey === "id") {
      result = getUserIdNumber(a.id) - getUserIdNumber(b.id);
    } else if (sortKey === "createdDate") {
      result = getCreatedTime(a) - getCreatedTime(b);
    } else if (sortKey === "lastLogin") {
      result = String(a.lastLogin || "").localeCompare(String(b.lastLogin || ""));
    } else {
      result = String(a[sortKey] || "").localeCompare(String(b[sortKey] || ""));
    }

    return sortDirection === "asc" ? result : -result;
  }

  const filtered = useMemo(() => {
    return normalizedUsers
      .filter((user) => {
        return (
          matchesSearch(user) &&
          (!showActiveOnly || user.status === "Active") &&
          (!recentlyCreated || getCreatedTime(user) >= recentDateLimit) &&
          (!neverLoggedIn || isNeverLoggedIn(user)) &&
          (!lockedUsers || Boolean(user.locked))
        );
      })
      .sort(compareUsers);
  }, [
    normalizedUsers,
    search,
    searchMode,
    showActiveOnly,
    recentlyCreated,
    neverLoggedIn,
    lockedUsers,
    recentDateLimit,
    sortKey,
    sortDirection,
  ]);

  const pageUsers = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const selectablePageUsers = pageUsers.filter(canSelectUser);

  function toggleSort(nextSortKey: SortKey) {
  let nextDirection: SortDirection = "asc";

  if (sortKey === nextSortKey) {
    nextDirection =
      sortDirection === "asc"
        ? "desc"
        : "asc";
  }

  setSortKey(nextSortKey);
  setSortDirection(nextDirection);
  setPage(1);
}

  function sortLabel(key: SortKey) {
    if (sortKey !== key) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  }

  function toggleSelected(id: string) {
    const target = normalizedUsers.find((user) => user.id === id);
    if (!target || !canSelectUser(target)) return;

    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id],
    );
  }

  function allSelected() {
    const ids = selectablePageUsers.map((user) => user.id);
    if (!ids.length) return;

    setSelected((previous) =>
      ids.every((id) => previous.includes(id))
        ? previous.filter((id) => !ids.includes(id))
        : [...new Set([...previous, ...ids])],
    );
  }

  function getAllowedSelectedUsers() {
    return normalizedUsers.filter(
      (user) => selected.includes(user.id) && canManageUser(user),
    );
  }

  function handleBulkDelete() {
    const allowedUsers = getAllowedSelectedUsers();
    if (!allowedUsers.length) return;

    setConfirm({
      message: "Delete selected allowed users?",
      action: () => {
        deleteUsers(allowedUsers.map((user) => user.id));
        setSelected([]);
        setConfirm(null);
      },
    });
  }

  function handleBulkStatus(status: UserStatus) {
    const allowedUsers = getAllowedSelectedUsers();
    if (!allowedUsers.length) return;

    bulkStatus(
      allowedUsers.map((user) => user.id),
      status,
    );
    setSelected([]);
  }

  function handleDelete(user: ExtendedUser) {
    if (!canManageUser(user)) return;

    setConfirm({
      message: `Delete ${user.name}?`,
      action: () => {
        deleteUsers([user.id]);
        setSelected((previous) => previous.filter((id) => id !== user.id));
        setConfirm(null);
      },
    });
  }

  function handleToggleStatus(user: ExtendedUser) {
    if (!canManageUser(user)) return;

    updateUser(user.id, {
      status: user.status === "Active" ? "Disabled" : "Active",
    });
  }

  function handleToggleLock(user: ExtendedUser) {
    if (!canManageUser(user)) return;

    updateUser(user.id, {
      locked: !user.locked,
    } as Partial<AppUser> & { locked: boolean });
  }

  function handleChangeRole(user: ExtendedUser) {
    if (!canChangeRole(user)) return;

    updateUser(user.id, {
      role: user.role === "Admin User" ? "Test User" : "Admin User",
    });
  }

  function handleResetPassword() {
  if (!resetModalUser) return;

  if (!newPassword.trim()) {
    setResetPasswordError("Password required");
    return;
  }

  if (newPassword.length < 6) {
    setResetPasswordError(
      "Password must be minimum 6 characters"
    );
    return;
  }

  updateUser(resetModalUser.id, {
    password: newPassword,
  });

  showToast("Password reset successful", "success");

  setResetModalUser(null);
  setNewPassword("");
  setResetPasswordError("");
}

function handleGenerateAdminUsers() {
  createRandomUsers(
    bulkCount,
    "Admin User"
  );

  showToast(
    `${bulkCount} admin users generated`,
    "success"
  );

  setGenerateUserModal(false);
}

function handleGenerateTestUsers() {
  createRandomUsers(
    bulkCount,
    "Test User"
  );

  showToast(
    `${bulkCount} test users generated`,
    "success"
  );

  setGenerateUserModal(false);
}

  function renderRoleBadge(user: ExtendedUser) {
    if (isSuperUser(user)) {
      return (
        <span className="pill role-pill super" data-testid={`user-management-super-user-badge-${testIdSlug(user.id)}`}>
          Super User
        </span>
      );
    }

    if (user.role === "Admin User") {
      return <span className="pill role-pill admin" data-testid={`user-management-admin-user-role-badge-${testIdSlug(user.id || "admin-user")}`}>Admin User</span>;
    }

    return <span className="pill role-pill test-user" data-testid={`user-management-test-user-role-badge-${testIdSlug(user.id || "test-user")}`}>Test User</span>;
  }

  return (
    <section data-testid="user-management-page">
      <div className="between user-management-header">
        <h1>User Management</h1>
      </div>

      <section className="card advanced-filters-card" data-testid="user-management-advanced-filters-card">
        <h2>Advanced Filters</h2>

        <div className="advanced-filter-grid">
          <div className="filter-panel" data-testid="user-management-search-mode-card">
            <label className="filter-title">Search Mode</label>

            <div className="vertical-options">
              <label>
                <input
                  data-testid="user-management-search-mode-exact-radio"
                  type="radio"
                  name="searchMode"
                  checked={searchMode === "exact"}
                  onChange={() => {
                    setSearchMode("exact");
                    setPage(1);
                  }}
                />
                Exact Match
              </label>

              <label>
                <input
                  data-testid="user-management-search-mode-partial-radio"
                  type="radio"
                  name="searchMode"
                  checked={searchMode === "partial"}
                  onChange={() => {
                    setSearchMode("partial");
                    setPage(1);
                  }}
                />
                Partial Match
              </label>

              <label>
                <input
                  data-testid="user-management-search-mode-starts-radio"
                  type="radio"
                  name="searchMode"
                  checked={searchMode === "starts"}
                  onChange={() => {
                    setSearchMode("starts");
                    setPage(1);
                  }}
                />
                Starts With
              </label>
            </div>

            <input
              className="compact-search-input"
              data-testid="user-management-search-input" aria-label="Search users"
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="filter-panel" data-testid="user-management-filters-card">
            <label className="filter-title">User Filters</label>

            <div className="vertical-options">
              <label>
                <input
                  data-testid="user-management-active-only-filter-checkbox"
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(event) => {
                    setShowActiveOnly(event.target.checked);
                    setPage(1);
                  }}
                />
                Show Active Only
              </label>

              <label>
                <input
                  data-testid="user-management-recently-created-filter-checkbox"
                  type="checkbox"
                  checked={recentlyCreated}
                  onChange={(event) => {
                    setRecentlyCreated(event.target.checked);
                    setPage(1);
                  }}
                />
                Recently Created
              </label>

              <label>
                <input
                  data-testid="user-management-never-logged-in-filter-checkbox"
                  type="checkbox"
                  checked={neverLoggedIn}
                  onChange={(event) => {
                    setNeverLoggedIn(event.target.checked);
                    setPage(1);
                  }}
                />
                Never Logged In
              </label>

              <label>
                <input
                  data-testid="user-management-locked-users-filter-checkbox"
                  type="checkbox"
                  checked={lockedUsers}
                  onChange={(event) => {
                    setLockedUsers(event.target.checked);
                    setPage(1);
                  }}
                />
                Locked Users
              </label>
            </div>
          </div>
        </div>
      </section>

      <div className="action-row" data-testid="user-management-action-row">
        <button data-testid="user-management-create-user-button" aria-label="Create user" onClick={openCreate}>
          Create New User
        </button>

        <button
          data-testid="reset-seed-data-btn"
          aria-label="Reset Seed Data"
          onClick={() => {
            localStorage.removeItem("automation-users");
            window.location.reload();
          }}
        >
          Reset Seed Data / Restore Default Users
        </button>

        <button
          data-testid="user-management-bulk-delete-button"
          disabled={getAllowedSelectedUsers().length < 2}
          onClick={handleBulkDelete}
        >
          Bulk Delete
        </button>

        <button
          data-testid="user-management-bulk-enable-button"
          disabled={getAllowedSelectedUsers().length < 2}
          onClick={() => handleBulkStatus("Active" as UserStatus)}
        >
          Bulk Enable
        </button>

        <button
          data-testid="user-management-bulk-disable-button"
          disabled={getAllowedSelectedUsers().length < 2}
          onClick={() => handleBulkStatus("Disabled" as UserStatus)}
        >
          Bulk Disable
        </button>
        
        <div className="generate-users-control" data-testid="user-management-generate-users-control">
          <span>Generate Multiple Random Users:</span>
          <input
            data-testid="user-management-random-user-count-input"
            type="number"
            min="1"
            max="50"
            value={bulkCount}
            onChange={(event) => setBulkCount(Math.max(1, Number(event.target.value)))}
          />
          <button
  data-testid="user-management-generate-random-users-button"
  onClick={() => setGenerateUserModal(true)}
>
  Generate
</button>
        </div>

        
      </div>

      <div className="table-wrap">
        <table data-testid="user-management-users-table">
          <thead>
            <tr>
              <th>
                <input
                  data-testid="user-management-select-all-users-checkbox"
                  type="checkbox"
                  checked={
                    selectablePageUsers.length > 0 &&
                    selectablePageUsers.every((user) => selected.includes(user.id))
                  }
                  disabled={!selectablePageUsers.length}
                  onChange={allSelected}
                />
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  data-testid="user-management-sort-user-id-header"
                  onClick={() => toggleSort("id")}
                >
                  User ID {sortLabel("id")}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  data-testid="user-management-sort-name-header"
                  onClick={() => toggleSort("name")}
                >
                  Name {sortLabel("name")}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  data-testid="user-management-sort-email-header"
                  onClick={() => toggleSort("email")}
                >
                  Email {sortLabel("email")}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  data-testid="user-management-sort-role-header"
                  onClick={() => toggleSort("role")}
                >
                  Role {sortLabel("role")}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  data-testid="user-management-sort-status-header"
                  onClick={() => toggleSort("status")}
                >
                  Status {sortLabel("status")}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  data-testid="user-management-sort-created-date-header"
                  onClick={() => toggleSort("createdDate")}
                >
                  Created Date {sortLabel("createdDate")}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sortable-header"
                  data-testid="user-management-sort-last-login-header"
                  onClick={() => toggleSort("lastLogin")}
                >
                  Last Login {sortLabel("lastLogin")}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageUsers.length === 0 ? (
              <tr data-testid="user-management-empty-users-row">
                <td colSpan={9}>No users found</td>
              </tr>
            ) : (
              pageUsers.map((user) => (
                <tr key={user.id} data-testid={`user-management-user-row-${testIdSlug(user.id)}`} className={ loggedInUser?.id === user.id ? "logged-in-user-row" : ""} >
                  <td>
                    {canSelectUser(user) ? (
                      <input
                        data-testid={`user-management-select-user-checkbox-${testIdSlug(user.id)}`}
                        type="checkbox"
                        checked={selected.includes(user.id)}
                        onChange={() => toggleSelected(user.id)}
                      />
                    ) : null}
                  </td>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{renderRoleBadge(user)}</td>
                  <td>
                    <span className={`pill ${user.status}`} data-testid={`user-management-status-badge-${testIdSlug(user.id)}-${testIdSlug(user.status)}`}>{user.status}</span>
                    {user.locked && (
                      <span className="pill locked-pill" data-testid={`user-management-locked-badge-${testIdSlug(user.id)}`}>
                        Locked
                      </span>
                    )}
                  </td>
                  <td>{user.createdDate}</td>
                  <td>{user.lastLogin}</td>
                  <td className="row-actions">
                    {isSuperUser(user) ? (
                      <span
                        className="protected-admin"
                        data-testid={`user-management-protected-super-user-badge-${testIdSlug(user.id)}`}
                      >
                        Protected Super User
                      </span>
                    ) : loggedInUser?.id === user.id ? (
                      <>
                        <button
                          data-testid={`user-management-edit-button-${testIdSlug(user.id)}`}
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </button>

                        <button
                          data-testid={`user-management-reset-password-button-${testIdSlug(user.id)}`}
                          onClick={() => {
                            setResetModalUser(user);
                            setNewPassword("");
                            setResetPasswordError("");
                          }}
                        >
                          Reset
                        </button>
                      </>
                    ) : canManageUser(user) ? (
                      <>
                        <button
                          data-testid={`user-management-edit-button-${testIdSlug(user.id)}`}
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </button>

                        {canDeleteUser(user) && (
                          <button
                            data-testid={`user-management-delete-button-${testIdSlug(user.id)}`}
                            onClick={() => handleDelete(user)}
                          >
                            Delete
                          </button>
                        )}

                        <button
                          data-testid={`user-management-${user.status === "Active" ? "disable" : "enable"}-button-${testIdSlug(user.id)}`}
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === "Active" ? "Disable" : "Enable"}
                        </button>

                        <button
                          data-testid={`user-management-${user.locked ? "unlock" : "lock"}-button-${testIdSlug(user.id)}`}
                          onClick={() => handleToggleLock(user)}
                        >
                          {user.locked ? "Unlock" : "Lock"}
                        </button>

                        {canChangeRole(user) && (
                          <button
                            data-testid={`user-management-change-role-button-${testIdSlug(user.id)}`}
                            onClick={() => handleChangeRole(user)}
                          >
                            Change Role
                          </button>
                        )}

                        <button
                          data-testid={`user-management-reset-password-button-${testIdSlug(user.id)}`}
                          onClick={() => {
                            setResetModalUser(user);
                            setNewPassword("");
                            setResetPasswordError("");
                          }}
                        >
                          Reset
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination" data-testid="user-management-pagination">
        <div className="page-size-box">
          <span>Show</span>
          <select
            data-testid="user-management-page-size-dropdown"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5 users</option>
            <option value={10}>10 users</option>
            <option value={20}>20 users</option>
            <option value={30}>30 users</option>
            <option value={40}>40 users</option>
            <option value={50}>50 users</option>
          </select>
        </div>

        <div className="pagination-controls">
  <div
    className="pagination-user-count"
    data-testid="user-management-total-users-info"
  >
    <strong>Total Users:</strong> {filtered.length}
    {" | "}
    <strong>Showing:</strong> {pageUsers.length} users
  </div>

  <button
    data-testid="user-management-previous-page-button"
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
  >
    Previous
  </button>

  <span data-testid="user-management-page-number">
    Page {page} of {totalPages}
  </span>

  <button
    data-testid="user-management-next-page-button"
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
  >
    Next
  </button>
</div>

      </div>

      {modal && (
        <div className="modal-backdrop" data-testid={modal === "create" ? "create-user-modal" : "edit-user-modal"}>
          <form className="modal" data-testid={modal === "create" ? "create-user-form" : "edit-user-form"} onSubmit={save}>
            <h2>{modal === "create" ? "Create User" : "Edit User"}</h2>

            {error && (
              <div className="error" data-testid={modal === "create" ? "create-user-error-alert" : "edit-user-error-alert"}>
                {error}
              </div>
            )}

            <label>Name</label>
            <input
              data-testid={modal === "create" ? "create-user-name-input" : "edit-user-name-input"}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />

            <label>Email</label>
            <input
              data-testid={modal === "create" ? "create-user-email-input" : "edit-user-email-input"}
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />

            {modal === "create" && (
              <>
                <label>Password</label>

                <input
                  data-testid="create-user-password-input"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      password: event.target.value,
                    })
                  }
                />
              </>
            )}

            <label>Role</label>
            <select
              data-testid={modal === "create" ? "create-user-role-dropdown" : "edit-user-role-dropdown"}
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value as Role })
              }
            >
              {loggedInIsSuperUser && <option>Super User</option>}
              <option>Admin User</option>
              <option>Test User</option>
            </select>

            <label>Status</label>
            <select
              data-testid={modal === "create" ? "create-user-status-dropdown" : "edit-user-status-dropdown"}
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as UserStatus })
              }
            >
              <option>Active</option>
              <option>Disabled</option>
            </select>

            <label>User Group</label>
            <select
              data-testid={modal === "create" ? "create-user-group-dropdown" : "edit-user-group-dropdown"}
              value={form.userGroup}
              onChange={(event) =>
                setForm({ ...form, userGroup: event.target.value })
              }
            >
              <option>Engineering</option>
              <option>Operations</option>
              <option>Management</option>
              <option>Support</option>
            </select>

            <div className="right">
              <button
                type="button"
                data-testid={modal === "create" ? "create-user-cancel-button" : "edit-user-cancel-button"}
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button data-testid={modal === "create" ? "create-user-save-button" : "edit-user-save-button"} type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {resetModalUser && (
  <div
    className="modal-backdrop"
    data-testid="reset-password-modal"
  >
    <div className="modal">
      <h2>Reset Password</h2>

      <p>
        Reset password for:
        <strong> {resetModalUser.name}</strong>
      </p>

      <label>New Password</label>

      <input
        type="password"
        value={newPassword}
        onChange={(event) => {
          setNewPassword(event.target.value);
          setResetPasswordError("");
        }}
        placeholder="Enter new password"
      />

      <small
        style={{
          display: "block",
          marginTop: "6px",
          color: "#666",
        }}
      >
        Recommended:
        minimum 8 characters with
        uppercase, lowercase, number,
        and special character.
      </small>

      {resetPasswordError && (
        <div className="error">
          {resetPasswordError}
        </div>
      )}

      <div className="right">
        <button
          onClick={() => {
            setResetModalUser(null);
            setNewPassword("");
            setResetPasswordError("");
          }}
        >
          Cancel
        </button>

        <button onClick={handleResetPassword}>
          Reset
        </button>
      </div>
    </div>
  </div>
)}

{generateUserModal && (
  <div
    className="modal-backdrop"
    data-testid="generate-user-type-modal"
  >
    <div className="modal">
      <h2>Generate Random Users</h2>

      <p>
        Select which type of users
        you want to generate.
      </p>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        <button
          data-testid="generate-admin-users-button"
          onClick={handleGenerateAdminUsers}
        >
          Generate Admin Users
        </button>

        <button
          data-testid="generate-test-users-button"
          onClick={handleGenerateTestUsers}
        >
          Generate Test Users
        </button>
      </div>

      <div
  style={{
    marginTop: "24px",
    display: "flex",
    justifyContent: "center",
  }}
>
  <button
    onClick={() =>
      setGenerateUserModal(false)
    }
    style={{
      background: "#dc2626",
      borderColor: "#dc2626",
      color: "white",
    }}
  >
    Cancel
  </button>
</div>
    </div>
  </div>
)}

      {confirm && (
        <div className="modal-backdrop" data-testid="delete-confirmation-modal">
          <div className="modal">
            <h2>Confirm Action</h2>
            <p data-testid="delete-confirmation-message">{confirm.message}</p>

            <div className="right">
              <button
                data-testid="delete-confirmation-cancel-button"
                onClick={() => setConfirm(null)}
              >
                Cancel
              </button>
              <button
                data-testid="delete-confirmation-confirm-button"
                onClick={confirm.action}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
