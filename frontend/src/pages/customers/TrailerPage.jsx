import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getMovieById } from "../../services/movieService";
import { FiArrowLeft, FiFilm, FiClock } from "react-icons/fi";
import "./TrailerPage.css";

const TrailerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [movie, setMovie] = useState(location.state?.movie || null);
  const [loading, setLoading] = useState(!location.state?.movie);

  useEffect(() => {
    const fetchMovie = async () => {
      if (movie && movie._id === id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getMovieById(id);
        setMovie(data);
      } catch (err) {
        console.error("Error loading movie for trailer:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Converts database or title into embedded YouTube trailer URL with autoplay
  const getEmbedUrl = (rawUrl, movieTitle) => {
    let url = rawUrl || "";
    let embedBase = "";

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0].split("&")[0];
      embedBase = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtube.com/watch")) {
      try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get("v");
        if (videoId) {
          embedBase = `https://www.youtube.com/embed/${videoId}`;
        }
      } catch (e) {
        // Fallthrough
      }
    } else if (url.includes("youtube.com/embed/")) {
      embedBase = url.split("?")[0];
    }

    // Fallback YouTube search embed if direct ID not found
    if (!embedBase) {
      const cleanTitle = movieTitle || movie?.title || "Movie";
      const searchParam = encodeURIComponent(`${cleanTitle} official trailer`);
      embedBase = `https://www.youtube.com/embed?listType=search&list=${searchParam}`;
    }

    return embedBase.includes("?")
      ? `${embedBase}&autoplay=1&rel=0`
      : `${embedBase}?autoplay=1&rel=0`;
  };

  if (loading) {
    return (
      <div className="trailer-page-wrapper loading-state">
        <div className="trailer-spinner">
          <div className="spinner-ring"></div>
          <p>Loading trailer player...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="trailer-page-wrapper error-state">
        <h2>Movie trailer not found</h2>
        <button className="trailer-back-btn" onClick={() => navigate("/movies")}>
          <FiArrowLeft /> Back to Movies
        </button>
      </div>
    );
  }

  const genreText = movie.genre
    ? (Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre)
    : "";

  return (
    <div className="trailer-page-wrapper">
      <div className="trailer-page-container">

        {/* 1. Back Navigation Bar */}
        <div className="trailer-top-bar">
          <button
            className="trailer-back-btn"
            onClick={() => navigate(-1)}
            title="Return to Previous Page"
          >
            <FiArrowLeft /> Back
          </button>

          <div className="trailer-quick-meta">
            {genreText && (
              <span className="meta-chip">
                <FiFilm /> {genreText}
              </span>
            )}
            {movie.duration && (
              <span className="meta-chip">
                <FiClock /> {movie.duration} mins
              </span>
            )}
          </div>
        </div>

        {/* 2. Movie Title */}
        <div className="trailer-header-section">
          <h1 className="trailer-movie-title">
            {movie.title} <span className="official-tag">— Official Trailer</span>
          </h1>
        </div>

        {/* 3. Responsive 16:9 Embedded Trailer Player (centered, max-width 1000px) */}
        <div className="trailer-player-card">
          <div className="trailer-video-frame">
            <iframe
              src={getEmbedUrl(movie.trailerUrl, movie.title)}
              title={`${movie.title} Official Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* 4. Movie Description (optional) */}
        {movie.description && (
          <div className="trailer-description-card">
            <h3>Synopsis</h3>
            <p>{movie.description}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrailerPage;
