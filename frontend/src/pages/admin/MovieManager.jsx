import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiFilm,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPlay,
  FiImage,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiCheck
} from "react-icons/fi";
import { getMovies, deleteMovie } from "../../services/movieService";
import "./MovieManager.css";

const MovieManager = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination & Modal states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        genre: genre || undefined,
        rating: rating || undefined,
      };
      const data = await getMovies(params);
      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError(err.response?.data?.message || "Unable to load movies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMovies();
  }, [genre, rating]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, genre, rating, statusFilter, sortBy]);

  const handleEdit = (id) => {
    navigate(`/admin/movies/edit/${id}`);
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;
    setDeleting(true);
    try {
      await deleteMovie(movieToDelete._id);
      setMovies(movies.filter((movie) => movie._id !== movieToDelete._id));
      setToastMessage(`Movie "${movieToDelete.title}" deleted successfully.`);
      setMovieToDelete(null);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Error deleting movie:", err);
      alert(err.response?.data?.message || "Failed to delete movie.");
    } finally {
      setDeleting(false);
    }
  };

  const handleAdd = () => {
    navigate("/admin/movies/add");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setGenre("");
    setRating("");
    setStatusFilter("all");
    setSortBy("newest");
  };

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = movies.length;
    const nowShowing = movies.filter((m) => String(m.status).toLowerCase() === "now").length;
    const comingSoon = movies.filter((m) => String(m.status).toLowerCase() === "soon").length;
    const avgRating = total > 0 ? (movies.reduce((acc, m) => acc + (m.rating || 0), 0) / total).toFixed(1) : "0.0";
    return { total, nowShowing, comingSoon, avgRating };
  }, [movies]);

  // Filter & Sort Movies
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (m) => (m.title && m.title.toLowerCase().includes(q)) || (m.description && m.description.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((m) => String(m.status).toLowerCase() === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id);
      if (sortBy === "oldest") return new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id);
      if (sortBy === "title-asc") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "title-desc") return (b.title || "").localeCompare(a.title || "");
      if (sortBy === "rating-desc") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "rating-asc") return (a.rating || 0) - (b.rating || 0);
      return 0;
    });

    return result;
  }, [movies, searchTerm, statusFilter, sortBy]);

  // Pagination Math
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage) || 1;
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMovies.slice(start, start + itemsPerPage);
  }, [filteredMovies, currentPage, itemsPerPage]);

  const renderStatusBadge = (statusStr) => {
    const st = String(statusStr || "now").toLowerCase();
    if (st === "now" || st === "active" || st === "now showing") {
      return (
        <span className="admin-status-badge badge-now">
          <FiCheckCircle /> Now Showing
        </span>
      );
    }
    if (st === "soon" || st === "coming soon") {
      return (
        <span className="admin-status-badge badge-soon">
          <FiClock /> Coming Soon
        </span>
      );
    }
    return (
      <span className="admin-status-badge badge-inactive">
        <FiXCircle /> Inactive
      </span>
    );
  };

  return (
    <div className="admin-moviemanager-dashboard">
      <div className="admin-moviemanager-container">

        {/* 1. Header Section */}
        <div className="admin-header-section">
          <div className="header-title-block">
            <div className="admin-header-badge">
              <FiFilm />
            </div>
            <div>
              <h1 className="admin-main-title">Movie Management</h1>
              <p className="admin-subtitle">
                Manage CineNova movies, media, availability, and screening information.
              </p>
            </div>
          </div>

          <button className="btn-add-movie-gold" onClick={handleAdd}>
            <FiPlus /> Add New Movie
          </button>
        </div>

        {/* 2. Metric Overview Cards */}
        {!loading && !error && (
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-icon gold"><FiFilm /></div>
              <div className="metric-data">
                <span className="metric-title">Total Movies</span>
                <span className="metric-num">{metrics.total}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon green"><FiCheckCircle /></div>
              <div className="metric-data">
                <span className="metric-title">Now Showing</span>
                <span className="metric-num">{metrics.nowShowing}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon amber"><FiClock /></div>
              <div className="metric-data">
                <span className="metric-title">Coming Soon</span>
                <span className="metric-num">{metrics.comingSoon}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon star"><FiStar /></div>
              <div className="metric-data">
                <span className="metric-title">Avg Rating</span>
                <span className="metric-num">{metrics.avgRating} / 10</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Search and Filter Toolbar */}
        {!loading && !error && (
          <div className="admin-toolbar-card">
            <div className="search-input-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by movie title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="toolbar-search-input"
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                  <FiX />
                </button>
              )}
            </div>

            <div className="toolbar-selects-group">
              <div className="select-wrapper">
                <FiFilter className="select-icon" />
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
              </div>

              <div className="select-wrapper">
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="">All Ratings</option>
                  <option value="8">8+ Rating</option>
                  <option value="7">7+ Rating</option>
                  <option value="6">6+ Rating</option>
                </select>
              </div>

              <div className="select-wrapper">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="now">Now Showing</option>
                  <option value="soon">Coming Soon</option>
                </select>
              </div>

              <div className="select-wrapper">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title-asc">Title A–Z</option>
                  <option value="title-desc">Title Z–A</option>
                  <option value="rating-desc">Highest Rating</option>
                  <option value="rating-asc">Lowest Rating</option>
                </select>
              </div>

              {(searchTerm || genre || rating || statusFilter !== "all" || sortBy !== "newest") && (
                <button className="btn-clear-filters" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Table / Content View */}
        {loading ? (
          <div className="admin-table-glass-wrapper">
            <div className="skeleton-loading-table">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton-table-row">
                  <div className="skeleton-poster" />
                  <div className="skeleton-text-block">
                    <div className="skeleton-line title" />
                    <div className="skeleton-line text" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="admin-error-card">
            <FiAlertCircle className="error-icon" />
            <h3>Unable to load movies</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchMovies}>
              <FiRefreshCw /> Try Again
            </button>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="admin-empty-card">
            <div className="empty-icon-box"><FiFilm /></div>
            <h3>
              {searchTerm || genre || rating || statusFilter !== "all"
                ? "No movies match your filters."
                : "No movies found."}
            </h3>
            <p>
              {searchTerm || genre || rating || statusFilter !== "all"
                ? "Try adjusting your search criteria or clear filters."
                : "Add a movie to start managing CineNova content."}
            </p>
            {searchTerm || genre || rating || statusFilter !== "all" ? (
              <button className="btn-add-movie-gold" onClick={handleClearFilters}>
                Clear Filters
              </button>
            ) : (
              <button className="btn-add-movie-gold" onClick={handleAdd}>
                <FiPlus /> Add New Movie
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-glass-wrapper desktop-only">
              <table className="admin-movies-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Movie</th>
                    <th>Genre</th>
                    <th>Duration</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Media</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMovies.map((movie) => {
                    const genresList = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
                    return (
                      <tr key={movie._id}>
                        {/* Poster */}
                        <td>
                          <div className="table-poster-thumb">
                            {movie.posterUrl ? (
                              <img src={movie.posterUrl} alt={movie.title} />
                            ) : (
                              <div className="poster-fallback-icon"><FiFilm /></div>
                            )}
                          </div>
                        </td>

                        {/* Movie */}
                        <td>
                          <div className="table-movie-info">
                            <span className="movie-table-title">{movie.title}</span>
                            <p className="movie-table-desc" title={movie.description}>
                              {movie.description}
                            </p>
                          </div>
                        </td>

                        {/* Genre */}
                        <td>
                          <div className="genre-tags-list">
                            {genresList.map((g, idx) => (
                              <span key={idx} className="genre-tag">{g}</span>
                            ))}
                          </div>
                        </td>

                        {/* Duration */}
                        <td>
                          <span className="duration-text">{movie.duration} min</span>
                        </td>

                        {/* Rating */}
                        <td>
                          <span className="rating-badge">
                            <FiStar className="star-icon" /> {movie.rating}
                          </span>
                        </td>

                        {/* Status */}
                        <td>{renderStatusBadge(movie.status)}</td>

                        {/* Media */}
                        <td>
                          <div className="media-indicators-row">
                            <a
                              href={movie.posterUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className={`media-chip ${movie.posterUrl ? "available" : "missing"}`}
                              title={movie.posterUrl ? "View Poster" : "No Poster"}
                            >
                              <FiImage /> Poster {movie.posterUrl ? "✓" : "-"}
                            </a>
                            <a
                              href={movie.bannerUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className={`media-chip ${movie.bannerUrl ? "available" : "missing"}`}
                              title={movie.bannerUrl ? "View Banner" : "No Banner"}
                            >
                              <FiImage /> Banner {movie.bannerUrl ? "✓" : "-"}
                            </a>
                            <a
                              href={movie.trailerUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className={`media-chip ${movie.trailerUrl ? "available" : "missing"}`}
                              title={movie.trailerUrl ? "Watch Trailer" : "No Trailer"}
                            >
                              <FiPlay /> Trailer {movie.trailerUrl ? "✓" : "-"}
                            </a>
                          </div>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="table-actions-row">
                            <button
                              className="btn-action-edit"
                              onClick={() => handleEdit(movie._id)}
                              title="Edit Movie"
                            >
                              <FiEdit2 /> Edit
                            </button>
                            <button
                              className="btn-action-delete"
                              onClick={() => setMovieToDelete(movie)}
                              title="Delete Movie"
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List View */}
            <div className="mobile-only admin-movies-cards-list">
              {paginatedMovies.map((movie) => (
                <div key={movie._id} className="mobile-admin-movie-card">
                  <div className="mobile-card-poster">
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} />
                    ) : (
                      <div className="poster-fallback-icon"><FiFilm /></div>
                    )}
                  </div>
                  <div className="mobile-card-details">
                    <div className="mobile-card-top">
                      <h3 className="movie-table-title">{movie.title}</h3>
                      {renderStatusBadge(movie.status)}
                    </div>
                    <p className="movie-table-desc">{movie.description}</p>
                    <div className="mobile-meta-row">
                      <span className="rating-badge"><FiStar /> {movie.rating}</span>
                      <span className="duration-text">{movie.duration} min</span>
                    </div>
                    <div className="mobile-card-actions">
                      <button className="btn-action-edit" onClick={() => handleEdit(movie._id)}>
                        <FiEdit2 /> Edit
                      </button>
                      <button className="btn-action-delete" onClick={() => setMovieToDelete(movie)}>
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination-bar">
                <span className="pagination-count-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredMovies.length)} of {filteredMovies.length} movies
                </span>

                <div className="pagination-buttons">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft /> Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-num ${page === currentPage ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {movieToDelete && (
        <div className="custom-modal-backdrop" onClick={() => setMovieToDelete(null)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-warning-icon">
              <FiAlertCircle />
            </div>
            <h3 className="modal-title">Delete "{movieToDelete.title}"?</h3>
            <p className="modal-desc">
              This action cannot be undone. All showtimes and associated seat references for this movie may be impacted.
            </p>
            <div className="modal-actions-row">
              <button
                className="btn-modal-cancel"
                onClick={() => setMovieToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-modal-confirm-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Movie"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {toastMessage && (
        <div className="admin-toast-notice">
          <FiCheck /> {toastMessage}
        </div>
      )}

    </div>
  );
};

export default MovieManager;