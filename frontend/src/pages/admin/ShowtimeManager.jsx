import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiFilm,
  FiCalendar,
  FiClock,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiTv,
  FiX
} from "react-icons/fi";
import { getShowtimes, deleteShowtime } from "../../services/showtimeService";
import axios from "axios";
import "./ShowtimeManager.css";

const getShowtimeStatus = (showtime) => {
  if (!showtime) return "upcoming";
  if (showtime.isCancelled || showtime.status === "cancelled") return "cancelled";
  if (!showtime.date || !showtime.startTime) return "upcoming";

  try {
    const rawDate = new Date(showtime.date);
    if (isNaN(rawDate.getTime())) return "upcoming";

    const year = rawDate.getFullYear();
    const month = String(rawDate.getMonth() + 1).padStart(2, "0");
    const day = String(rawDate.getDate()).padStart(2, "0");
    const datePart = `${year}-${month}-${day}`;

    let timeStr = String(showtime.startTime).trim();
    let hours = 0;
    let minutes = 0;

    if (timeStr.toLowerCase().includes("pm") || timeStr.toLowerCase().includes("am")) {
      const isPM = timeStr.toLowerCase().includes("pm");
      const cleanTime = timeStr.replace(/(am|pm)/i, "").trim();
      const parts = cleanTime.split(":");
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10) || 0;
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      const parts = timeStr.split(":");
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    }

    const showtimeDateTime = new Date(`${datePart}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
    const now = new Date();

    if (isNaN(showtimeDateTime.getTime())) return "upcoming";

    if (showtimeDateTime < now) {
      return "past";
    }

    const isToday =
      rawDate.getFullYear() === now.getFullYear() &&
      rawDate.getMonth() === now.getMonth() &&
      rawDate.getDate() === now.getDate();

    if (isToday) return "today";
    return "upcoming";
  } catch (e) {
    return "upcoming";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "N/A";
  let t = String(timeStr).trim();
  if (t.toLowerCase().includes("am") || t.toLowerCase().includes("pm")) return t;
  const parts = t.split(":");
  let hours = parseInt(parts[0], 10) || 0;
  let minutes = parseInt(parts[1], 10) || 0;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${ampm}`;
};

const formatPrice = (price) => {
  const p = Number(price) || 0;
  return `Rs. ${p.toLocaleString()}`;
};

const ShowtimeManager = () => {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [hallsList, setHallsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [hallFilter, setHallFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");

  // Pagination & Modal states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [stToDelete, setStToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        date: filterDate || undefined
      };
      const response = await getShowtimes(params);
      const data = response.data ? response.data : response;
      setShowtimes(Array.isArray(data) ? data : []);

      // Fetch halls for hall dropdown filter
      const hallRes = await axios.get(`${process.env.REACT_APP_API_URL}/halls`);
      setHallsList(hallRes.data.data || []);
    } catch (err) {
      console.error("Error fetching showtimes:", err);
      setError(err.response?.data?.message || "Unable to load showtimes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchShowtimes();
  }, [filterDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate, hallFilter, statusFilter, sortBy]);

  const handleEdit = (id) => {
    navigate(`/admin/showtimes/edit/${id}`);
  };

  const handleConfirmDelete = async () => {
    if (!stToDelete) return;
    setDeleting(true);
    try {
      await deleteShowtime(stToDelete._id);
      setShowtimes(showtimes.filter((st) => st._id !== stToDelete._id));
      setToastMessage("Showtime deleted successfully.");
      setStToDelete(null);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Error deleting showtime:", err);
      alert(err.response?.data?.message || "Failed to delete showtime.");
    } finally {
      setDeleting(false);
    }
  };

  const handleAdd = () => {
    navigate("/admin/showtimes/add");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setHallFilter("");
    setStatusFilter("all");
    setSortBy("date-asc");
  };

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = showtimes.length;
    let todayCount = 0;
    let upcomingCount = 0;
    let pastCount = 0;

    showtimes.forEach((st) => {
      const s = getShowtimeStatus(st);
      if (s === "today") todayCount++;
      else if (s === "upcoming") upcomingCount++;
      else if (s === "past") pastCount++;
    });

    return { total, todayCount, upcomingCount, pastCount };
  }, [showtimes]);

  // Filter & Sort Showtimes
  const filteredShowtimes = useMemo(() => {
    let result = [...showtimes];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (st) =>
          (st.movie?.title && st.movie.title.toLowerCase().includes(q)) ||
          (st.hall?.name && st.hall.name.toLowerCase().includes(q))
      );
    }

    if (hallFilter) {
      result = result.filter((st) => (st.hall?._id || st.hall) === hallFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((st) => getShowtimeStatus(st) === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;

      if (sortBy === "date-asc") return dateA - dateB;
      if (sortBy === "date-desc") return dateB - dateA;
      if (sortBy === "time-asc") return (a.startTime || "").localeCompare(b.startTime || "");
      if (sortBy === "time-desc") return (b.startTime || "").localeCompare(a.startTime || "");
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      return 0;
    });

    return result;
  }, [showtimes, searchTerm, hallFilter, statusFilter, sortBy]);

  // Pagination Math
  const totalPages = Math.ceil(filteredShowtimes.length / itemsPerPage) || 1;
  const paginatedShowtimes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredShowtimes.slice(start, start + itemsPerPage);
  }, [filteredShowtimes, currentPage, itemsPerPage]);

  const renderStatusBadge = (st) => {
    const status = getShowtimeStatus(st);
    if (status === "today") {
      return (
        <span className="admin-status-badge badge-today">
          <FiCheckCircle /> Today
        </span>
      );
    }
    if (status === "upcoming") {
      return (
        <span className="admin-status-badge badge-upcoming">
          <FiClock /> Upcoming
        </span>
      );
    }
    if (status === "past") {
      return (
        <span className="admin-status-badge badge-past">
          <FiXCircle /> Past
        </span>
      );
    }
    return (
      <span className="admin-status-badge badge-cancelled">
        <FiXCircle /> Cancelled
      </span>
    );
  };

  return (
    <div className="admin-showtimemanager-dashboard">
      <div className="admin-showtimemanager-container">

        {/* 1. Header Section */}
        <div className="admin-header-section">
          <div className="header-title-block">
            <div className="admin-header-badge">
              <FiCalendar />
            </div>
            <div>
              <h1 className="admin-main-title">Showtime Management</h1>
              <p className="admin-subtitle">
                Schedule and manage CineNova movie screenings.
              </p>
            </div>
          </div>

          <button className="btn-add-showtime-gold" onClick={handleAdd}>
            <FiPlus /> Add New Showtime
          </button>
        </div>

        {/* 2. Metric Overview Cards */}
        {!loading && !error && (
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-icon gold"><FiCalendar /></div>
              <div className="metric-data">
                <span className="metric-title">Total Screenings</span>
                <span className="metric-num">{metrics.total}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon green"><FiCheckCircle /></div>
              <div className="metric-data">
                <span className="metric-title">Today's Shows</span>
                <span className="metric-num">{metrics.todayCount}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon amber"><FiClock /></div>
              <div className="metric-data">
                <span className="metric-title">Upcoming</span>
                <span className="metric-num">{metrics.upcomingCount}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon grey"><FiXCircle /></div>
              <div className="metric-data">
                <span className="metric-title">Past / Completed</span>
                <span className="metric-num">{metrics.pastCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Toolbar */}
        {!loading && !error && (
          <div className="admin-toolbar-card">
            <div className="search-input-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search movie or hall name..."
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
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="toolbar-date-picker"
                />
              </div>

              {hallsList.length > 0 && (
                <div className="select-wrapper">
                  <FiTv className="select-icon" />
                  <select value={hallFilter} onChange={(e) => setHallFilter(e.target.value)}>
                    <option value="">All Halls</option>
                    {hallsList.map((h) => (
                      <option key={h._id} value={h._id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="select-wrapper">
                <FiFilter className="select-icon" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>

              <div className="select-wrapper">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date-asc">Date: Earliest First</option>
                  <option value="date-desc">Date: Latest First</option>
                  <option value="time-asc">Time: Earliest First</option>
                  <option value="time-desc">Time: Latest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {(searchTerm || filterDate || hallFilter || statusFilter !== "all" || sortBy !== "date-asc") && (
                <button className="btn-clear-filters" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Content View */}
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
            <h3>Unable to load showtimes</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchShowtimes}>
              <FiRefreshCw /> Try Again
            </button>
          </div>
        ) : filteredShowtimes.length === 0 ? (
          <div className="admin-empty-card">
            <div className="empty-icon-box"><FiCalendar /></div>
            <h3>
              {searchTerm || filterDate || hallFilter || statusFilter !== "all"
                ? "No showtimes match the selected filters."
                : "No showtimes scheduled."}
            </h3>
            <p>
              {searchTerm || filterDate || hallFilter || statusFilter !== "all"
                ? "Try adjusting your search criteria or clear filters."
                : "Add a showtime to begin scheduling screenings."}
            </p>
            {searchTerm || filterDate || hallFilter || statusFilter !== "all" ? (
              <button className="btn-add-showtime-gold" onClick={handleClearFilters}>
                Clear Filters
              </button>
            ) : (
              <button className="btn-add-showtime-gold" onClick={handleAdd}>
                <FiPlus /> Add New Showtime
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-glass-wrapper desktop-only">
              <table className="admin-showtimes-table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Hall</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Ticket Price</th>
                    <th>Availability</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedShowtimes.map((st) => {
                    const status = getShowtimeStatus(st);
                    const isMutedPast = status === "past";

                    const movieTitle = st.movie?.title || "Unknown Movie";
                    const posterUrl = st.movie?.posterUrl;
                    const hallName = st.hall?.name || "Unknown Hall";
                    const hallType = st.hall?.screenType || st.hall?.type || "Standard Screen";
                    const capacity = st.hall?.seatCapacity;
                    const availCount = st.availableSeatsCount;

                    return (
                      <tr key={st._id} className={isMutedPast ? "row-muted-past" : ""}>
                        {/* Movie */}
                        <td>
                          <div className="table-movie-cell">
                            <div className="table-poster-thumb-mini">
                              {posterUrl ? (
                                <img src={posterUrl} alt={movieTitle} />
                              ) : (
                                <div className="poster-fallback-icon"><FiFilm /></div>
                              )}
                            </div>
                            <span className="movie-table-title">{movieTitle}</span>
                          </div>
                        </td>

                        {/* Hall */}
                        <td>
                          <div className="table-hall-cell">
                            <span className="hall-name">{hallName}</span>
                            <span className="hall-type">{hallType}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td>
                          <span className="date-badge"><FiCalendar /> {formatDate(st.date)}</span>
                        </td>

                        {/* Time */}
                        <td>
                          <span className="time-badge"><FiClock /> {formatTime(st.startTime)}</span>
                        </td>

                        {/* Price */}
                        <td>
                          <span className="price-tag">{formatPrice(st.price)}</span>
                        </td>

                        {/* Availability */}
                        <td>
                          <span className="availability-chip">
                            {typeof availCount === "number" && capacity
                              ? `${availCount} / ${capacity} available`
                              : capacity
                              ? `${capacity} Seats Capacity`
                              : "Available"}
                          </span>
                        </td>

                        {/* Status */}
                        <td>{renderStatusBadge(st)}</td>

                        {/* Actions */}
                        <td>
                          <div className="table-actions-row">
                            <button
                              className="btn-action-edit"
                              onClick={() => handleEdit(st._id)}
                              title="Edit Showtime"
                            >
                              <FiEdit2 /> Edit
                            </button>
                            <button
                              className="btn-action-delete"
                              onClick={() => setStToDelete(st)}
                              title="Delete Showtime"
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
            <div className="mobile-only admin-showtimes-cards-list">
              {paginatedShowtimes.map((st) => {
                const status = getShowtimeStatus(st);
                const isMutedPast = status === "past";
                const movieTitle = st.movie?.title || "Unknown Movie";
                const posterUrl = st.movie?.posterUrl;
                const hallName = st.hall?.name || "Unknown Hall";
                const capacity = st.hall?.seatCapacity;

                return (
                  <div key={st._id} className={`mobile-admin-showtime-card ${isMutedPast ? "muted" : ""}`}>
                    <div className="mobile-card-poster">
                      {posterUrl ? (
                        <img src={posterUrl} alt={movieTitle} />
                      ) : (
                        <div className="poster-fallback-icon"><FiFilm /></div>
                      )}
                    </div>
                    <div className="mobile-card-details">
                      <div className="mobile-card-top">
                        <h3 className="movie-table-title">{movieTitle}</h3>
                        {renderStatusBadge(st)}
                      </div>
                      <div className="mobile-hall-row"><FiTv /> {hallName}</div>
                      <div className="mobile-meta-row">
                        <span className="date-badge"><FiCalendar /> {formatDate(st.date)}</span>
                        <span className="time-badge"><FiClock /> {formatTime(st.startTime)}</span>
                      </div>
                      <div className="mobile-price-row">
                        <span className="price-tag">{formatPrice(st.price)}</span>
                        {capacity && <span className="availability-chip">{capacity} Capacity</span>}
                      </div>
                      <div className="mobile-card-actions">
                        <button className="btn-action-edit" onClick={() => handleEdit(st._id)}>
                          <FiEdit2 /> Edit
                        </button>
                        <button className="btn-action-delete" onClick={() => setStToDelete(st)}>
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination-bar">
                <span className="pagination-count-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredShowtimes.length)} of {filteredShowtimes.length} showtimes
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
      {stToDelete && (
        <div className="custom-modal-backdrop" onClick={() => setStToDelete(null)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-warning-icon">
              <FiAlertCircle />
            </div>
            <h3 className="modal-title">Delete this showtime?</h3>
            <div className="modal-showtime-details">
              <p className="st-detail-movie">{stToDelete.movie?.title || "Unknown Movie"}</p>
              <p className="st-detail-hall">{stToDelete.hall?.name || "Cinema Hall"}</p>
              <p className="st-detail-time">
                {formatDate(stToDelete.date)} at {formatTime(stToDelete.startTime)}
              </p>
            </div>
            <div className="modal-actions-row">
              <button
                className="btn-modal-cancel"
                onClick={() => setStToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-modal-confirm-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Showtime"}
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

export default ShowtimeManager;