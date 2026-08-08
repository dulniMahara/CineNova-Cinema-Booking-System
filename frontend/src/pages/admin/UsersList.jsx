import React, { useState, useEffect, useMemo } from 'react';
import {
  FiUsers,
  FiUserCheck,
  FiShield,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiMail,
  FiClock
} from 'react-icons/fi';
import API from '../../services/api';
import './UsersList.css';

const getInitials = (name = "") => {
  if (!name || typeof name !== 'string') return "CN";
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "CN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination & Modal states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/auth/users');
      const data = response.data?.users || response.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || 'Unable to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setSortBy("newest");
  };

  // Compute Summary Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const customers = users.filter(u => u.role !== 'admin').length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = users.filter(u => u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo).length;

    return { total, admins, customers, recent };
  }, [users]);

  // Filter & Sort Users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
      if (sortBy === "oldest") return new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id);
      if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name-desc") return (b.name || "").localeCompare(a.name || "");
      return 0;
    });

    return result;
  }, [users, searchTerm, roleFilter, sortBy]);

  // Pagination Math
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  return (
    <div className="admin-usersmanager-dashboard">
      <div className="admin-usersmanager-container">

        {/* 1. Header Section */}
        <div className="admin-header-section">
          <div className="header-title-block">
            <div className="admin-header-badge">
              <FiShield />
            </div>
            <div>
              <h1 className="admin-main-title">User Management</h1>
              <p className="admin-subtitle">
                Manage registered CineNova customers and administrators.
              </p>
            </div>
          </div>

          <div className="total-users-header-text">
            Total Users: <span className="total-users-num">{metrics.total}</span>
          </div>
        </div>

        {/* 2. Metric Overview Cards */}
        {!loading && !error && (
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-icon emerald"><FiUsers /></div>
              <div className="metric-data">
                <span className="metric-title">Total Users</span>
                <span className="metric-num">{metrics.total}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon blue"><FiUserCheck /></div>
              <div className="metric-data">
                <span className="metric-title">Customers</span>
                <span className="metric-num">{metrics.customers}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon shield"><FiShield /></div>
              <div className="metric-data">
                <span className="metric-title">Administrators</span>
                <span className="metric-num">{metrics.admins}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon calendar"><FiClock /></div>
              <div className="metric-data">
                <span className="metric-title">Recently Joined</span>
                <span className="metric-num">{metrics.recent}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Search and Filter Toolbar */}
        {!loading && !error && (
          <div className="admin-toolbar-card">
            <div className="search-input-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="toolbar-search-input"
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                  <FiX />
                </button>
              )}
            </div>

            <div className="toolbar-selects-group">
              <div className="select-wrapper">
                <FiFilter className="select-icon" />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div className="select-wrapper">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name A–Z</option>
                  <option value="name-desc">Name Z–A</option>
                </select>
              </div>

              {(searchTerm || roleFilter !== "all" || sortBy !== "newest") && (
                <button className="btn-clear-filters" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Table / Content View */}
        {loading ? (
          <div className="admin-table-glass-wrapper">
            <div className="skeleton-loading-table">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton-table-row">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-text-block">
                    <div className="skeleton-line title" />
                    <div className="skeleton-line text" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="admin-error-card">
            <FiAlertCircle className="error-icon" />
            <h3>Unable to load users</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchUsers}>
              <FiRefreshCw /> Try Again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty-card">
            <div className="empty-icon-box"><FiUsers /></div>
            <h3>
              {searchTerm || roleFilter !== "all"
                ? "No users match the selected filters."
                : "No registered users."}
            </h3>
            <p>
              {searchTerm || roleFilter !== "all"
                ? "Try adjusting your search terms or clear filters."
                : "New CineNova accounts will appear here."}
            </p>
            {(searchTerm || roleFilter !== "all") && (
              <button className="btn-clear-filters-large" onClick={handleClearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-glass-wrapper desktop-only">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user._id}>
                      {/* User */}
                      <td>
                        <div className="table-user-cell">
                          <div className="user-initials-avatar">
                            {getInitials(user.name)}
                          </div>
                          <span className="user-name-text">{user.name || "CineNova User"}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <div className="email-cell" title={user.email}>
                          <FiMail className="cell-icon" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                          {user.role === 'admin' ? <FiShield /> : <FiUserCheck />}
                          {user.role === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td>
                        <span className="date-text">
                          <FiCalendar className="cell-icon" /> {formatDate(user.createdAt)}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-badge ${user.isEmailVerified ? 'verified' : 'pending'}`}>
                          {user.isEmailVerified ? <FiCheck /> : <FiClock />}
                          {user.isEmailVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <button
                          type="button"
                          className="user-view-link"
                          onClick={() => setSelectedUser(user)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-only admin-users-cards-list">
              {paginatedUsers.map((user) => (
                <div key={user._id} className="mobile-admin-user-card">
                  <div className="mobile-card-header">
                    <div className="user-initials-avatar">
                      {getInitials(user.name)}
                    </div>
                    <div className="mobile-user-title-block">
                      <h3 className="user-name-text">{user.name}</h3>
                      <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                        {user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-user-details">
                    <div className="detail-row">
                      <FiMail /> <span>{user.email}</span>
                    </div>
                    <div className="detail-row">
                      <FiCalendar /> <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                    <div className="detail-row">
                      <span className={`status-badge ${user.isEmailVerified ? 'verified' : 'pending'}`}>
                        {user.isEmailVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-card-actions">
                    <button type="button" className="user-view-link" onClick={() => setSelectedUser(user)}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination-bar">
                <span className="pagination-count-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </span>

                <div className="pagination-buttons">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft /> Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-num ${page === currentPage ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="custom-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="custom-modal-card user-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedUser(null)}>
              <FiX />
            </button>

            <div className="modal-user-avatar-large">
              {getInitials(selectedUser.name)}
            </div>

            <h3 className="modal-user-name">{selectedUser.name}</h3>
            <span className={`role-badge ${selectedUser.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
              {selectedUser.role === 'admin' ? 'Administrator' : 'Customer Account'}
            </span>

            <div className="modal-info-grid">
              <div className="info-item">
                <span className="info-label">Email Address</span>
                <span className="info-value">{selectedUser.email}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Account Joined</span>
                <span className="info-value">{formatDate(selectedUser.createdAt)}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Verification Status</span>
                <span className="info-value">
                  {selectedUser.isEmailVerified ? "Verified" : "Pending Verification"}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">User Reference ID</span>
                <span className="info-value monospace">{selectedUser._id}</span>
              </div>
            </div>

            <div className="modal-footer-row">
              <button className="btn-modal-close" onClick={() => setSelectedUser(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersList;
