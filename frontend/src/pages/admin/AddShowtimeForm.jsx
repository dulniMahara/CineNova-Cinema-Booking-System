import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createShowtime } from "../../services/showtimeService";
import { getMovies } from "../../services/movieService"; 
import "./MovieForm.css"; 
import axios from "axios"; 

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);

        const hallRes = await axios.get(`${process.env.REACT_APP_API_URL}/halls`);
        setHalls(hallRes.data.data || []);

      } catch (err) {
        console.error("Failed to load movies", err);
      }
    };
    fetchMovies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      
      const payload = {
        movie: formData.movie,
        hall: formData.hall,
        date: formData.date,
        startTime: formData.startTime,
        price: formData.price
      };

      await createShowtime(payload);
      alert("Showtime added successfully!");
      navigate("/admin/showtimes"); 
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to add showtime";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movieform-page">
      <div className="movieform-wrapper">
        <h1 className="movieform-title">Add New Showtime</h1>
        
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
          <select
            name="hall"
            value={formData.hall}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Hall --</option>
            {halls.map((hall) => (
              <option key={hall._id} value={hall._id}>
                {hall.name} (Capacity: {hall.seatCapacity})
              </option>
            ))}
          </select>

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
            placeholder="1500"
            required
          />

          <button type="submit" className="movieform-submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Showtime"}
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

export default AddShowtimeForm;