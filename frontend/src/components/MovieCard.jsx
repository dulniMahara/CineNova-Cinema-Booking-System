import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFilm } from "react-icons/fi";
import "./MovieCard.css";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [imgLoading, setImgLoading] = useState(!!movie.posterUrl);
  const [imgError, setImgError] = useState(!movie.posterUrl);

  const genreText = Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre;
  const isComingSoon = movie.status === "soon";

  const handleImageError = () => {
    setImgError(true);
    setImgLoading(false);
  };

  const handleImageLoad = () => {
    setImgLoading(false);
  };

  const handleBookNowClick = (e) => {
    e.stopPropagation();
    navigate(`/movies/${movie._id}#showtimes`, {
      state: { scrollToShowtimes: true }
    });
  };

  return (
    <div className="movie-card">
      <div className="poster-wrapper">
        <div className="poster-badges">
          <span className={`status-badge ${isComingSoon ? "soon" : "now"}`}>
            {isComingSoon ? "Coming Soon" : "Now Showing"}
          </span>
          {movie.rating !== undefined && movie.rating !== null && (
            <span className="rating-badge">
              ★ {movie.rating}
            </span>
          )}
        </div>

        {imgLoading && <div className="poster-shimmer"></div>}

        {imgError ? (
          <div className="poster-fallback">
            <div className="fallback-icon"><FiFilm /></div>
            <span className="fallback-title">{movie.title}</span>
            <span className="fallback-text">CineNova</span>
          </div>
        ) : (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className={`movie-poster ${imgLoading ? "hidden" : "visible"}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        <div className="movie-overlay">
          <button
            className="btn secondary"
            onClick={handleBookNowClick}
          >
            Book Ticket
            <span className="sr-only">Book Now</span>
          </button>
          <button
            className="btn primary"
            onClick={() => navigate(`/movies/${movie._id}`)}
          >
            View Details
          </button>
        </div>
      </div>

      <div className="movie-info">
        <h4 title={movie.title}>{movie.title}</h4>
        <span>{genreText} | {movie.duration} mins</span>
      </div>
    </div>
  );
};

export default MovieCard;