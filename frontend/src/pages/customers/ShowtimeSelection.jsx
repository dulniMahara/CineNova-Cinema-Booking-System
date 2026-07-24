import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../../services/movieService";
import { getShowtimesByMovie } from "../../services/showtimeService";
import { getHalls } from "../../services/hallService"; // <--- Import Hall Service
import "./ShowtimeSelection.css";

const ShowtimeSelection = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [halls, setHalls] = useState([]); // <--- State to store Halls lookup
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Movie Details
        const movieData = await getMovieById(movieId);
        setMovie(movieData);

        // 2. Fetch Showtimes
        const showtimeData = await getShowtimesByMovie(movieId);
        const allShowtimes = showtimeData.data || [];
        setShowtimes(allShowtimes);

        // 3. Fetch Halls (To lookup names if backend sends IDs)
        const hallData = await getHalls();
        setHalls(hallData.data || []);

        // 4. Set Default Date (prefer today if available, else first future date)
        if (allShowtimes.length > 0) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const dates = [...new Set(allShowtimes.map(st => new Date(st.date).toDateString()))]
              .filter(dateStr => {
                const dateObj = new Date(dateStr);
                dateObj.setHours(0,0,0,0);
                return dateObj >= today;
              });
            dates.sort((a, b) => new Date(a) - new Date(b));
            const todayStr = today.toDateString();
            if (dates.includes(todayStr)) {
              setSelectedDate(todayStr);
            } else if (dates.length > 0) {
              setSelectedDate(dates[0]);
            }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  if (loading) return <div className="loading-screen">Loading showtimes...</div>;
  if (!movie) return <div className="error-screen">Movie not found</div>;


  // Only show today and future dates
  const today = new Date();
  today.setHours(0,0,0,0); // Remove time part for accurate comparison
  const uniqueDates = [...new Set(showtimes.map(st => new Date(st.date).toDateString()))]
    .filter(dateStr => {
      const dateObj = new Date(dateStr);
      dateObj.setHours(0,0,0,0);
      return dateObj >= today;
    });
  uniqueDates.sort((a, b) => new Date(a) - new Date(b));

  const showtimesForDate = showtimes.filter(
    st => new Date(st.date).toDateString() === selectedDate
  );

  // --- ROBUST GROUPING LOGIC ---
  const showtimesByHall = showtimesForDate.reduce((acc, st) => {
    let hallName = "Unknown Hall";

    // Case A: Hall is populated (Object with name)
    if (st.hall && st.hall.name) {
        hallName = st.hall.name;
    } 
    // Case B: Hall is just an ID (String) -> Lookup in 'halls' array
    else if (st.hall) {
        const foundHall = halls.find(h => h._id === st.hall);
        if (foundHall) hallName = foundHall.name;
    }

    if (!acc[hallName]) acc[hallName] = [];
    acc[hallName].push(st);
    return acc;
  }, {});
  // -----------------------------

  const handleTimeClick = (showtimeId) => {
    navigate(`/booking/${showtimeId}`);
  };

  return (
    <div className="selection-page">
      {/* HEADER - UNCHANGED */}
      <div 
        className="selection-header-banner"
        style={{ backgroundImage: `linear-gradient(to right, rgba(11, 15, 25, 0.95), rgba(11, 15, 25, 0.8)), url(${movie.posterUrl})` }}
      >
        <div className="header-container">
          <div className="header-poster-wrapper">
              {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="header-poster" />
              ) : (
                  <div className="placeholder-poster">No Image</div>
              )}
          </div>
          
          <div className="header-content">
            <h1>{movie.title}</h1>
            <div className="meta-tags">
                <span className="tag rating">⭐ {movie.rating}</span>
                <span className="tag">{movie.duration} mins</span>
            </div>
            <p className="genres">
              {Array.isArray(movie.genre) ? movie.genre.join(" | ") : movie.genre}
            </p>
          </div>
        </div>
      </div>

      {/* DATE BAR - UNCHANGED */}
      <div className="date-bar-container">
        <div className="date-bar">
            {uniqueDates.length === 0 ? (
                <div className="no-dates">No dates available</div>
            ) : (
                uniqueDates.map((dateStr) => {
                    const dateObj = new Date(dateStr);
                    const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); 
                    const dayNum = dateObj.getDate(); 
                    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                    const isActive = selectedDate === dateStr;

                    return (
                        <button 
                            key={dateStr} 
                            className={`date-card ${isActive ? "active" : ""}`}
                            onClick={() => setSelectedDate(dateStr)}
                        >
                            <span className="date-month">{month}</span>
                            <span className="date-num">{dayNum}</span>
                            <span className="date-day">{day}</span>
                        </button>
                    );
                })
            )}
        </div>
      </div>

      {/* --- HALL & TIMES SECTION (SCOPE LAYOUT) --- */}
      <div className="times-container">
        {Object.keys(showtimesByHall).length === 0 ? (
            <div className="no-showtimes-msg">
                <h3>No showtimes scheduled for this date.</h3>
                <p>Please select another date above.</p>
            </div>
        ) : (
            Object.keys(showtimesByHall).map((hallName) => (
                <div key={hallName} className="scope-hall-row">
                    
                    {/* LEFT COL: Hall Name */}
                    <div className="hall-left-col">
                        <h2 className="scope-hall-name">{hallName}</h2>
                        <span className="scope-subtitle">Digital Experience</span>
                    </div>

                    {/* RIGHT COL: Buttons */}
                    <div className="hall-right-col">
                        <div className="time-grid">
                          {showtimesByHall[hallName].map((st) => {
                            // Combine date and startTime to get the full showtime datetime
                            const showDate = new Date(st.date);
                            // Assume st.startTime is in format 'HH:mm AM/PM' (e.g., '10:15 AM')
                            const [time, modifier] = st.startTime.split(' ');
                            let [hours, minutes] = time.split(':');
                            hours = parseInt(hours, 10);
                            minutes = parseInt(minutes, 10);
                            if (modifier === 'PM' && hours !== 12) hours += 12;
                            if (modifier === 'AM' && hours === 12) hours = 0;
                            showDate.setHours(hours, minutes, 0, 0);
                            const now = new Date();
                            const isPast = showDate < now;
                            return (
                              <button
                                key={st._id}
                                className={`scope-time-btn${isPast ? ' locked' : ''}`}
                                onClick={() => handleTimeClick(st._id)}
                                disabled={isPast}
                              >
                                <span className="time-text">{st.startTime}</span>
                                <span className="price-text">Rs. {st.price}</span>
                              </button>
                            );
                          })}
                        </div>
                    </div>

                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ShowtimeSelection;