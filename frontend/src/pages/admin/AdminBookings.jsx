import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiBookmark,
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiFilter,
  FiEye,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiFilm,
  FiUser,
  FiGrid,
  FiCheck
} from 'react-icons/fi';
import API from '../../services/api';
import './AdminBookings.css';

const getBookingRef = (booking) => {
  if (!booking) return "N/A";
  if (booking.bookingReference) return booking.bookingReference;
  if (booking._id) return `#${booking._id.slice(-6).toUpperCase()}`;
  return "N/A";
};

const getSeatsList = (booking) => {
  if (!booking) return [];
  if (booking.seatDetails && Array.isArray(booking.seatDetails) && booking.seatDetails.length > 0) {
    return booking.seatDetails.map((s) => `${s.row}${s.number}`);
  }
  if (booking.seatIds && Array.isArray(booking.seatIds) && booking.seatIds.length > 0) {
    const formatted = booking.seatIds
      .map((s) => (s && typeof s === 'object' && s.row && s.number ? `${s.row}${s.number}` : null))
      .filter(Boolean);
    if (formatted.length > 0) return formatted;
  }
  return [];
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
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
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Pagination & Modals
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [toastNotice, setToastNotice] = useState(null);

  const fetchAllBookings = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const response = await API.get('/bookings/all');
      const bookingsData = Array.isArray(response.data) ? response.data : response.data.bookings || [];
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please sign in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to access booking management.');
      } else {
        setError('Unable to load bookings. Please try again.');
      }
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllBookings();
  }, [fetchAllBookings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDate]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterDate('');
  };

  // Compute Dynamic Metrics
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Completed').length;
    const cancelled = bookings.filter((b) => b.status === 'Cancelled').length;
    const totalRevenue = bookings
      .filter((b) => b.status === 'Confirmed' || b.status === 'Completed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const todayStr = new Date().toDateString();
    const todayBookings = bookings.filter(
      (b) => b.createdAt && new Date(b.createdAt).toDateString() === todayStr
    ).length;

    return { total, confirmed, cancelled, totalRevenue, todayBookings };
  }, [bookings]);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((b) => {
        const ref = getBookingRef(b).toLowerCase();
        const userName = (b.userId?.name || '').toLowerCase();
        const userEmail = (b.userId?.email || '').toLowerCase();
        const movieTitle = (b.showtimeId?.movie?.title || '').toLowerCase();
        const hallName = (b.showtimeId?.hall?.name || '').toLowerCase();

        return (
          ref.includes(q) ||
          userName.includes(q) ||
          userEmail.includes(q) ||
          movieTitle.includes(q) ||
          hallName.includes(q)
        );
      });
    }

    if (filterStatus !== 'all') {
      result = result.filter((b) => b.status === filterStatus);
    }

    if (filterDate) {
      result = result.filter((b) => {
        if (!b.createdAt) return false;
        const bDate = new Date(b.createdAt).toISOString().split('T')[0];
        return bDate === filterDate;
      });
    }

    return result;
  }, [bookings, searchTerm, filterStatus, filterDate]);

  // Pagination Math
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      await API.delete(`/bookings/${bookingToCancel._id}`);
      setToastNotice(`Booking ${getBookingRef(bookingToCancel)} cancelled successfully.`);
      setBookingToCancel(null);
      if (selectedBooking && selectedBooking._id === bookingToCancel._id) {
        setSelectedBooking(null);
      }
      fetchAllBookings(true);
      setTimeout(() => setToastNotice(null), 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please sign in again.');
      } else if (err.response?.status === 403) {
        alert('You do not have permission to cancel this booking.');
      } else {
        alert(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
      }
    } finally {
      setCancelling(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Booking Ref',
      'Customer Name',
      'Customer Email',
      'Movie Title',
      'Hall',
      'Showtime Date',
      'Showtime Time',
      'Seats',
      'Amount (Rs)',
      'Status',
      'Booked Date'
    ];

    const rows = filteredBookings.map((b) => {
      const seats = getSeatsList(b).join('; ') || (b.seatIds ? `${b.seatIds.length} seat(s)` : 'N/A');
      return [
        `"${getBookingRef(b)}"`,
        `"${b.userId?.name || 'Customer'}"`,
        `"${b.userId?.email || 'N/A'}"`,
        `"${b.showtimeId?.movie?.title || 'N/A'}"`,
        `"${b.showtimeId?.hall?.name || 'N/A'}"`,
        `"${b.showtimeId?.date ? new Date(b.showtimeId.date).toLocaleDateString() : 'N/A'}"`,
        `"${b.showtimeId?.startTime || b.showtimeId?.time || 'N/A'}"`,
        `"${seats}"`,
        `"${b.totalPrice || 0}"`,
        `"${b.status || 'N/A'}"`,
        `"${b.createdAt ? new Date(b.createdAt).toLocaleString() : 'N/A'}"`
      ];
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const todayStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `cinenova-bookings-${todayStr}.csv`;
    a.click();
  };

  return (
    <div className="admin-bookings-dashboard">
      <div className="admin-bookings-container">

        {/* 1. Header Section */}
        <div className="admin-header-section">
          <div className="header-title-block">
            <div className="admin-header-badge">
              <FiBookmark />
            </div>
            <div>
              <h1 className="admin-main-title">Booking Management</h1>
              <p className="admin-subtitle">
                Review, filter, export, and manage CineNova customer bookings.
              </p>
            </div>
          </div>

          <div className="header-actions-group">
            <button
              className="btn-header-action secondary"
              onClick={() => fetchAllBookings(true)}
              disabled={refreshing || loading}
              title="Refresh Bookings"
            >
              <FiRefreshCw className={refreshing ? 'spin-icon' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              className="btn-header-action primary-emerald"
              onClick={exportToCSV}
              disabled={loading || filteredBookings.length === 0}
              title="Export Bookings to CSV"
            >
              <FiDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* 2. Overview Metrics Cards */}
        {!loading && !error && (
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-icon emerald"><FiBookmark /></div>
              <div className="metric-data">
                <span className="metric-title">Total Bookings</span>
                <span className="metric-num">{stats.total}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon emerald"><FiCheckCircle /></div>
              <div className="metric-data">
                <span className="metric-title">Confirmed</span>
                <span className="metric-num">{stats.confirmed}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon red"><FiXCircle /></div>
              <div className="metric-data">
                <span className="metric-title">Cancelled</span>
                <span className="metric-num">{stats.cancelled}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon gold"><FiDollarSign /></div>
              <div className="metric-data">
                <span className="metric-title">Total Revenue</span>
                <span className="metric-num">Rs. {stats.totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon blue"><FiCalendar /></div>
              <div className="metric-data">
                <span className="metric-title">Today's Bookings</span>
                <span className="metric-num">{stats.todayBookings}</span>
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
                placeholder="Search by reference, customer name, email, or movie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="toolbar-search-input"
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                  <FiX />
                </button>
              )}
            </div>

            <div className="toolbar-selects-group">
              <div className="select-wrapper">
                <FiFilter className="select-icon" />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="date-input-wrapper">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="toolbar-date-input"
                  title="Filter by Booking Date"
                />
              </div>

              {(searchTerm || filterStatus !== 'all' || filterDate) && (
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
            <h3>Unable to load bookings</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => fetchAllBookings()}>
              <FiRefreshCw /> Try Again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="admin-empty-card">
            <div className="empty-icon-box"><FiBookmark /></div>
            <h3>
              {searchTerm || filterStatus !== 'all' || filterDate
                ? 'No bookings match the selected filters.'
                : 'No bookings found.'}
            </h3>
            <p>
              {searchTerm || filterStatus !== 'all' || filterDate
                ? 'Try adjusting your search query or clear filters.'
                : 'Customer bookings will appear here.'}
            </p>
            {(searchTerm || filterStatus !== 'all' || filterDate) && (
              <button className="btn-clear-filters-large" onClick={handleClearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-glass-wrapper desktop-only">
              <table className="admin-bookings-table">
                <thead>
                  <tr>
                    <th>Booking Ref</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Showtime</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Booked On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((b) => {
                    const seatList = getSeatsList(b);
                    const movieObj = b.showtimeId?.movie;
                    const posterUrl = movieObj?.posterImage || movieObj?.bannerImage || movieObj?.poster;

                    return (
                      <tr key={b._id}>
                        {/* Booking Ref */}
                        <td>
                          <span className="booking-ref-badge">
                            {getBookingRef(b)}
                          </span>
                        </td>

                        {/* Customer */}
                        <td>
                          <div className="customer-cell">
                            <span className="cust-name">{b.userId?.name || 'CineNova Customer'}</span>
                            <span className="cust-email">{b.userId?.email || 'N/A'}</span>
                          </div>
                        </td>

                        {/* Movie */}
                        <td>
                          <div className="movie-cell-block">
                            {posterUrl && (
                              <img
                                src={posterUrl}
                                alt={movieObj?.title}
                                className="movie-mini-thumb"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <div>
                              <span className="movie-title-text">{movieObj?.title || 'Movie Screening'}</span>
                              <span className="movie-hall-sub">{b.showtimeId?.hall?.name || 'Standard Screen'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Showtime */}
                        <td>
                          <div className="showtime-cell">
                            <span className="showtime-date">{formatShortDate(b.showtimeId?.date)}</span>
                            <span className="time-pill">
                              <FiClock /> {b.showtimeId?.startTime || b.showtimeId?.time || '7:30 PM'}
                            </span>
                          </div>
                        </td>

                        {/* Seats */}
                        <td>
                          <div className="seats-chips-group">
                            {seatList.length > 0 ? (
                              <>
                                {seatList.slice(0, 3).map((s, idx) => (
                                  <span key={idx} className="seat-chip">{s}</span>
                                ))}
                                {seatList.length > 3 && (
                                  <span className="seat-chip count">+{seatList.length - 3}</span>
                                )}
                              </>
                            ) : b.seatIds?.length > 0 ? (
                              <span className="seat-chip count">{b.seatIds.length} seat(s)</span>
                            ) : (
                              <span className="no-seats-text">N/A</span>
                            )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td>
                          <span className="amount-text">Rs. {(b.totalPrice || 0).toLocaleString()}</span>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`status-badge-pill ${b.status ? b.status.toLowerCase() : 'confirmed'}`}>
                            {b.status === 'Confirmed' && <FiCheckCircle />}
                            {b.status === 'Cancelled' && <FiXCircle />}
                            {b.status === 'Pending' && <FiClock />}
                            {b.status || 'Confirmed'}
                          </span>
                        </td>

                        {/* Booked On */}
                        <td>
                          <span className="booked-date-text">{formatDate(b.createdAt)}</span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="table-actions-row">
                            <button
                              className="btn-action-view"
                              onClick={() => setSelectedBooking(b)}
                              title="View Details"
                            >
                              <FiEye />
                            </button>

                            {b.status === 'Confirmed' && (
                              <button
                                className="btn-action-cancel"
                                onClick={() => setBookingToCancel(b)}
                                title="Cancel Booking"
                              >
                                <FiX />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-only admin-bookings-cards-list">
              {paginatedBookings.map((b) => {
                const seatList = getSeatsList(b);
                const movieObj = b.showtimeId?.movie;

                return (
                  <div key={b._id} className="mobile-admin-booking-card">
                    <div className="mobile-card-header">
                      <span className="booking-ref-badge">{getBookingRef(b)}</span>
                      <span className={`status-badge-pill ${b.status ? b.status.toLowerCase() : 'confirmed'}`}>
                        {b.status || 'Confirmed'}
                      </span>
                    </div>

                    <div className="mobile-user-movie-row">
                      <div>
                        <h4 className="movie-title-text">{movieObj?.title || 'Movie Screening'}</h4>
                        <span className="cust-name">{b.userId?.name || 'Customer'} • {b.userId?.email}</span>
                      </div>
                    </div>

                    <div className="mobile-booking-details">
                      <div className="detail-row">
                        <FiCalendar /> <span>{formatShortDate(b.showtimeId?.date)} at {b.showtimeId?.startTime || b.showtimeId?.time || '7:30 PM'}</span>
                      </div>
                      <div className="detail-row">
                        <FiGrid />
                        <div className="seats-chips-group">
                          {seatList.length > 0 ? (
                            seatList.map((s, idx) => <span key={idx} className="seat-chip">{s}</span>)
                          ) : (
                            <span>{b.seatIds?.length || 0} seat(s)</span>
                          )}
                        </div>
                      </div>
                      <div className="detail-row">
                        <span className="amount-text">Total: Rs. {(b.totalPrice || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mobile-card-actions">
                      <button className="btn-action-view" onClick={() => setSelectedBooking(b)}>
                        <FiEye /> Details
                      </button>
                      {b.status === 'Confirmed' && (
                        <button className="btn-action-cancel" onClick={() => setBookingToCancel(b)}>
                          <FiX /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination-bar">
                <span className="pagination-count-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                </span>

                <div className="pagination-buttons">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft /> Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-num ${page === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="custom-modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="custom-modal-card booking-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedBooking(null)}>
              <FiX />
            </button>

            <div className="modal-header-block">
              <span className="booking-ref-large">{getBookingRef(selectedBooking)}</span>
              <span className={`status-badge-pill ${selectedBooking.status ? selectedBooking.status.toLowerCase() : 'confirmed'}`}>
                {selectedBooking.status || 'Confirmed'}
              </span>
            </div>

            <div className="modal-body-sections">

              {/* Section 1: Customer */}
              <div className="modal-section-box">
                <h4 className="section-title"><FiUser /> Customer Information</h4>
                <div className="info-pair-row">
                  <span className="pair-label">Full Name</span>
                  <span className="pair-val">{selectedBooking.userId?.name || 'CineNova Customer'}</span>
                </div>
                <div className="info-pair-row">
                  <span className="pair-label">Email Address</span>
                  <span className="pair-val">{selectedBooking.userId?.email || 'N/A'}</span>
                </div>
              </div>

              {/* Section 2: Screening */}
              <div className="modal-section-box">
                <h4 className="section-title"><FiFilm /> Screening Details</h4>
                <div className="info-pair-row">
                  <span className="pair-label">Movie Title</span>
                  <span className="pair-val highlight">{selectedBooking.showtimeId?.movie?.title || 'Movie Screening'}</span>
                </div>
                <div className="info-pair-row">
                  <span className="pair-label">Cinema Hall</span>
                  <span className="pair-val">{selectedBooking.showtimeId?.hall?.name || 'Standard Screen'}</span>
                </div>
                <div className="info-pair-row">
                  <span className="pair-label">Date & Start Time</span>
                  <span className="pair-val">
                    {formatShortDate(selectedBooking.showtimeId?.date)} at {selectedBooking.showtimeId?.startTime || selectedBooking.showtimeId?.time || '7:30 PM'}
                  </span>
                </div>
              </div>

              {/* Section 3: Seats */}
              <div className="modal-section-box">
                <h4 className="section-title"><FiGrid /> Seating Information</h4>
                <div className="info-pair-row">
                  <span className="pair-label">Selected Seats</span>
                  <div className="seats-chips-group align-right">
                    {getSeatsList(selectedBooking).length > 0 ? (
                      getSeatsList(selectedBooking).map((s, idx) => <span key={idx} className="seat-chip">{s}</span>)
                    ) : (
                      <span className="pair-val">{selectedBooking.seatIds?.length || 0} seat(s)</span>
                    )}
                  </div>
                </div>
                <div className="info-pair-row">
                  <span className="pair-label">Ticket Quantity</span>
                  <span className="pair-val">{getSeatsList(selectedBooking).length || selectedBooking.seatIds?.length || 1} Ticket(s)</span>
                </div>
              </div>

              {/* Section 4: Payment */}
              <div className="modal-section-box">
                <h4 className="section-title"><FiDollarSign /> Payment & Reference</h4>
                <div className="info-pair-row">
                  <span className="pair-label">Total Amount Paid</span>
                  <span className="amount-val-large">Rs. {(selectedBooking.totalPrice || 0).toLocaleString()}</span>
                </div>
                <div className="info-pair-row">
                  <span className="pair-label">Booking Created Date</span>
                  <span className="pair-val">{formatDate(selectedBooking.createdAt)}</span>
                </div>
                <div className="info-pair-row">
                  <span className="pair-label">System Booking ID</span>
                  <span className="pair-val monospace">{selectedBooking._id}</span>
                </div>
              </div>

            </div>

            <div className="modal-footer-row">
              {selectedBooking.status === 'Confirmed' && (
                <button
                  className="btn-modal-cancel-action"
                  onClick={() => {
                    const target = selectedBooking;
                    setSelectedBooking(null);
                    setBookingToCancel(target);
                  }}
                >
                  Cancel Booking
                </button>
              )}
              <button className="btn-modal-close" onClick={() => setSelectedBooking(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {bookingToCancel && (
        <div className="custom-modal-backdrop" onClick={() => setBookingToCancel(null)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-warning-icon">
              <FiAlertCircle />
            </div>

            <h3 className="modal-title">Cancel Booking {getBookingRef(bookingToCancel)}?</h3>
            <p className="modal-desc">
              This action will cancel the customer's booking for <strong>{bookingToCancel.showtimeId?.movie?.title || 'this screening'}</strong> and release their selected seats.
            </p>

            <div className="modal-actions-row">
              <button
                className="btn-modal-cancel"
                onClick={() => setBookingToCancel(null)}
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                className="btn-modal-confirm-danger"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {toastNotice && (
        <div className="admin-toast-notice">
          <FiCheck /> {toastNotice}
        </div>
      )}

    </div>
  );
};

export default AdminBookings;
