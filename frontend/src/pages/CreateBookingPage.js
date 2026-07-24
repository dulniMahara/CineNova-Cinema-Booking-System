import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import './Booking.css'; 

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Open the backpack (Get data from Seat Page)
  const bookingData = location.state || {}; 
  const { seats, showtimeId, totalPrice } = bookingData;

  const [movieDetails, setMovieDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- THE BULLETPROOF MOVIE FETCHER ---
  useEffect(() => {
    const fetchMovieInfo = async () => {
        if (!showtimeId) return;

        try {
            console.log("1. Fetching Showtime for ID:", showtimeId);
            const showtimeRes = await axios.get(`${process.env.REACT_APP_API_URL}/showtimes/${showtimeId}`);
            const data = showtimeRes.data;
            
            // DETECT MOVIE ID
            let rawMovie = data.movie || (data.data && data.data.movie) || (data.showtime && data.showtime.movie);

            let movieId = null;
            let movieTitle = null;

            if (!rawMovie) {
                console.error("Could not find 'movie' field in response");
            } else if (typeof rawMovie === 'object' && rawMovie.title) {
                setMovieDetails(rawMovie);
                return;
            } else if (typeof rawMovie === 'object' && rawMovie._id) {
                movieId = rawMovie._id;
            } else {
                movieId = rawMovie;
            }

            // FETCH MOVIE DETAILS
            if (movieId) {
                const movieRes = await axios.get(`${process.env.REACT_APP_API_URL}/movies/${movieId}`);
                const mData = movieRes.data;
                
                movieTitle = mData.title || (mData.movie && mData.movie.title) || (mData.data && mData.data.title);
                
                if (movieTitle) {
                    setMovieDetails({ title: movieTitle });
                } else {
                    setMovieDetails({ title: "Title Not Found" });
                }
            } else {
                setMovieDetails({ title: "Movie ID Missing" });
            }

        } catch (err) {
            console.error("Error fetching movie:", err);
            setMovieDetails({ title: "Network Error" });
        }
    };

    fetchMovieInfo();
  }, [showtimeId]);

  const handleConfirmBooking = async () => {
    // Prevent double clicking
    if (isProcessing) return;

    // Check login
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to complete booking!");
        navigate('/login');
        return;
    }

    setIsProcessing(true);
    
    try {
        // --- THE BIG CHANGE ---
        // We do NOT save to the database here anymore.
        // We just pass the data to the Payment Page.
        
        console.log("Redirecting to payment with data...");

        // We format the seats nicely (e.g., "A1", "B2") so they look good in the email later
        const formattedSeats = seats ? seats.map(s => `${s.row}${s.number}`) : [];

        // Navigate to Payment Page
        // Note: We use '/payment/checkout' as a placeholder ID. 
        // The Payment Page will ignore the ID and use the 'state' instead.
        navigate(`/payment/checkout`, { 
            state: { 
                showtimeId: showtimeId,
                selectedSeats: formattedSeats, // Passing "A1, A2"
                totalPrice: totalPrice,
                movieTitle: movieDetails?.title || "Movie Ticket"
            } 
        });

    } catch (error) {
        console.error("Navigation Error:", error);
        alert("Something went wrong. Please try again.");
        setIsProcessing(false);
    }
  };

  return (
    <div className="booking-container">
      <button 
        onClick={() => navigate(-1)} 
        style={{
          position: 'absolute', left: '20px', top: '20px',
          background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer',
          zIndex: 10
        }}
      >
        <FaArrowLeft />
      </button>

      <div className="booking-card">
        <h1>CONFIRM BOOKING</h1>
        
        <div className="summary-details">
            <div className="detail-row">
                <span className="label">Movie Name</span>
                <span className="value">
                    {movieDetails ? movieDetails.title : "Loading..."}
                </span>
            </div>

            <div className="detail-row">
                <span className="label">Selected Seats</span>
                <span className="value">
                    {seats ? seats.map(s => `${s.row}${s.number}`).join(', ') : 'None'}
                </span>
            </div>
        </div>

        <div className="price-section">
            <span className="price-label">Total Amount</span>
            <span className="price-amount">Rs. {totalPrice || 0}</span>
        </div>

        <div className="confirm-btn-container">
            <button 
                onClick={handleConfirmBooking} 
                className="confirm-btn"
                disabled={isProcessing}
                style={{ opacity: isProcessing ? 0.6 : 1 }}
            >
                {isProcessing ? 'PROCESSING...' : 'CONFIRM & PAY NOW'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default CreateBookingPage;