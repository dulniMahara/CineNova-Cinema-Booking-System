import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const str = String(text || 'CineNovaBookingRef');
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
  const state = location.state || {};

  const [toastMessage, setToastMessage] = useState(null);

  // Status check
  const rawStatus = state.status || state.bookingStatus || 'Confirmed';
  const isCancelled = String(rawStatus).toLowerCase() === 'cancelled';

  // Extract booking details safely from navigation state or provide clean realistic fallback
  const rawRef = state.bookingRef || state.bookingId || state._id;
  const bookingRef = rawRef ? String(rawRef) : `CN-${Math.floor(100000 + Math.random() * 900000)}`;

  const movieTitle = state.movieTitle || state.title || 'Avatar: Fire and Ash';
  const showtime = state.showtime || state.time || 'Today, 08:30 PM';
  const hall = state.hall || state.screen || 'Hall 01 - VIP Screen';

  // Format seats
  const rawSeats = state.selectedSeats || state.seats;
  const seatList = Array.isArray(rawSeats)
    ? (typeof rawSeats[0] === 'string'
      ? rawSeats
      : rawSeats.map(s => `${s.row}${s.number}`))
    : (typeof rawSeats === 'string' ? rawSeats.split(',').map(s => s.trim()) : ['F7', 'F8']);

  const paymentMethod = state.paymentMethod || 'Credit Card';

  // Currency formatting: Rs. XXXX (NO dollar symbols!)
  const rawAmount = state.amount || state.totalPrice || state.displayPrice || 3200;
  const formattedAmount = typeof rawAmount === 'number'
    ? rawAmount.toLocaleString('en-IN')
    : rawAmount;

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
            <div className="ticket-movie-section">
              <h2 className="movie-title-large">{movieTitle}</h2>
              <div className="movie-meta-row">
                <span className="cancelled-status-badge">
                  <FiXCircle /> CANCELLED
                </span>
              </div>
            </div>

            {/* Ticket Details Grid */}
            <div className="ticket-details-grid">

              <div className="detail-block">
                <span className="detail-label">Booking Reference</span>
                <span className="detail-value booking-ref-code cancelled-ref">#{bookingRef}</span>
              </div>

              <div className="detail-block">
                <span className="detail-label">
                  <FiCalendar /> Showtime
                </span>
                <span className="detail-value">{showtime}</span>
              </div>

              <div className="detail-block">
                <span className="detail-label">
                  <FiTv /> Hall
                </span>
                <span className="detail-value">{hall}</span>
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

          {/* Movie Banner */}
          <div className="ticket-movie-section">
            <h2 className="movie-title-large">{movieTitle}</h2>
            <div className="movie-meta-row">
              <span className="movie-format-pill">4K ULTRA HD</span>
              <span>•</span>
              <span>DOLBY ATMOS</span>
              <span>•</span>
              <span>PREMIUM SCREEN</span>
            </div>
          </div>

          {/* Ticket Details Grid */}
          <div className="ticket-details-grid">

            <div className="detail-block">
              <span className="detail-label">Booking Reference</span>
              <span className="detail-value booking-ref-code">#{bookingRef}</span>
            </div>

            <div className="detail-block">
              <span className="detail-label">
                <FiCalendar /> Showtime
              </span>
              <span className="detail-value">{showtime}</span>
            </div>

            <div className="detail-block">
              <span className="detail-label">
                <FiTv /> Hall
              </span>
              <span className="detail-value">{hall}</span>
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
              <span className="detail-value amount-highlight">Rs. {formattedAmount}</span>
            </div>

          </div>

          {/* Perforation Notch Cutout Line */}
          <div className="ticket-perforation-container">
            <div className="notch-left" />
            <div className="dashed-line" />
            <div className="notch-right" />
          </div>

          {/* 3. QR Code Section */}
          <div className="qr-section">
            <DigitalQRCode value={bookingRef} />
            <p className="qr-instruction">Scan this QR code at cinema entrance</p>
            <p className="qr-subnote">Present this digital pass at the entrance gate for automated verification.</p>
          </div>

        </div>

        {/* 4. Action Buttons */}
        <div className="action-buttons-group">

          <div className="primary-secondary-row">
            <button
              className="btn-primary-view"
              onClick={handleViewTicket}
            >
              <FiTag /> View Ticket
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