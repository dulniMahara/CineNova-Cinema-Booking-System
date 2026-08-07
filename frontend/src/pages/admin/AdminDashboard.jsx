import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../../components/PageLayout';
import {
  FiLayout,
  FiFilm,
  FiCalendar,
  FiTv,
  FiUsers,
  FiBookmark,
  FiCreditCard,
  FiRefreshCw,
  FiPlusCircle,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiBarChart2,
  FiUser
} from 'react-icons/fi';
import './AdminDashboard.css';

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatShortDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/dashboard?t=${new Date().getTime()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data && res.data.success) {
        setData(res.data);
      } else {
        throw new Error(res.data?.message || 'Invalid server response');
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      setError(err.response?.data?.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const maxWeeklyRevenue = data?.weeklyData
    ? Math.max(...data.weeklyData.map((d) => d.revenue), 1000)
    : 1000;

  const maxWeeklyBookings = data?.weeklyData
    ? Math.max(...data.weeklyData.map((d) => d.bookings), 5)
    : 5;

  return (
    <PageLayout isAdmin={true}>
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-container">

          {/* 1. Dashboard Header */}
          <div className="dashboard-header-section">
            <div className="header-title-block">
              <div className="admin-header-badge">
                <FiLayout />
              </div>
              <div>
                <h1 className="admin-main-title">Admin Dashboard</h1>
                <p className="admin-subtitle">
                  Monitor CineNova operations, bookings, revenue, and upcoming screenings.
                </p>
              </div>
            </div>

            <div className="header-actions-group">
              <button
                className="btn-header-action secondary"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing || loading}
                title="Refresh Dashboard Data"
              >
                <FiRefreshCw className={refreshing ? 'spin-icon' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh Dashboard'}
              </button>
            </div>
          </div>

          {/* 2. Main Summary Cards (6 Cards Grid) */}
          {loading ? (
            <div className="summary-cards-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="summary-card skeleton-card">
                  <div className="skeleton-icon" />
                  <div className="skeleton-text-group">
                    <div className="skeleton-line sm" />
                    <div className="skeleton-line lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="dashboard-error-card">
              <FiAlertCircle className="error-icon" />
              <h3>Unable to load dashboard data</h3>
              <p>{error}</p>
              <button className="btn-retry" onClick={() => fetchDashboardData()}>
                <FiRefreshCw /> Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="summary-cards-grid">
                <div className="summary-card">
                  <div className="card-icon-box emerald">
                    <FiFilm />
                  </div>
                  <div className="card-info">
                    <span className="card-label">Total Movies</span>
                    <span className="card-value">{data.summary?.totalMovies || 0}</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon-box blue">
                    <FiCalendar />
                  </div>
                  <div className="card-info">
                    <span className="card-label">Upcoming Showtimes</span>
                    <span className="card-value">{data.summary?.upcomingShowtimes || 0}</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon-box gold">
                    <FiTv />
                  </div>
                  <div className="card-info">
                    <span className="card-label">Total Halls</span>
                    <span className="card-value">{data.summary?.totalHalls || 0}</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon-box emerald">
                    <FiUsers />
                  </div>
                  <div className="card-info">
                    <span className="card-label">Registered Customers</span>
                    <span className="card-value">{data.summary?.totalCustomers || 0}</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon-box blue">
                    <FiBookmark />
                  </div>
                  <div className="card-info">
                    <span className="card-label">Today's Bookings</span>
                    <span className="card-value">{data.summary?.todayBookings || 0}</span>
                  </div>
                </div>

                <div className="summary-card highlight-revenue">
                  <div className="card-icon-box emerald">
                    <FiCreditCard />
                  </div>
                  <div className="card-info">
                    <span className="card-label">Today's Revenue</span>
                    <span className="card-value">Rs. {(data.summary?.todayRevenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 3. Operational Alerts Section */}
              <div className="alerts-banner-card">
                <div className="banner-title-block">
                  <FiAlertCircle className="banner-icon" />
                  <h4>System Attention</h4>
                </div>
                <div className="banner-content">
                  {data.operationalAlerts && data.operationalAlerts.length > 0 ? (
                    <ul className="alerts-list">
                      {data.operationalAlerts.map((alert, idx) => (
                        <li key={idx} className={`alert-item ${alert.type}`}>
                          {alert.message}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="no-issues-text">
                      <FiCheckCircle className="check-icon" /> No operational issues detected. All screenings and transactions are running smoothly.
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Quick Actions Toolbar */}
              <div className="quick-actions-card">
                <h3 className="section-title"><FiPlusCircle /> Quick Actions</h3>
                <div className="quick-buttons-row">
                  <button
                    className="btn-quick primary-emerald"
                    onClick={() => navigate('/admin/movies/add')}
                  >
                    <FiPlusCircle /> Add New Movie
                  </button>
                  <button
                    className="btn-quick primary-emerald"
                    onClick={() => navigate('/admin/showtimes/add')}
                  >
                    <FiPlusCircle /> Add New Showtime
                  </button>
                  <button
                    className="btn-quick secondary-glass"
                    onClick={() => navigate('/admin/halls')}
                  >
                    <FiTv /> Manage Halls
                  </button>
                  <button
                    className="btn-quick secondary-glass"
                    onClick={() => navigate('/admin/bookings')}
                  >
                    <FiBookmark /> View Bookings
                  </button>
                  <button
                    className="btn-quick secondary-glass"
                    onClick={() => navigate('/payments')}
                  >
                    <FiCreditCard /> View Payments
                  </button>
                </div>
              </div>

              {/* 5. 7-Day Revenue & Booking Overview Charts */}
              {data.weeklyData && data.weeklyData.length > 0 && (
                <div className="charts-overview-grid">

                  {/* 7-Day Weekly Revenue Chart */}
                  <div className="chart-panel-card">
                    <div className="panel-header">
                      <div className="panel-title-block">
                        <FiBarChart2 className="panel-icon" />
                        <h3>7-Day Revenue Overview</h3>
                      </div>
                      <span className="panel-sub-tag">Completed Payments Only</span>
                    </div>

                    <div className="css-bar-chart">
                      {data.weeklyData.map((day, idx) => {
                        const heightPct = Math.round((day.revenue / maxWeeklyRevenue) * 100);
                        return (
                          <div key={idx} className="bar-column">
                            <span className="bar-val-tooltip">Rs. {day.revenue.toLocaleString()}</span>
                            <div className="bar-track">
                              <div
                                className="bar-fill emerald"
                                style={{ height: `${Math.max(heightPct, 6)}%` }}
                              />
                            </div>
                            <span className="bar-label">{day.dayLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7-Day Weekly Bookings Chart */}
                  <div className="chart-panel-card">
                    <div className="panel-header">
                      <div className="panel-title-block">
                        <FiBookmark className="panel-icon" />
                        <h3>7-Day Booking Overview</h3>
                      </div>
                      <span className="panel-sub-tag">Daily Ticket Bookings</span>
                    </div>

                    <div className="css-bar-chart">
                      {data.weeklyData.map((day, idx) => {
                        const heightPct = Math.round((day.bookings / maxWeeklyBookings) * 100);
                        return (
                          <div key={idx} className="bar-column">
                            <span className="bar-val-tooltip">{day.bookings} Bookings</span>
                            <div className="bar-track">
                              <div
                                className="bar-fill blue"
                                style={{ height: `${Math.max(heightPct, 6)}%` }}
                              />
                            </div>
                            <span className="bar-label">{day.dayLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* 6. Main 2-Column Content Grid (Recent Bookings + Upcoming Showtimes) */}
              <div className="dashboard-main-grid">

                {/* Left Column: Recent Bookings */}
                <div className="dashboard-panel-card">
                  <div className="panel-header">
                    <div className="panel-title-block">
                      <FiBookmark className="panel-icon" />
                      <h3>Recent Bookings</h3>
                    </div>
                    <button
                      className="btn-panel-action"
                      onClick={() => navigate('/admin/bookings')}
                    >
                      View All Bookings <FiArrowRight />
                    </button>
                  </div>

                  {data.recentBookings && data.recentBookings.length > 0 ? (
                    <div className="compact-table-wrapper">
                      <table className="compact-dashboard-table">
                        <thead>
                          <tr>
                            <th>Ref</th>
                            <th>Customer</th>
                            <th>Movie</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.recentBookings.map((b) => (
                            <tr key={b._id}>
                              <td>
                                <span className="ref-chip">{b.bookingReference}</span>
                              </td>
                              <td>
                                <div className="cell-user">
                                  <span className="name">{b.customerName}</span>
                                  <span className="email">{b.customerEmail}</span>
                                </div>
                              </td>
                              <td>
                                <span className="movie-title-text">{b.movieTitle}</span>
                              </td>
                              <td>
                                <span className="amount-text">Rs. {(b.amount || 0).toLocaleString()}</span>
                              </td>
                              <td>
                                <span className={`status-pill ${b.status.toLowerCase()}`}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="panel-empty-box">
                      <FiBookmark className="empty-icon" />
                      <h4>No recent bookings</h4>
                      <p>Customer bookings will appear here.</p>
                    </div>
                  )}
                </div>

                {/* Right Column: Upcoming Showtimes */}
                <div className="dashboard-panel-card">
                  <div className="panel-header">
                    <div className="panel-title-block">
                      <FiCalendar className="panel-icon" />
                      <h3>Upcoming Showtimes</h3>
                    </div>
                    <button
                      className="btn-panel-action"
                      onClick={() => navigate('/admin/showtimes')}
                    >
                      View All Showtimes <FiArrowRight />
                    </button>
                  </div>

                  {data.upcomingShowtimes && data.upcomingShowtimes.length > 0 ? (
                    <div className="showtimes-list-block">
                      {data.upcomingShowtimes.map((s) => (
                        <div key={s._id} className="upcoming-showtime-item">
                          <div className="showtime-movie-left">
                            {s.moviePoster ? (
                              <img src={s.moviePoster} alt={s.movieTitle} className="mini-poster" />
                            ) : (
                              <div className="mini-poster-placeholder"><FiFilm /></div>
                            )}
                            <div className="showtime-details">
                              <h4 className="movie-title">{s.movieTitle}</h4>
                              <span className="hall-sub">{s.hallName}</span>
                            </div>
                          </div>

                          <div className="showtime-schedule-right">
                            <div className="date-time-box">
                              <span className="date-text">{formatShortDate(s.date)}</span>
                              <span className="time-pill"><FiClock /> {s.startTime}</span>
                            </div>
                            <span className="price-tag">Rs. {s.ticketPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="panel-empty-box">
                      <FiCalendar className="empty-icon" />
                      <h4>No upcoming showtimes</h4>
                      <p>Create a showtime to begin scheduling screenings.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* 7. Secondary 2-Column Grid (Payment Status Summary + Recent Customers) */}
              <div className="dashboard-secondary-grid">

                {/* Payment Status Summary */}
                <div className="dashboard-panel-card">
                  <div className="panel-header">
                    <div className="panel-title-block">
                      <FiCreditCard className="panel-icon" />
                      <h3>Payment Status Overview</h3>
                    </div>
                    <button
                      className="btn-panel-action"
                      onClick={() => navigate('/payments')}
                    >
                      View Payments <FiArrowRight />
                    </button>
                  </div>

                  <div className="payment-status-rows">
                    <div className="status-count-row completed">
                      <div className="status-label-group">
                        <FiCheckCircle className="icon" />
                        <span>Completed Payments</span>
                      </div>
                      <span className="count-num">{data.paymentStatusSummary?.Completed || 0}</span>
                    </div>

                    <div className="status-count-row pending">
                      <div className="status-label-group">
                        <FiClock className="icon" />
                        <span>Pending Payments</span>
                      </div>
                      <span className="count-num">{data.paymentStatusSummary?.Pending || 0}</span>
                    </div>

                    <div className="status-count-row failed">
                      <div className="status-label-group">
                        <FiXCircle className="icon" />
                        <span>Failed Payments</span>
                      </div>
                      <span className="count-num">{data.paymentStatusSummary?.Failed || 0}</span>
                    </div>

                    <div className="status-count-row refunded">
                      <div className="status-label-group">
                        <FiRefreshCw className="icon" />
                        <span>Refunded / Cancelled</span>
                      </div>
                      <span className="count-num">
                        {(data.paymentStatusSummary?.Refunded || 0) + (data.paymentStatusSummary?.Cancelled || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recently Registered Customers */}
                <div className="dashboard-panel-card">
                  <div className="panel-header">
                    <div className="panel-title-block">
                      <FiUser className="panel-icon" />
                      <h3>Recently Registered Customers</h3>
                    </div>
                    <button
                      className="btn-panel-action"
                      onClick={() => navigate('/admin/users')}
                    >
                      View Users <FiArrowRight />
                    </button>
                  </div>

                  {data.recentCustomers && data.recentCustomers.length > 0 ? (
                    <div className="recent-customers-list">
                      {data.recentCustomers.map((u) => (
                        <div key={u._id} className="customer-item-row">
                          <div className="cust-avatar">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="cust-info">
                            <span className="cust-name">{u.name || 'Customer'}</span>
                            <span className="cust-email">{u.email}</span>
                          </div>
                          <span className="joined-date">{formatDate(u.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="panel-empty-box">
                      <FiUsers className="empty-icon" />
                      <h4>No customer records</h4>
                      <p>Registered customers will appear here.</p>
                    </div>
                  )}
                </div>

              </div>

            </>
          )}

        </div>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
