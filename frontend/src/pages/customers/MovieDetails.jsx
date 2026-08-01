import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getMovieById, getMovies } from "../../services/movieService";
import { getShowtimesByMovie } from "../../services/showtimeService";
import MovieCard from "../../components/MovieCard";
import {
  FiClock,
  FiFilm,
  FiStar,
  FiGlobe,
  FiCalendar,
  FiPlay,
  FiBookmark,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import "./MovieDetails.css";

// Dynamic upcoming 7 days dates generator
const generateUpcomingDates = () => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [realShowtimes, setRealShowtimes] = useState([]);

  const upcomingDates = useMemo(() => generateUpcomingDates(), []);
  const [selectedDateObj, setSelectedDateObj] = useState(upcomingDates[0]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      try {
        const data = await getMovieById(id);
        setMovie(data);

        // Fetch real showtimes for this movie if available
        if (typeof getShowtimesByMovie === "function") {
          try {
            const stRes = await getShowtimesByMovie(id);
            const stData = stRes?.data || stRes || [];
            if (Array.isArray(stData) && stData.length > 0) {
              setRealShowtimes(stData);
            }
          } catch (e) {
            // Silently fallback to dynamic generator
          }
        }

        // Fetch related movies
        if (typeof getMovies === "function") {
          try {
            const allMovies = await getMovies();
            if (Array.isArray(allMovies)) {
              const filtered = allMovies.filter((m) => m && m._id !== id);
              setRelatedMovies(filtered);
            }
          } catch (err) {
            // Silently handle if getMovies is not available
          }
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const scrollToShowtimesSection = () => {
    const el = document.getElementById("showtimes-section") || document.getElementById("showtimes");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("showtime-section-highlight");
      setTimeout(() => {
        el.classList.remove("showtime-section-highlight");
      }, 2500);
    }
  };

  // Auto scroll and highlight showtime section if requested from Home prompt
  useEffect(() => {
    if (!loading && (location.hash === "#showtimes" || location.state?.scrollToShowtimes)) {
      const timer = setTimeout(() => {
        scrollToShowtimesSection();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [loading, location.hash, location.state]);

  // Handle Escape key to close trailer modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showTrailer) {
        setShowTrailer(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showTrailer]);

  const isValidObjectId = (value) =>
    typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

  // Compute showtimes for currently selected date
  const getShowtimesForDate = (dateObj) => {
    const dateStr = dateObj.toDateString();
    const isoDateStr = dateObj.toISOString();

    // Match backend showtimes only
    const matchingReal = realShowtimes.filter(st => new Date(st.date).toDateString() === dateStr);
    return matchingReal.map(st => ({
      id: st._id,
      _id: st._id,
      time: st.startTime,
      startTime: st.startTime,
      type: st.hall?.name || st.type || "Standard 2D",
      price: st.price || 2000,
      date: st.date || isoDateStr,
      rawShowtime: st
    }));
  };

  const currentAvailableShowtimes = getShowtimesForDate(selectedDateObj);
  const activeShowtime = currentAvailableShowtimes.find(s => s.id === selectedShowtimeId) || (selectedShowtimeId ? currentAvailableShowtimes[0] : null);

  const handleHeroBookClick = () => {
    if (selectedShowtimeId && activeShowtime) {
      handleBooking(activeShowtime);
    } else {
      scrollToShowtimesSection();
    }
  };

  const handleBooking = (stObj) => {
    const chosenSt = stObj || activeShowtime || currentAvailableShowtimes[0];
    const realId = chosenSt?._id || chosenSt?.id;

    if (!realId || !isValidObjectId(realId)) {
      alert("No valid showtime selected or scheduled for this date.");
      return;
    }

    const showtimePayload = chosenSt.rawShowtime || {
      ...chosenSt,
      _id: realId,
      startTime: chosenSt.time || chosenSt.startTime || "07:30 PM",
      date: chosenSt.date || selectedDateObj.toISOString(),
      type: chosenSt.type || "Standard 2D",
      price: chosenSt.price || 2000
    };

    navigate(`/booking/${realId}`, {
      state: {
        movie: movie,
        showtime: showtimePayload
      }
    });
  };

  if (loading) {
    return (
      <div className="movie-details-page loading-state">
        <div className="details-spinner">
          <div className="spinner-ring"></div>
          <p>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-details-page not-found-state">
        <h2>Movie not found</h2>
        <button className="back-btn" onClick={() => navigate("/movies")}>
          Back to Movies
        </button>
      </div>
    );
  }

  const genreText = Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre;
  const isComingSoon = movie.status === "soon";
  const backdropImage = movie.backdropUrl || movie.posterUrl;

  const scrollCarousel = (direction) => {
    const container = document.getElementById("related-movies-carousel");
    if (container) {
      const scrollAmount = direction === "left" ? -320 : 320;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="movie-details-page">
      {/* Hero Section with Backdrop Image */}
      <section
        className="details-hero"
        style={{
          backgroundImage: backdropImage ? `url(${backdropImage})` : "none"
        }}
      >
        <div className="hero-overlay"></div>

        <div className="hero-content-container">
          {/* Poster Column */}
          <div className="hero-poster-wrapper">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="hero-poster" />
            ) : (
              <div className="poster-fallback-hero">
                <FiFilm />
                <span>{movie.title}</span>
              </div>
            )}
            <div className="poster-glow"></div>
          </div>

          {/* Details Column */}
          <div className="hero-info">
            <div className="status-badge-row">
              <span className={`status-chip ${isComingSoon ? "soon" : "now"}`}>
                {isComingSoon ? "Coming Soon" : "Now Showing"}
              </span>
              {movie.rating !== undefined && movie.rating !== null && (
                <span className="rating-chip">★ {movie.rating} / 10</span>
              )}
            </div>

            <h1 className="movie-title">{movie.title}</h1>

            {/* Combined Meta string */}
            <div className="movie-meta-summary">
              {genreText} | {movie.duration} mins | {movie.rating}
            </div>

            {movie.description && (
              <div className="movie-description">
                <p>{movie.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="hero-buttons">
              <button className="book-btn primary-gold-btn" onClick={handleHeroBookClick}>
                <FiBookmark className="btn-icon" /> Book Tickets
                <span className="sr-only">Book Now</span>
              </button>

              <button
                className="trailer-btn glass-btn"
                onClick={() => navigate(`/trailer/${movie?._id || id}`, { state: { movie } })}
              >
                <FiPlay className="btn-icon" /> Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Movie Information Section (Glass Cards) */}
      <section className="details-section">
        <h2 className="section-title">Movie Information</h2>
        <div className="info-cards-grid">
          <div className="info-card">
            <div className="info-icon-box">
              <FiClock />
            </div>
            <div className="info-card-content">
              <span className="info-label">Runtime</span>
              <span className="info-value">{movie.duration ? `${movie.duration} mins` : "N/A"}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon-box">
              <FiFilm />
            </div>
            <div className="info-card-content">
              <span className="info-label">Genres</span>
              <span className="info-value">{genreText || "N/A"}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon-box">
              <FiStar />
            </div>
            <div className="info-card-content">
              <span className="info-label">Rating</span>
              <span className="info-value">{movie.rating ? `${movie.rating} / 10` : "N/A"}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon-box">
              <FiGlobe />
            </div>
            <div className="info-card-content">
              <span className="info-label">Language</span>
              <span className="info-value">{movie.language || "English"}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon-box">
              <FiCalendar />
            </div>
            <div className="info-card-content">
              <span className="info-label">Status</span>
              <span className="info-value">{isComingSoon ? "Coming Soon" : "Now Showing"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Showtimes & Date Picker Section */}
      <section className="details-section showtimes-section" id="showtimes-section">
        <h2 className="section-title">Available Showtimes</h2>

        {/* Date Tabs Bar */}
        <div className="date-picker-bar">
          {upcomingDates.map((dateObj) => {
            const isSelected = selectedDateObj.toDateString() === dateObj.toDateString();
            const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
            const dayNum = dateObj.getDate();
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <button
                key={dateObj.toDateString()}
                className={`date-tab-card ${isSelected ? "active" : ""}`}
                onClick={() => {
                  setSelectedDateObj(dateObj);
                  const firstSt = getShowtimesForDate(dateObj)[0];
                  if (firstSt) setSelectedShowtimeId(firstSt.id);
                }}
              >
                <span className="date-tab-month">{month}</span>
                <span className="date-tab-num">{dayNum}</span>
                <span className="date-tab-day">{dayName}</span>
              </button>
            );
          })}
        </div>

        {/* Available Showtimes for Selected Date */}
        <div className="showtimes-container">
          {currentAvailableShowtimes.length === 0 ? (
            <div className="no-showtimes-msg" style={{ padding: '20px', color: '#94a3b8' }}>
              No showtimes scheduled for this date.
            </div>
          ) : (
            currentAvailableShowtimes.map((st) => {
              const isSelected = (selectedShowtimeId === st.id) || (!selectedShowtimeId && st === activeShowtime);
              return (
                <button
                  key={st.id}
                  className={`showtime-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedShowtimeId(st.id);
                    handleBooking(st);
                  }}
                >
                  <div className="btn-time-row">
                    <FiClock className="time-icon" />
                    <span className="time-text">{st.time || st.startTime}</span>
                  </div>
                  <div className="btn-meta-row">
                    <span className="type-badge"><FiFilm className="meta-icon" /> {st.type}</span>
                    <span className="price-tag">Rs. {st.price}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Related Movies Section */}
      {relatedMovies.length > 0 && (
        <section className="details-section related-section">
          <div className="related-header">
            <h2 className="section-title">You May Also Like</h2>
            <div className="carousel-nav-btns">
              <button className="carousel-btn" onClick={() => scrollCarousel("left")}>
                <FiChevronLeft />
              </button>
              <button className="carousel-btn" onClick={() => scrollCarousel("right")}>
                <FiChevronRight />
              </button>
            </div>
          </div>

          <div className="carousel-container" id="related-movies-carousel">
            {relatedMovies.map((relMovie) => (
              <div key={relMovie._id} className="carousel-item">
                <MovieCard movie={relMovie} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MovieDetails;