import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getShowtimeById, updateShowtime, getShowtimes } from "../../services/showtimeService";
import { getMovies } from "../../services/movieService";
import "./MovieForm.css";
import axios from "axios";

const EditShowtimeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

        const response = await getShowtimeById(id);
        const showtime = response.data || response;

        const formattedDate = showtime.date ? new Date(showtime.date).toISOString().split("T")[0] : "";

        setFormData({
          movie: showtime.movie?._id || showtime.movie,
          hall: showtime.hall?._id || showtime.hall,
          date: formattedDate,
          startTime: showtime.startTime || "",
          price: showtime.price || "",
        });
      } catch (err) {
        console.error("Failed to load showtime data", err);
        setErrorMsg("Error loading showtime details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setErrorMsg("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrorMsg("");

    try {
      if (!formData.movie || !formData.hall || !formData.date || !formData.startTime || !formData.price) {
        setErrorMsg("Please fill in all required fields.");
        setUpdating(false);
        return;
      }

      const numPrice = Number(formData.price);
      if (isNaN(numPrice) || numPrice <= 0) {
        setErrorMsg("Please enter a valid positive ticket price.");
        setUpdating(false);
        return;
      }

      // Conflict check: Ensure another showtime for the same hall isn't scheduled at the exact same date & time
      const isConflict = existingShowtimes.some((st) => {
        if (st._id === id) return false;
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
        setUpdating(false);
        return;
      }

      const payload = {
        movie: formData.movie,
        hall: formData.hall,
        date: formData.date,
        startTime: formData.startTime,
        price: numPrice,
      };

      await updateShowtime(id, payload);
      navigate("/admin/showtimes");
    } catch (err) {
      console.error("Error updating showtime:", err);
      setErrorMsg(err.response?.data?.message || "Failed to update showtime.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="movieform-page" style={{ color: "white" }}>Loading showtime details...</div>;

  return (
    <div className="movieform-page">
      <div className="movieform-wrapper">

        <div className="form-header-bar">
          <button className="btn-back-link" onClick={() => navigate("/admin/showtimes")}>
            ← Back to Showtime Management
          </button>
          <h1 className="movieform-title">Edit Showtime</h1>
          <p className="movieform-subtitle">Update screening schedule or ticket pricing.</p>
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
                    {hall.name} - {hall.screenType || "Standard"} (Capacity: {hall.seatCapacity || "N/A"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Schedule & Pricing */}
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
              disabled={updating}
            >
              Cancel
            </button>
            <button type="submit" className="movieform-submit-btn" disabled={updating}>
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditShowtimeForm;