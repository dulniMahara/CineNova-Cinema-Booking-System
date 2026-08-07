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

        <div className="form-header-bar">
          <button className="btn-back-link" onClick={() => navigate("/admin/movies")}>
            ← Back to Movie Management
          </button>
          <h1 className="movieform-title">Add New Movie</h1>
          <p className="movieform-subtitle">Create a new screening entry for CineNova cinemas.</p>
        </div>

        <form className="movieform-form" onSubmit={handleSubmit}>
          
          {/* Section 1: Basic Information */}
          <div className="form-fieldset">
            <h3 className="fieldset-title">Basic Information</h3>

            <div className="form-group">
              <label htmlFor="title">Title <span className="req-star">*</span></label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="e.g. Jurassic World: Rebirth"
                value={movieData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description <span className="req-star">*</span></label>
              <textarea
                id="description"
                name="description"
                placeholder="Synopsis of the movie..."
                value={movieData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Duration (mins) <span className="req-star">*</span></label>
                <input
                  id="duration"
                  type="number"
                  name="duration"
                  placeholder="e.g. 128"
                  value={movieData.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="rating">Rating (0 - 10) <span className="req-star">*</span></label>
                <input
                  id="rating"
                  type="number"
                  step="0.1"
                  name="rating"
                  placeholder="e.g. 8.2"
                  value={movieData.rating}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
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
              </div>
            </div>

            <div className="form-group">
              <label>Genre <span className="req-star">*</span></label>
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
            </div>
          </div>

          {/* Section 2: Media URLs */}
          <div className="form-fieldset">
            <h3 className="fieldset-title">Media & Links</h3>

            <div className="form-group">
              <label htmlFor="posterUrl">Poster Image URL</label>
              <input
                id="posterUrl"
                type="text"
                name="posterUrl"
                placeholder="https://image.tmdb.org/t/p/w500/..."
                value={movieData.posterUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bannerUrl">Banner Image URL</label>
              <input
                id="bannerUrl"
                type="text"
                name="bannerUrl"
                placeholder="https://image.tmdb.org/t/p/original/..."
                value={movieData.bannerUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="trailerUrl">YouTube Trailer URL</label>
              <input
                id="trailerUrl"
                type="text"
                name="trailerUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={movieData.trailerUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-bar">
            <button
              type="button"
              className="btn-cancel-form"
              onClick={() => navigate("/admin/movies")}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="movieform-submit-btn">
              {loading ? "Adding Movie..." : "Save & Create Movie"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddMovie;