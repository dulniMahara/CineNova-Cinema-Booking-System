import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './Booking.css'; // Uses the same master CSS file

const BookingSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="booking-container success-view">
      <button 
        onClick={() => navigate('/')} 
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
          transition: 'all 0.3s ease',
          zIndex: 10
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
      <div className="booking-card success-card">
        
        {/* Animated Check Icon */}
        <div className="check-icon">
          ✓
        </div>

        {/* Success Message */}
        <h1>BOOKING SUCCESSFUL!</h1>
        
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>
          Your tickets have been confirmed.
        </p>

        {/* Reference Number (Fake for now, or real if you pass it) */}
        <div className="ref-text">
          Booking Ref: <span>#{Math.floor(Math.random() * 1000000)}</span>
        </div>

        {/* Navigation Buttons */}
        <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginTop: '30px',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <button 
                className="confirm-btn" 
                style={{ minWidth: '200px' }}
                onClick={() => navigate('/')}
            >
                BACK TO HOME
            </button>
            
            <button 
                className="history-btn"
                style={{ minWidth: '200px' }}
                onClick={() => navigate('/my-bookings')}
            >
                VIEW MY BOOKINGS
            </button>
        </div>

      </div>
    </div>
  );
};

export default BookingSuccess;