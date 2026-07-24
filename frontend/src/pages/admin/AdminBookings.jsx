import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaDownload, FaEye, FaTimes, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaCalendarDay } from 'react-icons/fa';
import { MdRefresh, MdBarChart } from 'react-icons/md';
import axios from 'axios';
import './AdminBookings.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    cancelled: 0,
    totalRevenue: 0,
    todayBookings: 0
  });

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/bookings/all`);
      const bookingsData = Array.isArray(response.data) ? response.data : response.data.bookings || [];
      // Debug log to check seat structure
      if (bookingsData.length > 0) {
        console.log('🔍 Sample booking data:', bookingsData[0]);
        console.log('🪑 Sample seat data:', bookingsData[0].seatIds);
      }
      setBookings(bookingsData);
      calculateStats(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (data) => {
    const total = data.length;
    const confirmed = data.filter(b => b.status === 'Confirmed').length;
    const cancelled = data.filter(b => b.status === 'Cancelled').length;
    const totalRevenue = data
      .filter(b => b.status === 'Confirmed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const today = new Date().toDateString();
    const todayBookings = data.filter(b => 
      new Date(b.createdAt).toDateString() === today
    ).length;
    setStats({ total, confirmed, cancelled, totalRevenue, todayBookings });
  };

  const applyFilters = useCallback(() => {
    let filtered = [...bookings];
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.showtimeId?.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }

    // Date filter
    if (filterDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
        return bookingDate === filterDate;
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, filterStatus, filterDate]);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleViewDetails = (booking) => {
    console.log('📋 Viewing booking details:', booking);
    console.log('🪑 Seat IDs:', booking.seatIds);
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/bookings/${bookingId}`);
      alert('Booking cancelled successfully!');
      fetchAllBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const exportToCSV = () => {
    const headers = ['Booking Ref', 'Customer', 'Movie', 'Seats', 'Amount', 'Status', 'Date'];
    const rows = filteredBookings.map(b => {
      // Get seats from either seatDetails or seatIds
      let seats = 'N/A';
      if (b.seatDetails?.length > 0) {
        seats = b.seatDetails.map(s => `${s.row}${s.number}`).join(', ');
      } else if (b.seatIds?.length > 0 && b.seatIds[0]?.row) {
        seats = b.seatIds.map(s => `${s.row}${s.number}`).join(', ');
      }
      
      return [
        b.bookingReference || 'N/A',
        b.userId?.name || b.userId?.email || b.userId || 'N/A',
        b.showtimeId?.movie?.title || 'N/A',
        seats,
        `Rs. ${b.totalPrice || 0}`,
        b.status,
        new Date(b.createdAt).toLocaleDateString()
      ];
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-bookings-container">
        <div className="loading-spinner">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="admin-bookings-container">
      {/* Header */}
      <div className="bookings-header">
        <h1>Bookings Management</h1>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchAllBookings}>
            <MdRefresh /> Refresh
          </button>
          <button className="btn-export" onClick={exportToCSV}>
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><MdBarChart /></div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon confirmed"><FaCheckCircle /></div>
          <div className="stat-content">
            <h3>{stats.confirmed}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cancelled"><FaTimesCircle /></div>
          <div className="stat-content">
            <h3>{stats.cancelled}</h3>
            <p>Cancelled</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue"><FaMoneyBillWave /></div>
          <div className="stat-content">
            <h3>Rs. {stats.totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon today"><FaCalendarDay /></div>
          <div className="stat-content">
            <h3>{stats.todayBookings}</h3>
            <p>Today's Bookings</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by reference, customer, or movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          className="filter-date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />

        {(searchTerm || filterStatus !== 'all' || filterDate) && (
          <button 
            className="btn-clear-filters"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterDate('');
            }}
          >
            <FaTimes /> Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="results-info">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>

      {/* Bookings Table */}
      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking Ref</th>
              <th>Customer</th>
              <th>Movie</th>
              <th>Date & Time</th>
              <th>Seats</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Booked On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="ref-cell">
                    <span className="booking-ref">
                      #{booking._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {booking.userId?.name || booking.userId?.email || booking.userId || 'N/A'}
                  </td>
                  <td className="movie-cell">
                    {booking.showtimeId?.movie?.title || 'Unknown'}
                  </td>
                  <td>
                    {booking.showtimeId?.date ? (
                      <>
                        {new Date(booking.showtimeId.date).toLocaleDateString()}<br />
                        <span className="time-badge">{booking.showtimeId.startTime || booking.showtimeId.time}</span>
                      </>
                    ) : 'N/A'}
                  </td>
                  <td className="seats-cell">
                    {(() => {
                      // Try seatDetails first (historical record)
                      if (booking.seatDetails?.length > 0) {
                        return booking.seatDetails.map(s => `${s.row}${s.number}`).join(', ');
                      }
                      // Try populated seatIds
                      if (booking.seatIds?.length > 0 && booking.seatIds[0]?.row) {
                        return booking.seatIds.map(s => `${s.row}${s.number}`).join(', ');
                      }
                      // Fallback: just show count if seatIds exist but not populated
                      if (booking.seatIds?.length > 0) {
                        return `${booking.seatIds.length} seat(s)`;
                      }
                      return 'N/A';
                    })()}
                  </td>
                  <td className="amount-cell">
                    Rs. {booking.totalPrice?.toLocaleString() || 0}
                  </td>
                  <td>
                    <span className={`status-badge ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="date-cell">
                    {formatDate(booking.createdAt)}
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDetails(booking)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    {booking.status === 'Confirmed' && (
                      <button 
                        className="btn-cancel"
                        onClick={() => handleCancelBooking(booking._id)}
                        title="Cancel Booking"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Booking Reference:</label>
                <span className="booking-ref-large">
                  #{selectedBooking._id.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="detail-row">
                <label>Customer:</label>
                <span>
                  {selectedBooking.userId?.name || selectedBooking.userId?.email || selectedBooking.userId || 'N/A'}
                  {selectedBooking.userId?.email && selectedBooking.userId?.name && (
                    <span style={{ display: 'block', fontSize: '0.85em', color: '#888' }}>
                      {selectedBooking.userId.email}
                    </span>
                  )}
                </span>
              </div>
              <div className="detail-row">
                <label>Movie:</label>
                <span>{selectedBooking.showtimeId?.movie?.title || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Date & Time:</label>
                <span>
                  {selectedBooking.showtimeId?.date && new Date(selectedBooking.showtimeId.date).toLocaleDateString()}
                  {' at '}
                  {selectedBooking.showtimeId?.startTime || selectedBooking.showtimeId?.time}
                </span>
              </div>
              <div className="detail-row">
                <label>Hall:</label>
                <span>{selectedBooking.showtimeId?.hall?.name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Seats:</label>
                <span className="seats-list">
                  {(() => {
                    // Try populated seatIds first
                    if (selectedBooking.seatIds && selectedBooking.seatIds.length > 0) {
                      const seatDisplay = selectedBooking.seatIds.map((s) => {
                        if (s && typeof s === 'object' && s.row && s.number) {
                          return `${s.row}${s.number}`;
                        }
                        return null;
                      }).filter(Boolean);
                      
                      if (seatDisplay.length > 0) {
                        return seatDisplay.join(', ');
                      }
                    }
                    
                    // Fallback to seatDetails (permanent record)
                    if (selectedBooking.seatDetails && selectedBooking.seatDetails.length > 0) {
                      return selectedBooking.seatDetails
                        .map(s => `${s.row}${s.number}`)
                        .join(', ');
                    }
                    
                    // Last resort: show count
                    if (selectedBooking.seatIds && selectedBooking.seatIds.length > 0) {
                      return `${selectedBooking.seatIds.length} seat(s) booked`;
                    }
                    
                    return 'No seat data available';
                  })()}
                </span>
              </div>
              <div className="detail-row">
                <label>Total Amount:</label>
                <span className="amount-large">Rs. {selectedBooking.totalPrice?.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge ${selectedBooking.status.toLowerCase()}`}>
                  {selectedBooking.status}
                </span>
              </div>
              <div className="detail-row">
                <label>Booked On:</label>
                <span>{formatDate(selectedBooking.createdAt)}</span>
              </div>
            </div>
            {selectedBooking.status === 'Confirmed' && (
              <div className="modal-footer">
                <button 
                  className="btn-cancel-booking"
                  onClick={() => {
                    handleCancelBooking(selectedBooking._id);
                    setShowModal(false);
                  }}
                >
                  Cancel This Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
