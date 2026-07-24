import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MovieCard.css";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [imgLoading, setImgLoading] = useState(!!movie.posterUrl);
  const [imgError, setImgError] = useState(!movie.posterUrl);
  
  const genreText = Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre;

  const handleImageError = () => {
    setImgError(true);
    setImgLoading(false);
  };

  const handleImageLoad = () => {
    setImgLoading(false);
  };

  return (
    <div className="movie-card">
      <div className="poster-wrapper">
        {imgLoading && <div className="poster-shimmer"></div>}
        
        {imgError ? (
          <div className="poster-fallback">
            <div className="fallback-icon">✨</div>
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
            className="btn primary"
            onClick={() => navigate(`/movies/${movie._id}`)}
          >
            View Details
          </button>

          <button
            className="btn secondary"
            onClick={() => navigate(`/buy-tickets/${movie._id}`)}
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="movie-info">
        <h4>{movie.title}</h4>
        <span>{genreText} | {movie.duration} mins</span>
      </div>
    </div>
  );
};

export default MovieCard;