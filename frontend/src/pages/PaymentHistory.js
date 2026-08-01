import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import {
  FiCreditCard,
  FiFilm,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiBookmark,
  FiPlus,
  FiX,
  FiTag,
  FiTrash2,
  FiCheck
} from 'react-icons/fi';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchMyPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/payments/my-payments?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setPayments(data);
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError(err.response?.data?.message || "Unable to load payment history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMyPayments();
  }, []);

  const handleClearHistory = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/payments/my-payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments([]);
      setShowClearModal(false);
      setToastMessage("Payment history cleared successfully.");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      alert("Failed to clear history. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Safe Formatters
  const formatDate = (dateString) => {
    if (!dateString) return "Unavailable";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Unavailable";
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Unavailable";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Unavailable";
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBookingRef = (payment) => {
    if (!payment.bookingId) return 'NO-REF';
    if (typeof payment.bookingId === 'object') {
      if (payment.bookingId.bookingReference) return payment.bookingId.bookingReference;
      if (payment.bookingId._id) return `CN-${payment.bookingId._id.slice(-6).toUpperCase()}`;
    }
    if (typeof payment.bookingId === 'string') {
      return `CN-${payment.bookingId.slice(-6).toUpperCase()}`;
    }
    return 'CN-PASS';
  };

  const getPosterUrl = (payment) => {
    const booking = payment.bookingId;
    if (typeof booking === 'object' && booking !== null) {
      const movie = booking.showtimeId?.movie || booking.movie || {};
      const url = movie.posterUrl || movie.poster || movie.bannerUrl;
      if (!url) return null;
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
      if (url.startsWith('/')) {
        const baseUrl = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : '';
        return `${baseUrl}${url}`;
      }
      return url;
    }
    return null;
  };

  const getMovieTitle = (payment) => {
    const booking = payment.bookingId;
    if (typeof booking === 'object' && booking !== null) {
      return booking.showtimeId?.movie?.title || booking.movie?.title || payment.movieTitle || "Unavailable";
    }
    return payment.movieTitle || "Unavailable";
  };

  const getHallName = (payment) => {
    const booking = payment.bookingId;
    if (typeof booking === 'object' && booking !== null) {
      return booking.showtimeId?.hall?.name || booking.hall?.name || "Unavailable";
    }
    return "Unavailable";
  };

  const getSeatsDisplay = (payment) => {
    const booking = payment.bookingId;
    if (typeof booking === 'object' && booking !== null) {
      if (Array.isArray(booking.seatIds) && booking.seatIds.length > 0) {
        if (typeof booking.seatIds[0] === 'object' && booking.seatIds[0].row) {
          return booking.seatIds.map(s => `${s.row}${s.number}`).join(', ');
        }
      }
      if (Array.isArray(booking.seatDetails) && booking.seatDetails.length > 0) {
        return booking.seatDetails.map(s => `${s.row}${s.number}`).join(', ');
      }
    }
    return "Standard";
  };

  // Compute Metrics
  const metrics = useMemo(() => {
    const totalCount = payments.length;
    const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const completedCount = payments.filter(p => {
      const st = String(p.status || '').toLowerCase();
      return st === 'completed' || st === 'confirmed' || st === 'success';
    }).length;
    const pendingFailedCount = totalCount - completedCount;

    return {
      totalCount,
      totalPaid,
      completedCount,
      pendingFailedCount
    };
  }, [payments]);

  // Filter & Sort Logic
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => {
        const title = getMovieTitle(p).toLowerCase();
        const bRef = getBookingRef(p).toLowerCase();
        const pRef = String(p._id || '').toLowerCase();
        const pMethod = String(p.paymentMethod || '').toLowerCase();
        return title.includes(q) || bRef.includes(q) || pRef.includes(q) || pMethod.includes(q);
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => {
        const st = String(p.status || '').toLowerCase();
        if (statusFilter === 'Completed') return st === 'completed' || st === 'confirmed';
        if (statusFilter === 'Pending') return st === 'pending';
        if (statusFilter === 'Failed') return st === 'failed';
        if (statusFilter === 'Refunded') return st === 'refunded';
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'lowest') return (a.amount || 0) - (b.amount || 0);
      return 0;
    });

    return result;
  }, [payments, searchTerm, statusFilter, sortBy]);

  // Render Status Badge
  const renderStatusBadge = (statusStr) => {
    const st = String(statusStr || 'Completed').toLowerCase();
    if (st === 'completed' || st === 'confirmed' || st === 'success') {
      return (
        <span className="payment-status-tag tag-completed">
          <FiCheckCircle /> Completed
        </span>
      );
    }
    if (st === 'pending') {
      return (
        <span className="payment-status-tag tag-pending">
          <FiClock /> Pending
        </span>
      );
    }
    if (st === 'failed') {
      return (
        <span className="payment-status-tag tag-failed">
          <FiAlertCircle /> Failed
        </span>
      );
    }
    if (st === 'refunded') {
      return (
        <span className="payment-status-tag tag-refunded">
          <FiRefreshCw /> Refunded
        </span>
      );
    }
    return (
      <span className="payment-status-tag tag-completed">
        <FiCheckCircle /> {statusStr || 'Completed'}
      </span>
    );
  };

  return (
    <PageLayout>
      <div className="my-tickets-wallet-page">
        <div className="wallet-container">

          {/* 1. Page Header */}
          <div className="wallet-header">
            <div className="wallet-title-group">
              <h1 className="wallet-main-title">My Payments</h1>
              <p className="wallet-subtitle">
                Review your CineNova transactions and booking receipts
              </p>
            </div>

            <div className="header-buttons-row">
              <button
                className="btn-book-another"
                onClick={() => navigate('/')}
              >
                <FiPlus /> Book Another Movie
              </button>

              {payments.length > 0 && (
                <button
                  className="btn-clear-history-subtle"
                  onClick={() => setShowClearModal(true)}
                  title="Clear payment history"
                >
                  <FiTrash2 /> Clear History
                </button>
              )}
            </div>
          </div>

          {/* 2. Payment Overview Summary Metrics */}
          {!loading && !error && (
            <div className="payments-overview-grid">
              <div className="summary-metric-card">
                <div className="metric-icon-box gold">
                  <FiCreditCard />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Total Payments</span>
                  <span className="metric-value">{metrics.totalCount}</span>
                </div>
              </div>

              <div className="summary-metric-card">
                <div className="metric-icon-box green">
                  <FiTag />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Total Amount Paid</span>
                  <span className="metric-value amount">Rs. {metrics.totalPaid.toLocaleString()}</span>
                </div>
              </div>

              <div className="summary-metric-card">
                <div className="metric-icon-box emerald">
                  <FiCheckCircle />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Completed</span>
                  <span className="metric-value">{metrics.completedCount}</span>
                </div>
              </div>

              <div className="summary-metric-card">
                <div className="metric-icon-box amber">
                  <FiClock />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Pending / Other</span>
                  <span className="metric-value">{metrics.pendingFailedCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Search, Filter & Sort Toolbar */}
          {!loading && !error && payments.length > 0 && (
            <div className="payments-toolbar">
              <div className="search-input-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by movie, booking ref, or payment ID..."
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

              <div className="toolbar-controls">
                <div className="filter-group">
                  <FiFilter className="control-icon" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="toolbar-select"
                  >
                    <option value="all">All Payments</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div className="filter-group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="toolbar-select"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Amount</option>
                    <option value="lowest">Lowest Amount</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 4. Content Area: Loading Skeletons, Error, Empty State, or Payment List */}
          {loading ? (
            <div className="payments-cards-list">
              {[1, 2, 3].map((n) => (
                <div key={n} className="payment-history-card skeleton-card">
                  <div className="skeleton-poster"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line text"></div>
                    <div className="skeleton-line text short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="payments-error-card">
              <FiAlertCircle className="error-icon" />
              <h3>Unable to load payment history</h3>
              <p>{error}</p>
              <button className="btn-retry" onClick={fetchMyPayments}>
                <FiRefreshCw /> Try Again
              </button>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="empty-payments-card">
              <div className="empty-icon-box">
                <FiBookmark />
              </div>
              <h3 className="empty-title">
                {searchTerm || statusFilter !== 'all' ? "No matching transactions found" : "No payment history yet"}
              </h3>
              <p className="empty-desc">
                {searchTerm || statusFilter !== 'all'
                  ? "Try adjusting your search terms or filters to find what you are looking for."
                  : "Your completed CineNova transactions and receipts will appear here."}
              </p>
              <button className="btn-book-another" onClick={() => navigate('/movies')}>
                <FiFilm /> Browse Movies
              </button>
            </div>
          ) : (
            <div className="payments-cards-list">
              {filteredPayments.map((payment) => {
                const posterUrl = getPosterUrl(payment);
                const movieTitle = getMovieTitle(payment);
                const bookingRef = getBookingRef(payment);
                const hallName = getHallName(payment);
                const seatsDisplay = getSeatsDisplay(payment);
                const txnId = payment._id ? `#${payment._id.slice(-6).toUpperCase()}` : 'TXN';
                const formattedAmount = payment.amount ? payment.amount.toLocaleString('en-IN') : '0';
                const bookingIdObj = payment.bookingId?._id || (typeof payment.bookingId === 'string' ? payment.bookingId : null);

                return (
                  <div key={payment._id} className="payment-history-card">
                    
                    {/* Left: Movie Poster */}
                    <div className="card-poster-wrapper">
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={movieTitle}
                          className="poster-img"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement.querySelector('.poster-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="poster-fallback"
                        style={{ display: posterUrl ? 'none' : 'flex' }}
                      >
                        <FiFilm />
                        <span>CINENOVA</span>
                      </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="card-details-wrapper">
                      <div>
                        <h3 className="card-movie-title">{movieTitle}</h3>
                        <div className="ref-tags-row">
                          <span className="ref-badge booking">Ref: {bookingRef.startsWith('#') ? bookingRef : `#${bookingRef}`}</span>
                          <span className="ref-badge txn">TXN: {txnId}</span>
                        </div>
                      </div>

                      <div className="meta-info-grid">
                        <div className="meta-item">
                          <FiCalendar className="meta-icon" />
                          <span>{formatDate(payment.createdAt)}</span>
                        </div>
                        <div className="meta-item">
                          <FiClock className="meta-icon" />
                          <span>{formatTime(payment.createdAt)}</span>
                        </div>
                        {hallName !== "Unavailable" && (
                          <div className="meta-item">
                            <FiFilm className="meta-icon" />
                            <span>{hallName}</span>
                          </div>
                        )}
                        <div className="meta-item">
                          <FiTag className="meta-icon" />
                          <span>Seats: {seatsDisplay}</span>
                        </div>
                        <div className="meta-item">
                          <FiCreditCard className="meta-icon" />
                          <span>{payment.paymentMethod || 'Credit Card'} {payment.cardLast4 ? `(**** ${payment.cardLast4})` : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="card-actions-wrapper">
                      <div className="amount-status-block">
                        <span className="card-amount">Rs. {formattedAmount}</span>
                        {renderStatusBadge(payment.status)}
                      </div>

                      <div className="card-buttons-group">
                        <button
                          className="btn-view-receipt"
                          onClick={() => setSelectedReceipt(payment)}
                        >
                          <FiTag /> View Receipt
                        </button>

                        {bookingIdObj && (
                          <button
                            className="btn-view-ticket-subtle"
                            onClick={() => navigate(`/booking-success/${bookingIdObj}`)}
                          >
                            <FiBookmark /> Digital Ticket
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* 5. Glass Modal for Payment Receipt */}
      {selectedReceipt && (
        <div className="receipt-overlay-backdrop" onClick={() => setSelectedReceipt(null)}>
          <div className="receipt-glass-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="modal-header">
              <div className="brand-badge">
                <FiFilm />
                <span>CineNova Receipt</span>
              </div>
              <button className="btn-close-modal" onClick={() => setSelectedReceipt(null)}>
                <FiX />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="receipt-amount-banner">
                <span className="banner-label">TOTAL AMOUNT PAID</span>
                <span className="banner-amount">
                  Rs. {selectedReceipt.amount ? selectedReceipt.amount.toLocaleString('en-IN') : '0'}
                </span>
                <div style={{ marginTop: '6px' }}>
                  {renderStatusBadge(selectedReceipt.status)}
                </div>
              </div>

              <div className="receipt-details-list">
                <div className="receipt-detail-item">
                  <span className="r-label">Movie Title</span>
                  <span className="r-val highlight-gold">{getMovieTitle(selectedReceipt)}</span>
                </div>

                <div className="receipt-detail-item">
                  <span className="r-label">Transaction ID</span>
                  <span className="r-val monospace">{selectedReceipt._id}</span>
                </div>

                <div className="receipt-detail-item">
                  <span className="r-label">Booking Reference</span>
                  <span className="r-val highlight-gold">{getBookingRef(selectedReceipt)}</span>
                </div>

                <div className="receipt-detail-item">
                  <span className="r-label">Payment Date & Time</span>
                  <span className="r-val">{formatDate(selectedReceipt.createdAt)} • {formatTime(selectedReceipt.createdAt)}</span>
                </div>

                <div className="receipt-detail-item">
                  <span className="r-label">Payment Method</span>
                  <span className="r-val">{selectedReceipt.paymentMethod || 'Credit Card'} {selectedReceipt.cardLast4 ? `(**** ${selectedReceipt.cardLast4})` : ''}</span>
                </div>
              </div>

              <div className="receipt-modal-actions">
                <button
                  className="btn-print-receipt"
                  onClick={() => {
                    window.print();
                  }}
                >
                  Save / Print Receipt
                </button>

                {selectedReceipt.bookingId?._id && (
                  <button
                    className="btn-ticket-modal"
                    onClick={() => {
                      const bId = selectedReceipt.bookingId._id;
                      setSelectedReceipt(null);
                      navigate(`/booking-success/${bId}`);
                    }}
                  >
                    <FiBookmark /> Open Digital Pass
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. Glass Confirmation Modal for Clear History */}
      {showClearModal && (
        <div className="custom-modal-overlay" onClick={() => setShowClearModal(null)}>
          <div className="custom-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-warning-icon">
              <FiAlertCircle />
            </div>
            <h3 className="modal-title">Clear Payment History?</h3>
            <p className="modal-desc">
              This will permanently clear your payment history records.<br />
              This action cannot be undone.
            </p>
            <div className="modal-actions-row">
              <button
                className="btn-modal-cancel"
                onClick={() => setShowClearModal(false)}
                disabled={actionLoading}
              >
                Keep History
              </button>
              <button
                className="btn-modal-confirm-danger"
                onClick={handleClearHistory}
                disabled={actionLoading}
              >
                {actionLoading ? "Clearing..." : "Confirm Clear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {toastMessage && (
        <div className="ticket-toast-notice">
          <FiCheck /> {toastMessage}
        </div>
      )}
    </PageLayout>
  );
};

export default PaymentHistory;