import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './SeatMap.css'; 

const SeatSelection = () => {
  const params = useParams();
  const navigate = useNavigate();
  // Support both URL patterns: /seats/:showtimeId OR /seats/:id
  const showtimeId = params.showtimeId || params.id;

  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]); 
  const [loading, setLoading] = useState(true);

  // 1. Fetch Seats for this Showtime
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/seats/${showtimeId}`);
        // DEBUG: Look in your browser console (F12) to see exactly what "status" the DB sends
        console.log("Seats Data from API:", res.data); 
        setSeats(res.data);
      } catch (err) {
        console.error("Error fetching seats:", err);
      } finally {
        setLoading(false);
      }
    };
    if (showtimeId) fetchSeats();
  }, [showtimeId]);

  // 2. Handle Clicking a Seat (Toggle Selection)
  const handleSeatClick = (seat) => {
    // We also use the helper function here to prevent clicking booked seats
    const isBooked = 
        (seat.status && seat.status.toLowerCase() === 'booked') || 
        seat.isBooked === true || 
        seat.booked === true ||
        seat.status === 'locked';

    if (isBooked) return;
    
    if (selectedSeatIds.includes(seat._id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat._id));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seat._id]);
    }
  };

  // Helper to get full seat objects for the next page
  const selectedSeats = seats.filter(seat => selectedSeatIds.includes(seat._id));
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

  // 3. Handle Payment (Redirects to Create Booking Form)
  const handlePayment = () => {
    if (selectedSeatIds.length === 0) {
        alert("Please select at least one seat!");
        return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to continue with booking!");
        navigate('/login');
        return;
    }

    navigate('/create-booking', { 
        state: { 
            seats: selectedSeats, 
            showtimeId: showtimeId, 
            totalPrice: totalPrice 
        } 
    });
  };

  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  const rows = [...new Set(seats.map(s => s.row))].sort();

  return (
    <div className="cinema-container">
      <div className="header-info">
        <button 
          onClick={() => navigate(-1)} 
          style={{
            position: 'absolute',
            left: '20px',
            top: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 61, 0, 0.2)';
            e.currentTarget.style.borderColor = '#ff3d00';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <FaArrowLeft />
        </button>
        <h2>SELECT YOUR SEATS</h2>
      </div>
      
      <div className="screen-container">
        <div className="screen">SCREEN</div>
      </div>

      {/* Seat Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-box available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box booked"></div>
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <div className="legend-box unavailable"></div>
          <span>Unavailable</span>
        </div>
      </div>

      <div className="seat-grid">
        {rows.map(row => {
            const rowSeats = seats.filter(s => s.row === row);
            const maxSeatNr = Math.max(...rowSeats.map(s => s.number));
            const renderSlots = Array.from({ length: maxSeatNr }, (_, i) => i + 1);

            return (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                
                {renderSlots.map(seatNum => {
                    const seat = rowSeats.find(s => s.number === seatNum);
                    if (!seat) {
                        return <div key={`gap-${row}-${seatNum}`} className="seat gap"></div>;
                    }

                    const isSelected = selectedSeatIds.includes(seat._id);
                    
                    // --- FIX IS HERE: More robust check for "booked" status ---
                    const isBooked = 
                        (seat.status && seat.status.toLowerCase() === 'booked') || 
                        seat.isBooked === true || 
                        seat.booked === true ||
                        seat.status === 'locked';
                    
                    return (
                        <div 
                            key={seat._id}
                            className={`seat ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                            onClick={() => handleSeatClick(seat)}
                            title={`Rs. ${seat.price}`}
                        >
                            <small>{seat.number}</small>
                        </div>
                    );
                })}
              </div>
            );
        })}
      </div>

      {/* Footer Summary */}
      {selectedSeatIds.length > 0 && (
          <div className="summary-bar">
              <div>
                <strong>{selectedSeatIds.length} Seats</strong>
                <div style={{fontSize: '0.9em', color: '#94a3b8'}}>Rs. {totalPrice}</div>
              </div>
              
              <div className="button-group">
                <button className="btn-cancel" onClick={() => navigate('/')}>
                    CANCEL
                </button>
                <button className="btn-pay" onClick={handlePayment}>
                    PAY NOW
                </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default SeatSelection;