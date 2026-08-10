import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createShowtime, getShowtimes } from "../../services/showtimeService";
import { getMovies } from "../../services/movieService";
import "./MovieForm.css";
import axios from "axios";

const getHallCapacity = (hall) => {
  if (!hall) return "N/A";
  if (typeof hall.seatCapacity === "number" && hall.seatCapacity > 0) {
    return hall.seatCapacity;
  }
  if (Array.isArray(hall.seatLayout)) {
    const activeSeats = hall.seatLayout.flat().filter(s => s === 1).length;
    if (activeSeats > 0) return activeSeats;
  }
  if (hall.totalRows && hall.totalCols) {
    return hall.totalRows * hall.totalCols;
  }
  return "N/A";
};

const AddShowtimeForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    movie: "",
    hall: "",
    date: "",
    startTime: "",
    price: "",
  });

  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [existingShowtimes, setExistingShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieData = await getMovies();
        setMovies(Array.isArray(movieData) ? movieData : []);

        const hallRes = await axios.get(`${process.env.REACT_APP_API_URL}/halls`);
        setHalls(hallRes.data.data || []);

        const stRes = await getShowtimes();
        const stData = stRes.data ? stRes.data : stRes;
        setExistingShowtimes(Array.isArray(stData) ? stData : []);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setErrorMsg("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (!formData.movie || !formData.hall || !formData.date || !formData.startTime || !formData.price) {
        setErrorMsg("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const numPrice = Number(formData.price);
      if (isNaN(numPrice) || numPrice <= 0) {
        setErrorMsg("Please enter a valid positive ticket price.");
        setLoading(false);
        return;
      }

      // Conflict validation: A hall cannot have two screenings at the exact same date & start time
      const isConflict = existingShowtimes.some((st) => {
        const stHallId = String(st.hall?._id || st.hall);
        const stDateStr = String(st.date).split("T")[0];
        return (
          stHallId === String(formData.hall) &&
          stDateStr === String(formData.date) &&
          String(st.startTime).trim() === String(formData.startTime).trim()
        );
      });

      if (isConflict) {
        setErrorMsg("This hall already has a showtime scheduled for the selected date and time.");
        setLoading(false);
        return;
      }

      const payload = {
        movie: formData.movie,
        hall: formData.hall,
        date: formData.date,
        startTime: formData.startTime,
        price: numPrice,
      };

      await createShowtime(payload);
      navigate("/admin/showtimes");
    } catch (err) {
      console.error("Error creating showtime:", err);
      const msg = err.response?.data?.message || "Failed to add showtime";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movieform-page">
      <div className="movieform-wrapper">

        <div className="form-header-bar">
          <button className="btn-back-link" onClick={() => navigate("/admin/showtimes")}>
            ← Back to Showtime Management
          </button>
          <h1 className="movieform-title">Add New Showtime</h1>
          <p className="movieform-subtitle">Schedule a movie screening for CineNova halls.</p>
        </div>

        <form onSubmit={handleSubmit} className="movieform-form">

          {errorMsg && (
            <div className="form-error-banner">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Section 1: Screening Details */}
          <div className="form-fieldset">
            <h3 className="fieldset-title">Screening Details</h3>

            <div className="form-group">
              <label htmlFor="movie">Select Movie <span className="req-star">*</span></label>
              <select
                id="movie"
                name="movie"
                value={formData.movie}
                onChange={handleChange}
                required
              >
                <option value="">-- Select a Movie --</option>
                {movies.map((movie) => (
                  <option key={movie._id} value={movie._id}>
                    {movie.title} ({movie.duration || "120"} min)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="hall">Select Cinema Hall <span className="req-star">*</span></label>
              <select
                id="hall"
                name="hall"
                value={formData.hall}
                onChange={handleChange}
                required
              >
                <option value="">-- Select a Cinema Hall --</option>
                {halls.map((hall) => (
                  <option key={hall._id} value={hall._id}>
                    {hall.name} - {hall.screenType || "Standard"} (Capacity: {getHallCapacity(hall)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Pricing & Schedule */}
          <div className="form-fieldset">
            <h3 className="fieldset-title">Schedule & Pricing</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Screening Date <span className="req-star">*</span></label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Start Time <span className="req-star">*</span></label>
                <input
                  id="startTime"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Ticket Price (Rs) <span className="req-star">*</span></label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  placeholder="e.g. 1800"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-bar">
            <button
              type="button"
              className="btn-cancel-form"
              onClick={() => navigate("/admin/showtimes")}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="movieform-submit-btn" disabled={loading}>
              {loading ? "Adding Showtime..." : "Save & Schedule Showtime"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddShowtimeForm;