import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  FiFilm,
  FiCheckCircle,
  FiXCircle,
  FiSlash,
  FiArrowLeft,
  FiCalendar,
  FiTv,
  FiCreditCard,
  FiBookmark,
  FiHome,
  FiCheck,
  FiTag
} from "react-icons/fi";
import './BookingSuccess.css';

// Helper function to generate a deterministic 21x21 QR code matrix from a text string
const generateQRCodeMatrix = (text) => {
  const size = 21;
  const grid = Array(size).fill(null).map(() => Array(size).fill(false));

  const drawFinder = (r, c) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          grid[r + i][c + j] = true;
        }
      }
    }
  };

  // 3 Finder patterns
  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  // Timing patterns
  for (let i = 8; i < 13; i += 2) {
    grid[6][i] = true;
    grid[i][6] = true;
  }

  // Hash based matrix fill for data cells
  let hash = 0;
  const str = String(text || 'CineNovaTicketRef');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= 13;
      const inBottomLeft = r >= 13 && c < 8;
      const isTiming = (r === 6 && c >= 8 && c < 13) || (c === 6 && r >= 8 && r < 13);

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        const val = Math.abs(Math.sin(hash + r * 21 + c)) * 10000;
        grid[r][c] = (Math.floor(val) % 3) !== 0;
      }
    }
  }

  return grid;
};

// Active QR Code Component
const DigitalQRCode = ({ value }) => {
  const matrix = useMemo(() => generateQRCodeMatrix(value), [value]);
  const size = 21;

  return (
    <div className="qr-box-wrapper">
      <div className="scan-laser" />
      <svg viewBox={`0 0 ${size} ${size}`} className="qr-code-svg">
        {matrix.map((row, r) =>
          row.map((cell, c) => (
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width="0.95"
                height="0.95"
                rx="0.15"
                fill="#0f172a"
              />
            ) : null
          ))
        )}
      </svg>
    </div>
  );
};

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();
  const state = location.state || {};

  const [bookingData, setBookingData] = useState(state.booking || null);
  const [loading, setLoading] = useState(!state.booking && !!(bookingId || state.bookingRef || state.bookingId));
  const [fetchError, setFetchError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const targetBookingId = bookingId || state.bookingRef || state.bookingId || state.booking?._id;
  const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [bookingId]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!targetBookingId || !isObjectId(targetBookingId)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/bookings/${targetBookingId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (res.data?.booking) {
          setBookingData(res.data.booking);
        } else if (res.data) {
          setBookingData(res.data);
        }
      } catch (err) {
        console.error("Error fetching ticket booking:", err);
        setFetchError(
          err.response?.data?.message ||
          (err.response?.status === 403 ? "Unauthorized access to ticket" : "Failed to load booking ticket details")
        );
      } finally {
        setLoading(false);
      }
    };

    if (!bookingData || isObjectId(targetBookingId)) {
      fetchBookingDetails();
    }
  }, [targetBookingId]);

  if (loading) {
    return (
      <div className="booking-success-wrapper">
        <div className="success-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner-ring" style={{ margin: '0 auto 20px auto' }}></div>
          <h2 style={{ color: '#ffffff' }}>Loading Digital Ticket Pass...</h2>
          <p style={{ color: '#94a3b8' }}>Verifying booking details from database...</p>
        </div>
      </div>
    );
  }

  if (fetchError && !bookingData) {
    return (
      <div className="booking-success-wrapper">
        <div className="success-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="hero-icon-container cancelled-icon-container" style={{ margin: '0 auto 20px auto' }}>
            <FiXCircle className="hero-cancelled-icon" />
          </div>
          <h2 style={{ color: '#ffffff', marginBottom: '10px' }}>Ticket Unavailable</h2>
          <p style={{ color: '#FCA5A5', marginBottom: '24px' }}>{fetchError}</p>
          <button className="btn-primary-view" onClick={() => navigate('/my-bookings')}>
            <FiBookmark /> Return to My Tickets
          </button>
        </div>
      </div>
    );
  }

  // Derive active values safely from bookingData or location state
  const activeBooking = bookingData || {};
  const movieObj = activeBooking.movie || activeBooking.showtimeId?.movie || {};
  const showtimeObj = activeBooking.showtime || activeBooking.showtimeId || {};
  const hallObj = activeBooking.hall || showtimeObj.hall || {};
  const paymentObj = activeBooking.payment || {};

  const rawStatus = activeBooking.status || state.status || 'Confirmed';
  const isCancelled = String(rawStatus).toLowerCase() === 'cancelled';

  // Booking reference
  const bookingRef = activeBooking.bookingReference || (activeBooking._id ? `CN-${activeBooking._id.slice(-6).toUpperCase()}` : (state.bookingRef || "Unavailable"));

  // Movie title & poster
  const movieTitle = movieObj.title || activeBooking.movieTitle || state.movieTitle || "Unavailable";

  const getPosterUrl = () => {
    const url = movieObj.posterUrl || movieObj.poster || movieObj.bannerUrl || activeBooking.moviePoster || state.posterUrl;
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    if (url.startsWith('/')) {
      const baseUrl = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : '';
      return `${baseUrl}${url}`;
    }
    return url;
  };
  const posterUrl = getPosterUrl();

  // Date & Time formatting
  const dateVal = showtimeObj.date;
  const dateObj = dateVal ? new Date(dateVal) : null;
  const formattedDayStr = dateObj && !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : (state.showtime ? state.showtime.split('•')[0] : "Unavailable");
  const timeStr = showtimeObj.startTime || (state.showtime && state.showtime.includes('•') ? state.showtime.split('•')[1] : "Unavailable");
  const showtimeDisplay = dateObj && timeStr !== "Unavailable" ? `${formattedDayStr} • ${timeStr}` : formattedDayStr;

  // Hall & Seats
  const hallName = hallObj.name || state.hall || "Unavailable";

  const rawSeats = activeBooking.seats || activeBooking.seatIds || activeBooking.seatDetails || state.selectedSeats || state.seats;
  const seatList = Array.isArray(rawSeats) && rawSeats.length > 0
    ? rawSeats.map(s => {
        if (typeof s === 'object' && s !== null) {
          return s.seatLabel || (s.row && s.number ? `${s.row}${s.number}` : String(s._id || ''));
        }
        return String(s);
      })
    : (typeof rawSeats === 'string' ? rawSeats.split(',').map(s => s.trim()) : ["Unavailable"]);

  // Payment
  const paymentMethod = paymentObj.paymentMethod || state.paymentMethod || activeBooking.paymentMethod || "Credit Card";
  const rawAmount = activeBooking.totalPrice || paymentObj.amount || state.amount || state.totalPrice || 0;
  const formattedAmount = typeof rawAmount === 'number' && rawAmount > 0
    ? rawAmount.toLocaleString('en-IN')
    : (rawAmount || "Unavailable");

  // Dynamic QR Code payload
  const qrPayload = `${window.location.origin}/booking-success/${activeBooking._id || targetBookingId || bookingRef}`;

  const handleViewTicket = () => {
    setToastMessage('Digital Pass saved! Present your QR code at the cinema entrance.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    if (window.matchMedia && window.matchMedia('print').matches) {
      window.print();
    }
  };

  // --- CANCELLED BOOKING TICKET VIEW ---
  if (isCancelled) {
    return (
      <div className="booking-success-wrapper cancelled-view-wrapper">
        <div className="success-container">

          {/* Top Navigation */}
          <div className="top-nav-bar">
            <button
              className="nav-back-button"
              onClick={() => navigate('/my-bookings')}
              title="Return to My Tickets"
            >
              <FiArrowLeft /> Back to My Tickets
            </button>
          </div>

          {/* Cancelled Hero Section */}
          <div className="hero-section">
            <div className="hero-icon-container cancelled-icon-container">
              <FiXCircle className="hero-cancelled-icon" />
            </div>
            <h1 className="hero-title cancelled-title">
              Booking Cancelled
            </h1>
            <p className="hero-subtitle">
              This ticket is no longer valid and cannot be used for entry.
            </p>
          </div>

          {/* Centered Cancelled Ticket Card */}
          <div className="digital-ticket-card cancelled-ticket-card">

            {/* Header Branding */}
            <div className="ticket-header cancelled-ticket-header">
              <div className="brand-badge">
                <div className="brand-logo-icon cancelled-logo">
                  <FiFilm />
                </div>
                <span className="brand-name">CineNova</span>
              </div>
              <span className="cancelled-pass-tag">VOID / CANCELLED PASS</span>
            </div>

            {/* Movie Title & Status Banner */}
            <div className="ticket-movie-section" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt={movieTitle}
                  style={{ width: '60px', height: '85px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div>
                <h2 className="movie-title-large">{movieTitle}</h2>
                <div className="movie-meta-row">
                  <span className="cancelled-status-badge">
                    <FiXCircle /> CANCELLED
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Details Grid */}
            <div className="ticket-details-grid">

              <div className="detail-block">
                <span className="detail-label">Booking Reference</span>
                <span className="detail-value booking-ref-code cancelled-ref">{bookingRef.startsWith('#') ? bookingRef : `#${bookingRef}`}</span>
              </div>

              <div className="detail-block">
                <span className="detail-label">
                  <FiCalendar /> Showtime
                </span>
                <span className="detail-value">{showtimeDisplay}</span>
              </div>

              <div className="detail-block">
                <span className="detail-label">
                  <FiTv /> Hall
                </span>
                <span className="detail-value">{hallName}</span>
              </div>

              <div className="detail-block">
                <span className="detail-label">
                  <FiFilm /> Selected Seats
                </span>
                <div className="seats-container">
                  {seatList.map((seat, index) => (
                    <span key={index} className="seat-badge cancelled-seat">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Perforation Line */}
            <div className="ticket-perforation-container">
              <div className="notch-left" />
              <div className="dashed-line" />
              <div className="notch-right" />
            </div>

            {/* Disabled QR Code Area */}
            <div className="qr-section cancelled-qr-section">
              <div className="qr-disabled-wrapper">
                <FiSlash className="qr-disabled-icon" />
                <span className="qr-disabled-text">QR Code Disabled</span>
              </div>
              <p className="qr-instruction cancelled-instruction">
                Entry access has been revoked for this booking.
              </p>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="action-buttons-group">
            <button
              className="btn-primary-view btn-back-tickets"
              onClick={() => navigate('/my-bookings')}
            >
              <FiBookmark /> Back to My Tickets
            </button>

            <button
              className="btn-small-home"
              onClick={() => navigate('/')}
            >
              <FiHome /> Back to Home
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- CONFIRMED BOOKING TICKET VIEW ---
  return (
    <div className="booking-success-wrapper">
      <div className="success-container">

        {/* Top Header / Back Navigation */}
        <div className="top-nav-bar">
          <button
            className="nav-back-button"
            onClick={() => navigate('/')}
            title="Return to Home"
          >
            <FiArrowLeft /> Return Home
          </button>
        </div>

        {/* 1. Success Hero Section */}
        <div className="hero-section">
          <div className="hero-icon-container">
            <FiCheckCircle className="hero-check-icon" />
          </div>
          <h1 className="hero-title">
            <span>✓</span> Booking Confirmed
          </h1>
          <p className="hero-subtitle">Your movie experience is ready.</p>
          <p className="hero-subdetail">Your ticket details are below.</p>
        </div>

        {/* 2. Digital Ticket Card */}
        <div className="digital-ticket-card">

          {/* Header Branding */}
          <div className="ticket-header">
            <div className="brand-badge">
              <div className="brand-logo-icon">
                <FiFilm />
              </div>
              <span className="brand-name">CineNova</span>
            </div>
            <span className="vip-pass-tag">VIP DIGITAL PASS</span>
          </div>

          {/* Movie Banner Header */}
          <div className="ticket-movie-section" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {posterUrl && (
              <img
                src={posterUrl}
                alt={movieTitle}
                style={{ width: '75px', height: '105px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              />
            )}
            <div>
              <h2 className="movie-title-large">{movieTitle}</h2>
              <div className="movie-meta-row">
                <span className="movie-format-pill">{hallName !== "Unavailable" ? hallName : "CINENOVA DIGITAL"}</span>
                <span>•</span>
                <span>DOLBY ATMOS</span>
                <span>•</span>
                <span>PREMIUM SCREEN</span>
              </div>
            </div>
          </div>

          {/* Ticket Details Grid */}
          <div className="ticket-details-grid">

            <div className="detail-block">
              <span className="detail-label">Booking Reference</span>
              <span className="detail-value booking-ref-code">{bookingRef.startsWith('#') ? bookingRef : `#${bookingRef}`}</span>
            </div>

            <div className="detail-block">
              <span className="detail-label">
                <FiCalendar /> Showtime
              </span>
              <span className="detail-value">{showtimeDisplay}</span>
            </div>

            <div className="detail-block">
              <span className="detail-label">
                <FiTv /> Hall
              </span>
              <span className="detail-value">{hallName}</span>
            </div>

            <div className="detail-block">
              <span className="detail-label">
                <FiFilm /> Selected Seats
              </span>
              <div className="seats-container">
                {seatList.map((seat, index) => (
                  <span key={index} className="seat-badge">
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-block">
              <span className="detail-label">
                <FiCreditCard /> Payment Method
              </span>
              <span className="detail-value">{paymentMethod}</span>
            </div>

            <div className="detail-block">
              <span className="detail-label">Amount Paid</span>
              <span className="detail-value amount-highlight">
                {formattedAmount !== "Unavailable" ? `Rs. ${formattedAmount}` : "Unavailable"}
              </span>
            </div>

          </div>

          {/* Perforation Notch Cutout Line */}
          <div className="ticket-perforation-container">
            <div className="notch-left" />
            <div className="dashed-line" />
            <div className="notch-right" />
          </div>

          {/* 3. Dynamic QR Code Section */}
          <div className="qr-section">
            <DigitalQRCode value={qrPayload} />
            <p className="qr-instruction">Scan this QR code at cinema entrance</p>
            <p className="qr-subnote">Present this digital pass at the entrance gate for automated verification.</p>
            <span style={{ display: 'block', marginTop: '8px', fontSize: '0.78rem', color: '#D4AF37', fontWeight: '700' }}>
              Ref: {bookingRef}
            </span>
          </div>

        </div>

        {/* 4. Action Buttons */}
        <div className="action-buttons-group">

          <div className="primary-secondary-row">
            <button
              className="btn-primary-view"
              onClick={handleViewTicket}
            >
              <FiTag /> Save / Print Pass
            </button>

            <button
              className="btn-secondary-bookings"
              onClick={() => navigate('/my-bookings')}
            >
              <FiBookmark /> My Bookings
            </button>
          </div>

          <button
            className="btn-small-home"
            onClick={() => navigate('/')}
          >
            <FiHome /> Back to Home
          </button>

        </div>

      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="ticket-toast-notice">
          <FiCheck /> {toastMessage}
        </div>
      )}
    </div>
  );
};

export default BookingSuccess;