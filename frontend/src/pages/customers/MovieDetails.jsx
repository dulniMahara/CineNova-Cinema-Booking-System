import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../../services/movieService"; 
import "./MovieDetails.css";

const MovieDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieById(id); 
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie:", error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) return <p>Loading movie...</p>;
  if (!movie) return <p>Movie not found</p>;

  const handleBooking = () => navigate(`/buy-tickets/${movie._id}`);
  const toggleTrailer = () => setShowTrailer(prev => !prev);

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtube.com/watch?v=")) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}`;
    }
    return url; 
  };

  return (
    <div className="movie-details-page">
      <div className="movie-two-columns">
        <div className="movie-left">
          <h1 className="movie-title">{movie.title}</h1>
          <p>
            {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre} |{" "}
            {movie.duration} mins | {movie.rating}
          </p>

          <div className="description">
            <h2>Description</h2>
            <p>{movie.description}</p>
          </div>

          <div className="buttons">
            <button className="book-btn" onClick={handleBooking}>
              Book Now
            </button>
            {movie.trailerUrl && (
              <button className="trailer-btn" onClick={toggleTrailer}>
                Watch Trailer
              </button>
            )}
          </div>
        </div>

        <div className="movie-right">
          {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} />}
        </div>
      </div>

      {showTrailer && (
        <div className="trailer-modal" onClick={toggleTrailer}>
          <div className="trailer-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={toggleTrailer}>
              ×
            </button>
            <iframe
              width="100%"
              height="400"
              src={getEmbedUrl(movie.trailerUrl)}
              title={movie.title}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;