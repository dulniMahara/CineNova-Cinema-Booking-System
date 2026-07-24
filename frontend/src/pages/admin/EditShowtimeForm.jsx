import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getShowtimeById, updateShowtime } from "../../services/showtimeService";
import { getMovies } from "../../services/movieService"; 
import "./MovieForm.css"; 

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const movieData = await getMovies();
        setMovies(movieData);

        const response = await getShowtimeById(id);
        const showtime = response.data || response; 
        
        const formattedDate = showtime.date ? new Date(showtime.date).toISOString().split('T')[0] : "";

        setFormData({
          movie: showtime.movie?._id || showtime.movie, 
          hall: showtime.hall?._id || showtime.hall,
          date: formattedDate,
          startTime: showtime.startTime,
          price: showtime.price
        });
      } catch (err) {
        console.error("Failed to load data", err);
        alert("Error loading showtime details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateShowtime(id, formData);
      alert("Showtime updated successfully!");
      navigate("/admin/showtimes"); 
    } catch (err) {
      console.error(err);
      alert("Failed to update showtime.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="movieform-page" style={{color: 'white'}}>Loading...</div>;

  return (
    <div className="movieform-page">
      <div className="movieform-wrapper">
        <h1 className="movieform-title">Edit Showtime</h1>
        
        <form onSubmit={handleSubmit} className="movieform-form">
          
          <label>Select Movie</label>
          <select 
            name="movie" 
            value={formData.movie} 
            onChange={handleChange} 
            required
          >
            <option value="">-- Select a Movie --</option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.title}
              </option>
            ))}
          </select>

          <label>Cinema Hall ID</label>
          <input
            type="text"
            name="hall"
            value={formData.hall}
            onChange={handleChange}
            required
          />

          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <label>Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />

          <label>Ticket Price (Rs)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <button type="submit" className="movieform-submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Showtime"}
          </button>
          
          <button 
            type="button" 
            className="movieform-submit-btn" 
            style={{ backgroundColor: "#555", marginTop: "10px" }}
            onClick={() => navigate("/admin/showtimes")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditShowtimeForm;