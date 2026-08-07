import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMovieById, updateMovie } from "../../services/movieService";
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

const EditMovie = () => {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieById(id);
        console.log("Fetched movie:", data); 

        const genres = Array.isArray(data.genre) ? data.genre : [data.genre];

        setMovieData({
          title: data.title || "",
          description: data.description || "",
          duration: data.duration || "",
          genre: genres || [],
          rating: data.rating || "",
          posterUrl: data.posterUrl || "",
          bannerUrl: data.bannerUrl || "", 
          trailerUrl: data.trailerUrl || "",
          status: data.status || "now",
        });
      } catch (err) {
        console.error("Error fetching movie:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovieData({
      ...movieData,
      [name]: name === "duration" || name === "rating" ? Number(value) : value,
    });
  };

  const handleGenreCheckbox = (genre) => {
    const updatedGenres = movieData.genre.includes(genre)
      ? movieData.genre.filter((g) => g !== genre)
      : [...movieData.genre, genre];
    setMovieData({ ...movieData, genre: updatedGenres });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      if (!movieData.title.trim() || !movieData.description.trim() || movieData.genre.length === 0) {
        alert("Please fill in all required fields (Title, Description, Genre).");
        setUpdating(false);
        return;
      }

      await updateMovie(id, movieData);
      navigate("/admin/movies");
    } catch (err) {
      console.error("Error updating movie:", err);
      alert("Failed to update movie");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="movieform-loading">Loading movie data...</p>;

  return (
    <div className="movieform-page">
      <div className="movieform-wrapper">

        <div className="form-header-bar">
          <button className="btn-back-link" onClick={() => navigate("/admin/movies")}>
            ← Back to Movie Management
          </button>
          <h1 className="movieform-title">Edit Movie</h1>
          <p className="movieform-subtitle">Update screening and media details for "{movieData.title}".</p>
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
              disabled={updating}
            >
              Cancel
            </button>
            <button type="submit" disabled={updating} className="movieform-submit-btn">
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditMovie;