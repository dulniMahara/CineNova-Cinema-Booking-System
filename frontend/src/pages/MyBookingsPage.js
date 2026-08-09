import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import PageLayout from '../components/PageLayout';
import {
  FiFilm,
  FiCalendar,
  FiCheck,
  FiXCircle,
  FiTrash2,
  FiPlus,
  FiAlertTriangle,
  FiBookmark
} from 'react-icons/fi';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom glass modal states for ticket cancellation & clear history
  const [cancelModalId, setCancelModalId] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Get logged-in user ID
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || user.id;

  // Scroll to top automatically when page opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const endpoint = userId ? `/bookings/user/${userId}` : '/bookings/user/me';
        const res = await API.get(endpoint);
        const data = Array.isArray(res.data) ? res.data : res.data.bookings || [];
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHistory(sortedData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  // Execute Ticket Cancellation
  const executeCancel = async (id) => {
    setActionLoading(true);
    try {
      await API.delete(`/bookings/${id}`);
      setHistory(history.map(b =>
        b._id === id ? { ...b, status: 'Cancelled' } : b
      ));
      setCancelModalId(null);
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Could not cancel booking. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Clear History
  const executeClearHistory = async () => {
    setActionLoading(true);
    try {
      await API.post('/bookings/clear-history', { userId });
      setShowClearModal(false);
      window.location.reload();
    } catch (err) {
      if (err.response) {
        alert(`FAILED: ${err.response.status} - ${err.response.statusText}\n${JSON.stringify(err.response.data)}`);
      } else {
        alert(`Network Error: Is the backend running? \n${err.message}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to safely display seats
  const renderSeats = (seats) => {
    if (!seats || seats.length === 0) return "None";
    if (typeof seats[0] === 'object') {
      return seats.map(s => `${s.row}${s.number}`).join(", ");
    }
    return seats.join(", ");
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="my-tickets-wallet-page">
          <div className="loading-dashboard-box">
            <div className="dashboard-spinner" />
            <h2>Opening Ticket Wallet...</h2>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="my-tickets-wallet-page">
        <div className="wallet-container">

          {/* Header Section */}
          <div className="wallet-header">
            <div className="wallet-title-group">
              <h1 className="wallet-main-title">My Bookings</h1>
              <p className="wallet-subtitle">
                Your upcoming and past cinema experiences
              </p>
            </div>

            <div className="header-buttons-row">
              <button
                className="btn-book-another"
                onClick={() => navigate('/')}
              >
                <FiPlus /> Book Another Movie
              </button>

              {history.length > 0 && (
                <button
                  className="btn-clear-history-subtle"
                  onClick={() => setShowClearModal(true)}
                  title="Clear all past history"
                >
                  <FiTrash2 /> Clear History
                </button>
              )}
            </div>
          </div>

          {/* Tickets List */}
          <div className="wallet-tickets-list">
            {history.length === 0 ? (
              /* Empty State */
              <div className="empty-wallet-card">
                <div className="empty-wallet-icon">
                  <FiBookmark />
                </div>
                <h3 className="empty-wallet-title">No bookings yet</h3>
                <p className="empty-wallet-subtitle">Your next cinematic experience is waiting.</p>
                <button
                  className="btn-book-another"
                  onClick={() => navigate('/')}
                >
                  Explore Movies
                </button>
              </div>
            ) : (
              /* User Cinema Wallet Pass Cards */
              history.map(b => {
                const isCancelled = String(b.status).toLowerCase() === 'cancelled';

                const getPosterUrl = (booking) => {
                  const m = booking?.showtimeId?.movie || booking?.movie || {};
                  const url = m.posterUrl || m.poster || m.bannerUrl || booking?.moviePoster || booking?.posterUrl;
                  if (!url) return null;
                  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
                    return url;
                  }
                  if (url.startsWith('/')) {
                    const baseUrl = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : '';
                    return `${baseUrl}${url}`;
                  }
                  return url;
                };

                const posterUrl = b.movie?.posterUrl || b.showtimeId?.movie?.posterUrl || getPosterUrl(b);
                const movieTitle = b.movie?.title || b.showtimeId?.movie?.title || b.movieTitle || "Unavailable";
                const refCode = b.bookingReference || (b._id ? `CN-${b._id.slice(-6).toUpperCase()}` : 'Unavailable');

                // Format Date & Time cleanly
                const dateVal = b.showtime?.date || b.showtimeId?.date;
                const dateObj = dateVal ? new Date(dateVal) : null;
                const formattedDayStr = dateObj && !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                  : "Unavailable";
                const timeStr = b.showtime?.startTime || b.showtimeId?.startTime || "Unavailable";
                const hallName = b.hall?.name || b.showtimeId?.hall?.name || "Unavailable";
                const dateTimeDisplay = dateObj && timeStr !== "Unavailable" ? `${formattedDayStr} • ${timeStr}` : formattedDayStr;

                const seatsArray = (Array.isArray(b.seats) && b.seats.length > 0)
                  ? b.seats.map(s => s.seatLabel || `${s.row}${s.number}`)
                  : (b.seatIds || b.seatDetails);
                const seatStr = renderSeats(seatsArray);

                const rawAmount = b.totalPrice || b.payment?.amount || 0;
                const formattedAmount = typeof rawAmount === 'number'
                  ? rawAmount.toLocaleString('en-IN')
                  : rawAmount;

                return (
                  <div
                    key={b._id}
                    className={`ticket-wallet-card ${isCancelled ? 'is-cancelled' : ''}`}
                  >

                    {/* Visual Poster Frame */}
                    <div className="card-poster-side">
                      {posterUrl ? (
                        <img
                          src={posterUrl}
                          alt={movieTitle}
                          className="card-poster-img"
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
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>CINENOVA</span>
                      </div>
                    </div>

                    {/* Movie Info & Details */}
                    <div className="card-info-side">
                      <div>
                        <h3 className="card-movie-title">{movieTitle}</h3>
                        <div className="card-datetime-row">
                          <FiCalendar /> <span>{dateTimeDisplay}</span>
                        </div>
                        {hallName !== "Unavailable" && (
                          <div className="card-datetime-row" style={{ marginTop: '4px', fontSize: '0.82rem', color: '#94a3b8' }}>
                            <span>Hall: {hallName}</span>
                          </div>
                        )}
                      </div>

                      <div className="card-details-row">
                        <span className="detail-pill">Seats: {seatStr}</span>
                        <span className="detail-amount">Rs. {formattedAmount}</span>
                        <span className="card-ref-code">{refCode.startsWith('#') ? refCode : `#${refCode}`}</span>
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="card-status-side">
                      <span className={`wallet-status-tag ${isCancelled ? 'cancelled' : 'confirmed'}`}>
                        {isCancelled ? <FiXCircle /> : <FiCheck />}
                        {isCancelled ? 'Cancelled' : 'Confirmed'}
                      </span>

                      <div className="card-actions-group">
                        <button
                          className="btn-view-pass"
                          onClick={() => navigate(`/booking-success/${b._id}`, {
                            state: {
                              booking: b
                            }
                          })}
                        >
                          View Ticket
                        </button>

                        {!isCancelled && (
                          <button
                            className="btn-cancel-pass"
                            onClick={() => setCancelModalId(b._id)}
                          >
                            Cancel Ticket
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* Glass Confirmation Modal for Ticket Cancellation */}
      {cancelModalId && (
        <div className="custom-modal-overlay" onClick={() => setCancelModalId(null)}>
          <div className="custom-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-warning-icon">
              <FiAlertTriangle />
            </div>
            <h3 className="modal-title">Cancel Booking?</h3>
            <p className="modal-desc">
              Are you sure you want to cancel this ticket?<br />
              This action cannot be undone once confirmed.
            </p>
            <div className="modal-actions-row">
              <button
                className="btn-modal-cancel"
                onClick={() => setCancelModalId(null)}
                disabled={actionLoading}
              >
                Keep Ticket
              </button>
              <button
                className="btn-modal-confirm-danger"
                onClick={() => executeCancel(cancelModalId)}
                disabled={actionLoading}
              >
                {actionLoading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glass Confirmation Modal for Clear History */}
      {showClearModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-warning-icon">
              <FiAlertTriangle />
            </div>
            <h3 className="modal-title">Clear Booking History?</h3>
            <p className="modal-desc">
              This will permanently remove your booking history.<br />
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
                onClick={executeClearHistory}
                disabled={actionLoading}
              >
                {actionLoading ? "Clearing..." : "Clear All History"}
              </button>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  );
};

export default MyBookingsPage;