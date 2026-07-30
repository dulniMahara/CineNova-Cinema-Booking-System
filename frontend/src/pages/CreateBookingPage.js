import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiFilm,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiShield,
  FiCreditCard,
  FiSmartphone,
  FiTag
} from 'react-icons/fi';
import axios from 'axios';
import './Booking.css';

const PAYMENT_METHODS = [
  {
    id: "Credit Card",
    name: "Credit / Debit Card",
    icon: FiCreditCard,
    desc: "Visa, Mastercard"
  },
  {
    id: "Mobile Banking",
    name: "Mobile Banking",
    icon: FiSmartphone,
    desc: "Genie, FriMi, eZ Cash"
  },
  {
    id: "Pay at Counter",
    name: "Pay at Counter",
    icon: FiTag,
    desc: "Reserve & pay at cinema"
  }
];

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve state passed from Seat Selection page
  const bookingData = location.state || {};
  const { seats, showtimeId, totalPrice } = bookingData;

  const [movieDetails, setMovieDetails] = useState(null);
  const [showtimeData, setShowtimeData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchMovieAndShowtimeInfo = async () => {
      if (!showtimeId) return;

      try {
        const showtimeRes = await axios.get(`${process.env.REACT_APP_API_URL}/showtimes/${showtimeId}`);
        const stData = showtimeRes.data;
        const actualStData = stData.data || stData;
        setShowtimeData(actualStData);

        let rawMovie = actualStData.movie || actualStData.movieId;
        let movieId = null;

        if (typeof rawMovie === 'object' && rawMovie.title) {
          setMovieDetails(rawMovie);
          return;
        } else if (typeof rawMovie === 'object' && rawMovie._id) {
          movieId = rawMovie._id;
        } else {
          movieId = rawMovie;
        }

        if (movieId) {
          const movieRes = await axios.get(`${process.env.REACT_APP_API_URL}/movies/${movieId}`);
          const mData = movieRes.data;
          setMovieDetails(mData.data || mData);
        } else {
          setMovieDetails({ title: "CineNova Premier Movie" });
        }
      } catch (err) {
        console.error("Error fetching showtime/movie details:", err);
        setMovieDetails({ title: "CineNova Movie Experience" });
      }
    };

    fetchMovieAndShowtimeInfo();
  }, [showtimeId]);

  // Helper to ensure MongoDB ObjectIds are never displayed in UI
  const isObjectId = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);

  const handleConfirmBooking = async () => {
    if (isProcessing) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to complete booking!");
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      const formattedSeats = seats
        ? (typeof seats[0] === 'string' ? seats : seats.map(s => `${s.row}${s.number}`))
        : [];

      // Navigate to Payment Checkout Page
      navigate(`/payment/checkout`, {
        state: {
          showtimeId: showtimeId,
          selectedSeats: formattedSeats,
          totalPrice: finalTotalPrice,
          movieTitle: movieTitle,
          showtime: startTime,
          date: formattedDate,
          hall: hallName,
          ticketPrice: unitPrice,
          paymentMethod: selectedPaymentMethod,
          movie: movieDetails || bookingData.movie
        }
      });
    } catch (error) {
      console.error("Navigation error:", error);
      alert("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const formattedSeatsList = seats
    ? (typeof seats[0] === 'string' ? seats : seats.map(s => `${s.row}${s.number}`))
    : [];
  const ticketCount = formattedSeatsList.length;

  const rawMovieTitle = bookingData.movieTitle || movieDetails?.title || bookingData.movie?.title;
  const movieTitle = (rawMovieTitle && !isObjectId(rawMovieTitle)) ? rawMovieTitle : "Featured Movie";
  const posterUrl = bookingData.movie?.posterUrl || movieDetails?.posterUrl;

  const rawHall = bookingData.hall || showtimeData?.hall?.name || showtimeData?.hallId?.name || showtimeData?.hallName || showtimeData?.type;
  const hallName = (rawHall && !isObjectId(rawHall)) ? rawHall : "Standard 2D";

  const rawTime = bookingData.showtime || showtimeData?.startTime || showtimeData?.time;
  const startTime = (rawTime && !isObjectId(rawTime)) ? rawTime : "07:30 PM";

  const rawDate = bookingData.date || showtimeData?.date;
  const formattedDate = (rawDate && !isObjectId(rawDate))
    ? (isNaN(new Date(rawDate).getTime())
        ? rawDate
        : new Date(rawDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    : "Today";

  const unitPrice = bookingData.ticketPrice || (ticketCount > 0 && totalPrice ? Math.round(totalPrice / ticketCount) : (showtimeData?.price || 2000));
  const finalTotalPrice = totalPrice || (ticketCount * unitPrice);

  return (
    <div className="checkout-page">
      {/* Top Header Controls */}
      <div className="checkout-header">
        <button
          className="back-nav-btn"
          onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            navigate(-1);
          }}
        >
          <FiArrowLeft /> Back
        </button>
        <div className="checkout-titles">
          <h1 className="main-checkout-title">Complete Your Booking</h1>
          <p className="main-checkout-subtitle">Review your booking details before payment.</p>
        </div>
      </div>

      {/* Two Column Layout Grid */}
      <div className="checkout-layout-grid">
        {/* Left Column: Large Glass Booking Summary Card */}
        <div className="checkout-summary-column">
          <div className="large-glass-card booking-summary-card">
            <h2 className="card-heading">Booking Summary</h2>

            <div className="summary-movie-header">
              <div className="movie-poster-frame">
                {posterUrl ? (
                  <img src={posterUrl} alt={movieTitle} className="checkout-poster" />
                ) : (
                  <div className="checkout-poster-fallback"><FiFilm /></div>
                )}
              </div>
              <div className="movie-header-info">
                <h3 className="summary-title">{movieTitle}</h3>
                <span className="summary-hall-tag"><FiFilm /> {hallName}</span>
              </div>
            </div>

            <div className="summary-details-grid">
              <div className="detail-item">
                <span className="item-label"><FiCalendar /> Date</span>
                <span className="item-value">{formattedDate}</span>
              </div>

              <div className="detail-item">
                <span className="item-label"><FiClock /> Showtime</span>
                <span className="item-value">{startTime}</span>
              </div>

              {/* Selected Seats displayed as Gold-Bordered Chips */}
              <div className="detail-item seats-detail-item">
                <span className="item-label"><FiCheckCircle /> Selected Seats</span>
                <div className="seats-chips-wrapper">
                  {formattedSeatsList.length > 0 ? (
                    formattedSeatsList.map((seatLabel) => (
                      <span key={seatLabel} className="seat-chip gold-chip">
                        {seatLabel}
                      </span>
                    ))
                  ) : (
                    <span className="item-value">None</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <span className="item-label">Number of Tickets</span>
                <span className="item-value">{ticketCount} {ticketCount === 1 ? 'Ticket' : 'Tickets'}</span>
              </div>

              <div className="detail-item">
                <span className="item-label">Ticket Price</span>
                <span className="item-value">Rs. {unitPrice}</span>
              </div>
            </div>

            <div className="summary-price-divider" />

            {/* Price Section */}
            <div className="total-price-section">
              <span className="price-title">Total Amount</span>
              <span className="large-gold-price">Rs. {finalTotalPrice || 0}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Section & Confirmation */}
        <div className="checkout-payment-column">
          {/* Selectable Payment Cards */}
          <div className="large-glass-card payment-methods-card">
            <h2 className="card-heading">Payment Method</h2>
            <p className="card-subheading">Select your preferred payment option.</p>

            <div className="payment-options-grid">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPaymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    className={`payment-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="option-icon-box">
                      <Icon />
                    </div>
                    <div className="option-info">
                      <span className="option-name">{method.name}</span>
                      <span className="option-desc">{method.desc}</span>
                    </div>
                    <div className="option-radio">
                      {isSelected && <div className="radio-inner" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Security Section */}
            <div className="security-note-banner">
              <FiShield className="security-icon" />
              <span>Your booking information is securely processed.</span>
            </div>

            {/* Large Gold Confirm Button */}
            <button
              onClick={handleConfirmBooking}
              className="confirm-booking-gold-btn"
              disabled={isProcessing}
            >
              {
                isProcessing
                  ? "Processing..."

                  : selectedPaymentMethod === "Credit Card"
                    ? "Continue to Payment"

                    : selectedPaymentMethod === "Mobile Banking"
                      ? "Continue to Banking"

                      : "Reserve Seats"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBookingPage;