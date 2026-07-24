import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMovie } from "../../services/movieService";
import "./MovieForm.css";

const GENRES = [
  "Action",
  "Drama",
  "Comedy",
  "Adventure",
  "Sci-Fi",
  "Fantasy",
  "Animation",
  "Family",
  "Musical",
  "Thriller",
];

const AddMovie = () => {
  const navigate = useNavigate();
  const [movieData, setMovieData] = useState({
    title: "",
    description: "",
    duration: "",
    genre: [],
    rating: "",
    posterUrl: "",
    bannerUrl: "",
    trailerUrl: "",
    status: "now",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovieData({ ...movieData, [name]: value });
  };

  const handleGenreCheckbox = (genre) => {
    const updatedGenres = movieData.genre.includes(genre)
      ? movieData.genre.filter((g) => g !== genre)
      : [...movieData.genre, genre];
    setMovieData({ ...movieData, genre: updatedGenres });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const durationNum = Number(movieData.duration);
      const ratingNum = Number(movieData.rating);

      if (isNaN(durationNum) || durationNum <= 0) {
        alert("Please enter a valid duration (greater than 0).");
        setLoading(false);
        return;
      }

      if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
        alert("Please enter a valid rating between 0 and 10.");
        setLoading(false);
        return;
      }

      if (!movieData.title.trim() || !movieData.description.trim() || movieData.genre.length === 0) {
        alert("Please fill in all required fields (Title, Description, Genre).");
        setLoading(false);
        return;
      }

      const payload = {
        title: movieData.title.trim(),
        description: movieData.description.trim(),
        duration: durationNum,
        genre: movieData.genre,
        rating: ratingNum,
        posterUrl: movieData.posterUrl?.trim() || "",
        bannerUrl: movieData.bannerUrl?.trim() || "",
        trailerUrl: movieData.trailerUrl?.trim() || "",
        status: movieData.status,
      };

      await createMovie(payload);
      navigate("/admin/movies");
    } catch (error) {
      console.error("Error creating movie:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to add movie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movieform-page">
      <div className="movieform-wrapper">
        <h1 className="movieform-title">Add New Movie</h1>

        <form className="movieform-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            name="title"
            value={movieData.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={movieData.description}
            onChange={handleChange}
            required
          />

          <label htmlFor="duration">Duration (mins)</label>
          <input
            id="duration"
            type="number"
            name="duration"
            value={movieData.duration}
            onChange={handleChange}
            required
          />

          <label>Genre</label>
          <div className="genre-checkboxes">
            {GENRES.map((g) => (
              <label key={g} className="genre-label">
                <input
                  type="checkbox"
                  value={g}
                  checked={movieData.genre.includes(g)}
                  onChange={() => handleGenreCheckbox(g)}
                />
                <span>{g}</span>
              </label>
            ))}
          </div>

          <label htmlFor="rating">Rating (0-10)</label>
          <input
            id="rating"
            type="number"
            step="0.1"
            name="rating"
            value={movieData.rating}
            onChange={handleChange}
            required
          />

          <label htmlFor="posterUrl">Poster URL</label>
          <input
            id="posterUrl"
            type="text"
            name="posterUrl"
            value={movieData.posterUrl}
            onChange={handleChange}
          />

          <label htmlFor="bannerUrl">Banner URL</label>
          <input
            id="bannerUrl"
            type="text"
            name="bannerUrl"
            value={movieData.bannerUrl}
            onChange={handleChange}
          />

          <label htmlFor="trailerUrl">Trailer URL</label>
          <input
            id="trailerUrl"
            type="text"
            name="trailerUrl"
            value={movieData.trailerUrl}
            onChange={handleChange}
          />

          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={movieData.status}
            onChange={handleChange}
          >
            <option value="now">Now Showing</option>
            <option value="soon">Coming Soon</option>
          </select>

          <button type="submit" disabled={loading} className="movieform-submit-btn">
            {loading ? "Adding..." : "Add Movie"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMovie;