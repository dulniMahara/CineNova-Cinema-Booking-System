import React, { useState, useEffect } from "react";
import MovieCard from "../../components/MovieCard";
import { getMovies } from "../../services/movieService";
import "./MovieList.css";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await getMovies({
          genre: genre || undefined,
          rating: rating || undefined,
        });
        setMovies(data);
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [genre, rating]); // run when filters change

  if (loading) return <p>Loading movies...</p>;

  const nowShowing = movies.filter(m => m.status === "now");
  const comingSoon = movies.filter(m => m.status === "soon");

  return (
    <div className="movies-page">
      <div className="movies-filters">
        <select value={genre} onChange={e => setGenre(e.target.value)}>
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

        <select value={rating} onChange={e => setRating(e.target.value)}>
          <option value="">All Ratings</option>
          <option value="6">6+</option>
          <option value="7">7+</option>
          <option value="8">8+</option>
        </select>
      </div>

      <h2 className="page-title">Now Showing</h2>
      <div className="movie-grid">
        {nowShowing.length > 0 ? (
          nowShowing.map(movie => <MovieCard key={movie._id} movie={movie} />)
        ) : (
          <p>No movies found for selected filters.</p>
        )}
      </div>

      <h2 className="page-title">Coming Soon</h2>
      <div className="movie-grid">
        {comingSoon.length > 0 ? (
          comingSoon.map(movie => <MovieCard key={movie._id} movie={movie} />)
        ) : (
          <p>No movies found for selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default MovieList;