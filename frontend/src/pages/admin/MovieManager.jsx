import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import { getMovies, deleteMovie } from "../../services/movieService";
import "./MovieManager.css";

const MovieManager = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const params = {
          genre: genre || undefined,
          rating: rating || undefined,
        };
        const data = await getMovies(params);
        setMovies(data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [genre, rating]);

  const handleEdit = (id) => {
    navigate(`/admin/movies/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      await deleteMovie(id);
      setMovies(movies.filter((movie) => movie._id !== id));
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const handleAdd = () => {
    navigate("/admin/movies/add");
  };

  if (loading) return <div className="movie-manager-page__loading">Loading movies...</div>;

  return (
    <div className="moviemanager-page">
      <div className="moviemanager-header">
        <h1 className="moviemanager-title">Movie Manager</h1>
        <button className="moviemanager-add-btn" onClick={handleAdd}>
          Add New Movie
        </button>
      </div>

      <div className="moviemanager-filters">
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="Drama">Drama</option>
          <option value="Comedy">Comedy</option>
          <option value="Adventure">Adventure</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Animation">Animation</option>
          <option value="Family">Family</option>
          <option value="Musical">Musical</option>
          <option value="Thriller">Thriller</option>
        </select>

        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="">All Ratings</option>
          <option value="6">6+</option>
          <option value="7">7+</option>
          <option value="8">8+</option>
        </select>
      </div>

      <div className="moviemanager-table-wrapper">
        <table className="moviemanager-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Genre</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Poster</th>
              <th>Banner</th>
              <th>Trailer</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {movies.map((movie) => (
              <tr key={movie._id}>
                <td>{movie.title}</td>
                <td className="moviemanager-description-cell">{movie.description}</td>
                <td>{movie.duration} mins</td>
                <td>{Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}</td>
                <td>{movie.rating}</td>
                <td>{movie.status}</td>
                <td>
                  {movie.posterUrl ? (
                    <a href={movie.posterUrl} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {movie.bannerUrl ? (
                    <a href={movie.bannerUrl} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {movie.trailerUrl ? (
                    <a href={movie.trailerUrl} target="_blank" rel="noreferrer">
                      Watch
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="moviemanager-actions">
                  <MdEdit
                    className="moviemanager-edit"
                    onClick={() => handleEdit(movie._id)}
                  />
                  <MdDelete
                    className="moviemanager-delete"
                    onClick={() => handleDelete(movie._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovieManager;