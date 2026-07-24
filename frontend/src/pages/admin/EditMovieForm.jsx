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
        <h1 className="movieform-title">Edit Movie</h1>
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

          <button
            type="submit"
            className="movieform-submit-btn"
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Movie"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditMovie;