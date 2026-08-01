import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FiArrowLeft,
  FiFilm,
  FiClock,
  FiCalendar,
  FiTag,
  FiCheckCircle,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi';
import './SeatMap.css';

// Custom Scalable Cinema Chair SVG Component
const CinemaChairIcon = ({ number, status, isSelected }) => {
  return (
    <div className={`chair-wrapper ${status} ${isSelected ? 'selected' : ''}`}>
      <svg viewBox="0 0 40 42" className="chair-svg">
        {/* Armrest Left */}
        <rect className="chair-arm" x="2" y="18" width="4" height="18" rx="2" />
        {/* Armrest Right */}
        <rect className="chair-arm" x="34" y="18" width="4" height="18" rx="2" />
        {/* Backrest */}
        <rect className="chair-backrest" x="7" y="2" width="26" height="22" rx="6" />
        {/* Cushion Base */}
        <rect className="chair-cushion" x="6" y="22" width="28" height="14" rx="4" />
      </svg>
      {number && <span className="chair-number">{number}</span>}
    </div>
  );
};

const isValidObjectId = (value) =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  // Extract optional initial details from location state
  const passedMovie = location.state?.movie;
  const passedShowtime = location.state?.showtime;

  // 1. Fetch real seats by showtimeId
  useEffect(() => {
    const fetchSeatsAndDetails = async () => {
      if (!showtimeId || !isValidObjectId(showtimeId)) {
        setErrorMessage("Unable to load seats: Invalid showtime ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        const seatsRes = await axios.get(`${process.env.REACT_APP_API_URL}/seats/${showtimeId}`);
        const raw = seatsRes.data;
        const seatsData = Array.isArray(raw) ? raw : (raw?.data || raw?.seats || []);

        if (!seatsData || seatsData.length === 0) {
          setErrorMessage("Unable to load seats for this showtime.");
          setSeats([]);
        } else {
          setSeats(seatsData);
        }

        // Fetch showtime details if available
        try {
          const stDetailRes = await axios.get(`${process.env.REACT_APP_API_URL}/showtimes/${showtimeId}`);
          const stRaw = stDetailRes.data;
          setShowtimeDetails(stRaw.data || stRaw);
        } catch (e) {
          // Keep location state showtime if detail fetch fails
        }
      } catch (err) {
        console.error("Error fetching seats:", err);
        setErrorMessage("Unable to load seats for this showtime.");
        setSeats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSeatsAndDetails();
  }, [showtimeId]);

  // 2. Handle Clicking a Seat
  const handleSeatClick = (seat) => {
    const isBooked =
      (seat.status && seat.status.toLowerCase() === 'booked') ||
      seat.isBooked === true ||
      seat.booked === true ||
      seat.status === 'locked';

    if (isBooked) return;

    if (selectedSeatIds.includes(seat._id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat._id));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seat._id]);
    }
  };

  // Derive movie metadata dynamically from state / fetched showtime
  // Helper to ensure MongoDB ObjectIds are never displayed in UI
  const isObjectId = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);

  // Derive movie metadata dynamically from state / fetched showtime
  const movieObj = passedMovie || showtimeDetails?.movieId || showtimeDetails?.movie || {};
  const rawMovieTitle = movieObj.title || showtimeDetails?.movieTitle || showtimeDetails?.title;
  const movieTitle = (rawMovieTitle && !isObjectId(rawMovieTitle)) ? rawMovieTitle : "Movie Ticket";
  const posterUrl = movieObj.posterUrl || showtimeDetails?.posterUrl || showtimeDetails?.movieId?.posterUrl || showtimeDetails?.movie?.posterUrl;

  // Selected Date
  const rawDate = passedShowtime?.date || showtimeDetails?.date;
  const formattedDate = (rawDate && !isObjectId(rawDate) && !isNaN(new Date(rawDate).getTime()))
    ? new Date(rawDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : "Today";

  // Selected Showtime
  const rawStartTime = passedShowtime?.startTime || passedShowtime?.time || showtimeDetails?.startTime;
  const startTime = (rawStartTime && !isObjectId(rawStartTime)) ? rawStartTime : "07:30 PM";

  // Hall / Type
  const hallObj = passedShowtime?.hall || showtimeDetails?.hallId || showtimeDetails?.hall;
  const rawHallName = typeof hallObj === 'object' && hallObj?.name
    ? hallObj.name
    : (passedShowtime?.type || passedShowtime?.hallName || showtimeDetails?.type || showtimeDetails?.hallName || (typeof hallObj === 'string' ? hallObj : "Standard 2D"));

  const hallName = (rawHallName && !isObjectId(rawHallName)) ? rawHallName : "Standard 2D";

  // Duration
  const durationText = movieObj.duration ? `${movieObj.duration} mins` : (showtimeDetails?.duration ? `${showtimeDetails.duration} mins` : "120 mins");

  // Actual ticket price per seat
  const actualPricePerSeat = passedShowtime?.price || showtimeDetails?.price || (seats.length > 0 ? seats[0].price : 2000);

  const selectedSeats = seats.filter(seat => selectedSeatIds.includes(seat._id));
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || actualPricePerSeat), 0);
  const ticketPrice = actualPricePerSeat;

  // 3. Handle Payment / Booking Submission
  const handlePayment = () => {
    if (selectedSeatIds.length === 0) {
      alert("Please select at least one seat!");
      return;
    }

    if (!showtimeId || !isValidObjectId(showtimeId)) {
      alert("Invalid showtime reference. Please go back and re-select your showtime.");
      return;
    }

    const hasInvalidSeats = selectedSeats.some(s => !s._id || !isValidObjectId(s._id));
    if (hasInvalidSeats) {
      alert("Unable to proceed with unverified seats. Please refresh and try again.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to continue with booking!");
      navigate('/login');
      return;
    }

    navigate(`/buy-tickets/${showtimeId}`, {
      state: {
        seats: selectedSeats,
        showtimeId: showtimeId,
        totalPrice: totalPrice,
        movieTitle: movieTitle,
        showtime: startTime,
        date: formattedDate,
        hall: hallName,
        ticketPrice: ticketPrice,
        movie: movieObj
      }
    });
  };

  if (loading) {
    return (
      <div className="seat-selection-page loading-state">
        <div className="seat-loading-spinner">
          <div className="spinner-ring"></div>
          <p>Loading cinema hall layout...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="seat-selection-page error-state" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Unable to load seats for this showtime</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{errorMessage}</p>
        <button className="back-nav-btn" onClick={() => navigate(-1)} style={{ margin: '0 auto', display: 'inline-flex' }}>
          <FiArrowLeft /> Return to Movie Details
        </button>
      </div>
    );
  }

  // Group seats by row
  const rows = [...new Set(seats.map(s => s.row))].sort();

  return (
    <div className="seat-selection-page">
      {/* Top Header Controls */}
      <div className="seat-page-header">
        <button className="back-nav-btn" onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); navigate(-1); }}>
          <FiArrowLeft /> Back
        </button>
        <div className="header-titles">
          <h1 className="header-main-title">Select Your Seats</h1>
          <p className="header-subtitle">Choose your preferred seats and continue to checkout.</p>
        </div>
      </div>

      {/* Featured Movie / Summary Compact Glass Card */}
      <div className="movie-summary-card">
        <div className="summary-poster-box">
          {posterUrl ? (
            <img src={posterUrl} alt={movieTitle} className="summary-poster" />
          ) : (
            <div className="summary-poster-fallback"><FiFilm /></div>
          )}
        </div>
        <div className="summary-details">
          <h3 className="summary-movie-title">{movieTitle}</h3>
          <div className="summary-meta-grid">
            <span className="meta-item"><FiFilm /> {hallName}</span>
            <span className="meta-item"><FiCalendar /> {formattedDate}</span>
            <span className="meta-item"><FiClock /> {startTime}</span>
            <span className="meta-item"><FiClock /> {durationText}</span>
            <span className="meta-item price-meta"><FiTag /> Rs. {ticketPrice} / seat</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid (Seats + Booking Summary) */}
      <div className="selection-layout-grid">
        <div className="seat-map-column">
          {/* Cinema Screen with Soft Glow & 3D Arc */}
          <div className="screen-wrapper">
            <div className="curved-screen-arch">
              <span className="screen-label">SCREEN</span>
            </div>
            <div className="screen-soft-glow"></div>
          </div>

          {/* Seat Legend */}
          <div className="modern-seat-legend">
            <div className="legend-chip">
              <CinemaChairIcon status="available" />
              <span>Available</span>
            </div>
            <div className="legend-chip">
              <CinemaChairIcon status="selected" isSelected={true} />
              <span>Selected</span>
            </div>
            <div className="legend-chip">
              <CinemaChairIcon status="booked" />
              <span>Occupied</span>
            </div>
            <div className="legend-chip">
              <CinemaChairIcon status="vip" />
              <span>VIP</span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="seat-grid-container">
            {rows.map(row => {
              const rowSeats = seats.filter(s => s.row === row);
              const maxSeatNr = Math.max(...rowSeats.map(s => s.number));
              const renderSlots = Array.from({ length: maxSeatNr }, (_, i) => i + 1);

              return (
                <div key={row} className="seat-grid-row">
                  <span className="row-identifier">{row}</span>

                  <div className="row-seats-list">
                    {renderSlots.map(seatNum => {
                      const seat = rowSeats.find(s => s.number === seatNum);

                      if (!seat) {
                        return <div key={`gap-${row}-${seatNum}`} className="seat-slot gap" />;
                      }

                      const isSelected = selectedSeatIds.includes(seat._id);
                      const isBooked =
                        (seat.status && seat.status.toLowerCase() === 'booked') ||
                        seat.isBooked === true ||
                        seat.booked === true ||
                        seat.status === 'locked';

                      const statusClass = isBooked ? 'booked' : isSelected ? 'selected' : 'available';

                      return (
                        <button
                          key={seat._id}
                          className={`seat-button-slot ${statusClass}`}
                          onClick={() => handleSeatClick(seat)}
                          disabled={isBooked}
                          title={`Row ${seat.row} - Seat ${seat.number} (Rs. ${seat.price || ticketPrice})`}
                        >
                          <CinemaChairIcon
                            number={seat.number}
                            status={statusClass}
                            isSelected={isSelected}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <span className="row-identifier right">{row}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Glass Booking Summary Side/Bottom Card */}
        <div className={`booking-summary-sidebar ${summaryExpanded ? 'expanded' : 'collapsed'}`}>
          <div className="sidebar-header" onClick={() => setSummaryExpanded(!summaryExpanded)}>
            <div className="sidebar-header-title">
              <FiCheckCircle className="summary-check-icon" />
              <h3>Booking Summary</h3>
            </div>
            <button className="collapse-toggle-btn">
              {summaryExpanded ? <FiChevronDown /> : <FiChevronUp />}
            </button>
          </div>

          <div className="sidebar-body">
            <div className="summary-row">
              <span className="label">Movie</span>
              <span className="value movie-name-value">{movieTitle}</span>
            </div>

            <div className="summary-row">
              <span className="label">Selected Seats</span>
              <span className="value seats-list-value">
                {selectedSeats.length > 0
                  ? selectedSeats.map(s => `${s.row}${s.number}`).join(', ')
                  : 'None'}
              </span>
            </div>

            <div className="summary-row">
              <span className="label">Tickets</span>
              <span className="value">{selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'}</span>
            </div>

            <div className="summary-row">
              <span className="label">Price per Ticket</span>
              <span className="value">Rs. {ticketPrice}</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row total-row">
              <span className="label">Total Amount</span>
              <span className="value total-amount-value">Rs. {totalPrice}</span>
            </div>

            <button
              className="continue-pay-btn"
              onClick={handlePayment}
              disabled={selectedSeatIds.length === 0}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;