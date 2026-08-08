import React, { useEffect, useState, useMemo } from "react";
import {
  FiPlus,
  FiTv,
  FiGrid,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiCheck,
  FiInfo,
  FiMaximize2
} from "react-icons/fi";
import { getHalls, createHall, deleteHall, updateHall } from "../../services/hallService";
import { getShowtimes } from "../../services/showtimeService";
import "./HallManager.css";

const HallManager = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(12);
  const [grid, setGrid] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Modals
  const [viewingHall, setViewingHall] = useState(null);
  const [hallToDelete, setHallToDelete] = useState(null);
  const [checkingShowtimes, setCheckingShowtimes] = useState(false);
  const [linkedShowtimesCount, setLinkedShowtimesCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHalls();
  }, []);

  // Escape key handler for closing modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (viewingHall) setViewingHall(null);
        if (hallToDelete) setHallToDelete(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewingHall, hallToDelete]);

  // Grid auto-generation for new halls
  useEffect(() => {
    if (!editId) {
      generateGrid(rows, cols);
    }
  }, [rows, cols, editId]);

  const getHallLayoutInfo = (hall) => {
    if (!hall) return null;

    const r = Number(hall.totalRows) || (hall.seatLayout ? hall.seatLayout.length : 0);
    const c = Number(hall.totalCols) || (hall.seatLayout && hall.seatLayout[0] ? hall.seatLayout[0].length : 0);

    if (!r || !c) {
      return { error: "Layout information is unavailable for this hall." };
    }

    let layoutGrid = hall.seatLayout;
    let isStandardFallback = false;

    if (!Array.isArray(layoutGrid) || layoutGrid.length === 0) {
      layoutGrid = Array(r).fill().map(() => Array(c).fill(1));
      isStandardFallback = true;
    }

    const activeSeats = layoutGrid.flat().filter((cell) => cell === 1).length;
    const totalPositions = r * c;
    const aisleSpaces = Math.max(totalPositions - activeSeats, 0);

    if (hall.seatCapacity && hall.seatCapacity !== activeSeats) {
      console.warn(`[HallManager] Stored capacity (${hall.seatCapacity}) differs from layout capacity (${activeSeats}) for ${hall.name}.`);
    }

    return {
      rows: r,
      cols: c,
      layoutGrid,
      activeSeats,
      totalPositions,
      aisleSpaces,
      isStandardFallback
    };
  };

  const fetchHalls = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getHalls();
      setHalls(response.data || []);
    } catch (err) {
      console.error("Error fetching halls", err);
      setError("Unable to load cinema halls. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateGrid = (r, c) => {
    const safeRows = Math.min(Math.max(Number(r) || 10, 1), 20);
    const safeCols = Math.min(Math.max(Number(c) || 12, 1), 20);
    const newGrid = Array(safeRows).fill().map(() => Array(safeCols).fill(1));
    setGrid(newGrid);
  };

  const toggleSeat = (rowIndex, colIndex) => {
    if (!grid || !grid[rowIndex]) return;
    const newGrid = grid.map((r, rIdx) =>
      r.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? (cell === 1 ? 0 : 1) : cell))
    );
    setGrid(newGrid);
  };

  const calculateCapacity = (targetGrid = grid) => {
    if (!targetGrid || !Array.isArray(targetGrid) || targetGrid.length === 0) return 0;
    return targetGrid.flat().filter((val) => val === 1).length;
  };

  const handleEdit = (hall) => {
    setEditId(hall._id);
    setName(hall.name);
    setFormError("");

    const safeRows = hall.totalRows || 10;
    const safeCols = hall.totalCols || 12;

    setRows(safeRows);
    setCols(safeCols);

    if (hall.seatLayout && hall.seatLayout.length > 0) {
      setGrid(hall.seatLayout);
    } else {
      generateGrid(safeRows, safeCols);
    }

    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Please enter a valid Hall Name.");
      return;
    }

    const safeRows = Number(rows);
    const safeCols = Number(cols);

    if (isNaN(safeRows) || safeRows < 1 || safeRows > 20) {
      setFormError("Rows must be a number between 1 and 20.");
      return;
    }

    if (isNaN(safeCols) || safeCols < 1 || safeCols > 20) {
      setFormError("Columns must be a number between 1 and 20.");
      return;
    }

    const payload = {
      name: name.trim(),
      totalRows: safeRows,
      totalCols: safeCols,
      seatLayout: grid,
      seatCapacity: calculateCapacity(grid)
    };

    setSaving(true);
    try {
      if (editId) {
        await updateHall(editId, payload);
        setToastMessage(`Hall "${name}" updated successfully.`);
      } else {
        await createHall(payload);
        setToastMessage(`Hall "${name}" created successfully.`);
      }

      resetForm();
      fetchHalls();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Error saving hall layout.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName("");
    setRows(10);
    setCols(12);
    setEditId(null);
    setShowAddForm(false);
    setFormError("");
    generateGrid(10, 12);
  };

  const handleInitiateDelete = async (hall) => {
    setHallToDelete(hall);
    setCheckingShowtimes(true);
    try {
      const res = await getShowtimes();
      const allSt = res.data ? res.data : res;
      const linked = Array.isArray(allSt)
        ? allSt.filter((st) => String(st.hall?._id || st.hall) === String(hall._id))
        : [];
      setLinkedShowtimesCount(linked.length);
    } catch (err) {
      console.error("Error checking linked showtimes:", err);
      setLinkedShowtimesCount(0);
    } finally {
      setCheckingShowtimes(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!hallToDelete) return;
    setDeleting(true);
    try {
      await deleteHall(hallToDelete._id);
      setHalls(halls.filter((h) => h._id !== hallToDelete._id));
      setToastMessage(`Hall "${hallToDelete.name}" deleted.`);
      setHallToDelete(null);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete hall.");
    } finally {
      setDeleting(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalHalls = halls.length;
    const totalCapacity = halls.reduce((acc, h) => acc + (h.seatCapacity || 0), 0);
    const largestHall = totalHalls > 0 ? Math.max(...halls.map((h) => h.seatCapacity || 0)) : 0;
    const avgCapacity = totalHalls > 0 ? Math.round(totalCapacity / totalHalls) : 0;

    return { totalHalls, totalCapacity, largestHall, avgCapacity };
  }, [halls]);

  return (
    <div className="admin-hallmanager-dashboard">
      <div className="admin-hallmanager-container">

        {/* 1. Header Section */}
        <div className="admin-header-section">
          <div className="header-title-block">
            <div className="admin-header-badge">
              <FiTv />
            </div>
            <div>
              <h1 className="admin-main-title">Cinema Hall Management</h1>
              <p className="admin-subtitle">
                Configure halls, capacities, and seating layouts.
              </p>
            </div>
          </div>

          <button
            className="btn-add-hall-emerald"
            onClick={() => {
              if (showAddForm) resetForm();
              else setShowAddForm(true);
            }}
          >
            {showAddForm ? <FiX /> : <FiPlus />} {showAddForm ? "Close Form" : "Add New Hall"}
          </button>
        </div>

        {/* 2. Overview Metrics Grid */}
        {!loading && !error && (
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-icon emerald"><FiTv /></div>
              <div className="metric-data">
                <span className="metric-title">Total Halls</span>
                <span className="metric-num">{metrics.totalHalls}</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon emerald"><FiUsers /></div>
              <div className="metric-data">
                <span className="metric-title">Total Seating Capacity</span>
                <span className="metric-num">{metrics.totalCapacity} Seats</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon gold"><FiMaximize2 /></div>
              <div className="metric-data">
                <span className="metric-title">Largest Hall</span>
                <span className="metric-num">{metrics.largestHall} Seats</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon blue"><FiGrid /></div>
              <div className="metric-data">
                <span className="metric-title">Avg Capacity / Hall</span>
                <span className="metric-num">{metrics.avgCapacity} Seats</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Add / Edit Hall & Seat Layout Form */}
        {showAddForm && (
          <div className="hallmanager-editor-panel slide-down">
            <div className="editor-header-bar">
              <div>
                <h3 className="editor-title">{editId ? "Edit Cinema Hall & Layout" : "Create New Cinema Hall"}</h3>
                <p className="editor-subtitle">Set hall name, dimensions, and customize active seats versus empty aisles.</p>
              </div>

              <div className="live-capacity-pill">
                <span className="pill-label">Current Capacity:</span>
                <span className="pill-val">{calculateCapacity()} seats</span>
              </div>
            </div>

            {formError && (
              <div className="form-error-banner">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="editor-inputs-grid">
                <div className="form-group">
                  <label htmlFor="hallName">Hall Name <span className="req-star">*</span></label>
                  <input
                    id="hallName"
                    type="text"
                    placeholder="e.g. Hall 01 - VIP Screen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="editor-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rowsNum">Number of Rows (1 - 20) <span className="req-star">*</span></label>
                  <input
                    id="rowsNum"
                    type="number"
                    min="1"
                    max="20"
                    value={rows}
                    onChange={(e) => setRows(e.target.value)}
                    required
                    className="editor-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="colsNum">Number of Columns (1 - 20) <span className="req-star">*</span></label>
                  <input
                    id="colsNum"
                    type="number"
                    min="1"
                    max="20"
                    value={cols}
                    onChange={(e) => setCols(e.target.value)}
                    required
                    className="editor-input"
                  />
                </div>
              </div>

              {/* Seating Layout Canvas */}
              <div className="seating-editor-canvas">
                <div className="cinema-screen-indicator">
                  <div className="curved-screen-bar" />
                  <span className="screen-text">CINEMA SCREEN</span>
                </div>

                <div className="editor-instructions-bar">
                  <FiInfo className="info-icon" />
                  <span>Click a seat position to toggle it between an active seat and an empty aisle.</span>
                </div>

                <div className="editor-grid-scroll-box">
                  {grid && grid.length > 0 && (
                    <div
                      className="editor-visual-grid"
                      style={{
                        gridTemplateColumns: `repeat(${cols}, 1fr)`
                      }}
                    >
                      {grid.map((row, rIndex) =>
                        row.map((cell, cIndex) => (
                          <button
                            type="button"
                            key={`${rIndex}-${cIndex}`}
                            className={`editor-seat-cell ${cell === 1 ? "seat-active" : "seat-aisle"}`}
                            onClick={() => toggleSeat(rIndex, cIndex)}
                            aria-label={`Row ${rIndex + 1}, Seat ${cIndex + 1}: ${cell === 1 ? 'Active' : 'Aisle'}`}
                            title={`Row ${rIndex + 1}, Col ${cIndex + 1} (${cell === 1 ? "Active Seat" : "Aisle Space"})`}
                          >
                            {cell === 1 ? <span className="seat-icon">💺</span> : <span className="aisle-icon">✕</span>}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Legend & Stats */}
                <div className="editor-legend-row">
                  <div className="legend-items-group">
                    <div className="legend-item">
                      <div className="legend-sample active-sample">💺</div>
                      <span>Active Seat</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-sample aisle-sample">✕</div>
                      <span>Aisle / Empty Space</span>
                    </div>
                  </div>

                  <div className="grid-meta-stats">
                    <span>Total Grid Positions: <strong>{(Number(rows) || 0) * (Number(cols) || 0)}</strong></span>
                    <span>Aisle Spaces: <strong>{((Number(rows) || 0) * (Number(cols) || 0)) - calculateCapacity()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="editor-actions-bar">
                <button
                  type="button"
                  className="btn-cancel-editor"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save-hall-emerald" disabled={saving}>
                  {saving ? "Saving Layout..." : editId ? "Update Hall & Layout" : "Save Hall & Layout"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. Table / Content View */}
        {loading ? (
          <div className="admin-table-glass-wrapper">
            <div className="skeleton-loading-table">
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-table-row">
                  <div className="skeleton-avatar" />
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
            <h3>Unable to load cinema halls</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchHalls}>
              <FiRefreshCw /> Try Again
            </button>
          </div>
        ) : halls.length === 0 ? (
          <div className="admin-empty-card">
            <div className="empty-icon-box"><FiTv /></div>
            <h3>No cinema halls configured</h3>
            <p>Create your first hall to begin scheduling showtimes.</p>
            <button
              className="btn-add-hall-emerald"
              onClick={() => setShowAddForm(true)}
            >
              <FiPlus /> Add New Hall
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-glass-wrapper desktop-only">
              <table className="admin-halls-table">
                <thead>
                  <tr>
                    <th>Hall</th>
                    <th>Dimensions</th>
                    <th>Capacity</th>
                    <th>Layout Summary</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {halls.map((hall) => {
                    const safeR = hall.totalRows || (hall.seatLayout ? hall.seatLayout.length : 10);
                    const safeC = hall.totalCols || (hall.seatLayout && hall.seatLayout[0] ? hall.seatLayout[0].length : 12);
                    const totalPos = safeR * safeC;
                    const activeCount = hall.seatCapacity || 0;
                    const aisleCount = Math.max(totalPos - activeCount, 0);

                    return (
                      <tr key={hall._id}>
                        {/* Hall */}
                        <td>
                          <div className="table-hall-cell">
                            <FiTv className="cell-hall-icon" />
                            <span className="hall-name-title">{hall.name}</span>
                          </div>
                        </td>

                        {/* Dimensions */}
                        <td>
                          <span className="dim-chip">{safeR} rows × {safeC} cols</span>
                        </td>

                        {/* Capacity */}
                        <td>
                          <span className="capacity-badge-emerald">{activeCount} seats</span>
                        </td>

                        {/* Layout Summary */}
                        <td>
                          <div className="summary-breakdown">
                            <span className="meta-sub">{totalPos} positions</span>
                            <span className="meta-active">{activeCount} active seats</span>
                            <span className="meta-aisle">{aisleCount} aisles</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="td-actions">
                          <div className="table-actions-row">
                            <button
                              type="button"
                              className="hall-view-link"
                              onClick={() => setViewingHall(hall)}
                            >
                              View Layout
                            </button>
                            <button
                              className="btn-action-edit"
                              onClick={() => handleEdit(hall)}
                              title="Edit Hall"
                            >
                              <FiEdit2 /> Edit
                            </button>
                            <button
                              className="btn-action-delete"
                              onClick={() => handleInitiateDelete(hall)}
                              title="Delete Hall"
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

            {/* Mobile Cards View */}
            <div className="mobile-only admin-halls-cards-list">
              {halls.map((hall) => {
                const safeR = hall.totalRows || 10;
                const safeC = hall.totalCols || 12;
                const totalPos = safeR * safeC;
                const activeCount = hall.seatCapacity || 0;
                const aisleCount = Math.max(totalPos - activeCount, 0);

                return (
                  <div key={hall._id} className="mobile-admin-hall-card">
                    <div className="mobile-card-top">
                      <div className="table-hall-cell">
                        <FiTv className="cell-hall-icon" />
                        <h3 className="hall-name-title">{hall.name}</h3>
                      </div>
                      <span className="capacity-badge-emerald">{activeCount} seats</span>
                    </div>

                    <div className="mobile-hall-details">
                      <div className="detail-row">
                        <FiGrid /> <span>{safeR} rows × {safeC} cols</span>
                      </div>
                      <div className="detail-row">
                        <span>{activeCount} active seats | {aisleCount} aisles</span>
                      </div>
                    </div>

                    <div className="mobile-card-actions">
                      <button type="button" className="hall-view-link" onClick={() => setViewingHall(hall)}>
                        View Layout
                      </button>
                      <button className="btn-action-edit" onClick={() => handleEdit(hall)}>
                        <FiEdit2 /> Edit
                      </button>
                      <button className="btn-action-delete" onClick={() => handleInitiateDelete(hall)}>
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

      {/* Read-Only View Layout Modal */}
      {viewingHall && (() => {
        const info = getHallLayoutInfo(viewingHall);

        return (
          <div className="custom-modal-backdrop" onClick={() => setViewingHall(null)}>
            <div
              className="custom-modal-card view-hall-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="hall-layout-title"
            >
              <button className="modal-close-btn" onClick={() => setViewingHall(null)} aria-label="Close Preview">
                <FiX />
              </button>

              <div className="modal-header-block">
                <h3 className="modal-title" id="hall-layout-title">{viewingHall.name}</h3>
                {info && !info.error && (
                  <span className={`layout-type-badge ${info.isStandardFallback ? 'standard' : 'custom'}`}>
                    {info.isStandardFallback ? "Standard Layout" : "Custom Layout"}
                  </span>
                )}
              </div>

              {info && !info.error ? (
                <>
                  <p className="modal-subtitle-text">
                    {info.rows} Rows × {info.cols} Columns Grid
                  </p>

                  {/* Compact Metadata Chips */}
                  <div className="view-modal-meta-row">
                    <div className="meta-chip active">
                      <span className="meta-chip-label">Capacity</span>
                      <span className="meta-chip-val">{info.activeSeats} Seats</span>
                    </div>
                    <div className="meta-chip">
                      <span className="meta-chip-label">Grid Positions</span>
                      <span className="meta-chip-val">{info.totalPositions}</span>
                    </div>
                    <div className="meta-chip aisle">
                      <span className="meta-chip-label">Aisle Spaces</span>
                      <span className="meta-chip-val">{info.aisleSpaces}</span>
                    </div>
                  </div>

                  {/* Screen Bar */}
                  <div className="cinema-screen-indicator">
                    <div className="curved-screen-bar" />
                    <span className="screen-text">CINEMA SCREEN</span>
                  </div>

                  {/* Read-Only Seating Grid with Row Labels */}
                  <div className="read-only-grid-scroll">
                    <div className="layout-canvas-wrapper">

                      {/* Column Headers */}
                      <div className="col-headers-row" style={{ paddingLeft: "22px", gridTemplateColumns: `repeat(${info.cols}, 24px)` }}>
                        {Array.from({ length: info.cols }, (_, i) => (
                          <span key={i} className="col-header-num">{i + 1}</span>
                        ))}
                      </div>

                      <div className="grid-with-row-labels">
                        {/* Row Labels Column */}
                        <div className="row-labels-col">
                          {Array.from({ length: info.rows }, (_, i) => (
                            <span key={i} className="row-label-char">{String.fromCharCode(65 + i)}</span>
                          ))}
                        </div>

                        {/* 2D Seat Grid */}
                        <div
                          className="editor-visual-grid read-only"
                          style={{
                            gridTemplateColumns: `repeat(${info.cols}, 24px)`
                          }}
                        >
                          {info.layoutGrid.map((row, rIndex) => {
                            const rowLetter = String.fromCharCode(65 + rIndex);
                            return row.map((cell, cIndex) => {
                              const seatNum = cIndex + 1;
                              const seatLabel = `${rowLetter}${seatNum}`;
                              return (
                                <div
                                  key={`${rIndex}-${cIndex}`}
                                  className={`editor-seat-cell read-only ${cell === 1 ? "seat-active" : "seat-aisle"}`}
                                  title={cell === 1 ? `Row ${rowLetter}, Seat ${seatNum} (${seatLabel})` : `Row ${rowLetter}, Position ${seatNum} (Aisle)`}
                                >
                                  {cell === 1 ? (
                                    <span className="seat-number-label">{seatLabel}</span>
                                  ) : (
                                    <span className="aisle-icon">✕</span>
                                  )}
                                </div>
                              );
                            });
                          })}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Legend */}
                  <div className="editor-legend-row" style={{ marginTop: "16px" }}>
                    <div className="legend-items-group">
                      <div className="legend-item">
                        <div className="legend-sample active-sample">A1</div>
                        <span>Active Seat</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-sample aisle-sample">✕</div>
                        <span>Aisle / Empty Space</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-sample screen-sample"></div>
                        <span>Screen Bar</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="layout-unavailable-box">
                  <FiAlertCircle className="unavailable-icon" />
                  <p>{info ? info.error : "Layout information is unavailable for this hall."}</p>
                </div>
              )}

              <div className="modal-footer-row" style={{ marginTop: "14px", width: "100%" }}>
                <button className="btn-modal-close" onClick={() => setViewingHall(null)}>
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {hallToDelete && (
        <div className="custom-modal-backdrop" onClick={() => setHallToDelete(null)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-warning-icon">
              <FiAlertCircle />
            </div>

            <h3 className="modal-title">Delete {hallToDelete.name}?</h3>

            {checkingShowtimes ? (
              <p className="modal-desc">Checking showtime references...</p>
            ) : linkedShowtimesCount > 0 ? (
              <div className="delete-blocked-box">
                <p className="blocked-title">⚠️ Deletion Blocked</p>
                <p className="modal-desc">
                  This hall cannot be deleted because it is linked to <strong>{linkedShowtimesCount}</strong> scheduled showtime(s). Please reassign or remove the showtimes first.
                </p>
              </div>
            ) : (
              <p className="modal-desc">
                Are you sure you want to delete this cinema hall and its seating configuration? This action cannot be undone.
              </p>
            )}

            <div className="modal-actions-row">
              <button
                className="btn-modal-cancel"
                onClick={() => setHallToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-modal-confirm-danger"
                onClick={handleConfirmDelete}
                disabled={deleting || checkingShowtimes || linkedShowtimesCount > 0}
              >
                {deleting ? "Deleting..." : "Delete Hall"}
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

export default HallManager;