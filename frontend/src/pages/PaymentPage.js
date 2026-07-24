import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import axios from 'axios';
import './Payment.css';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    // Get data passed from previous page
    const { 
        showtimeId, 
        selectedSeats, // This might be objects OR just strings like ["J1", "J2"]
        totalPrice, 
        movieTitle 
    } = location.state || {}; 

    const displayPrice = totalPrice || 0;
    const displayTitle = movieTitle || "Movie Ticket";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // We use this state to ensure we always have Real Objects with IDs
    const [finalSeats, setFinalSeats] = useState([]);

    const [cardDetails, setCardDetails] = useState({
        cardName: '', cardNumber: '', expiry: '', cvv: ''
    });

    // 1. SAFETY CHECK & AUTO-FIX SEAT IDs
    useEffect(() => {
        if (!showtimeId || !selectedSeats) {
             setError("Missing booking details. Please go back.");
             return;
        }

        const fixSeatIds = async () => {
            // Check if selectedSeats are just Strings (like "J1") instead of Objects
            const isStringArray = selectedSeats.length > 0 && typeof selectedSeats[0] === 'string';

            if (isStringArray) {
                console.log("Detected Seat Names (J1). Fetching real IDs...");
                try {
                    // Fetch all seats for this showtime to find the matching IDs
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/seats/${showtimeId}`);
                    const allSeats = res.data;

                    // Match "J1" to the real seat object from DB
                    const realSeatObjects = selectedSeats.map(seatName => {
                        // Split "J1" into Row "J" and Number "1"
                        const match = seatName.match(/([A-Z]+)(\d+)/); 
                        if (!match) return null;
                        
                        const [, row, num] = match;
                        return allSeats.find(s => s.row === row && String(s.number) === num);
                    }).filter(Boolean); // Remove any nulls

                    setFinalSeats(realSeatObjects);
                    console.log("Fixed Seats with IDs:", realSeatObjects);
                } catch (err) {
                    console.error("Could not fetch seat IDs", err);
                    setError("System error: Could not verify seat IDs.");
                }
            } else {
                // Already objects? Good to go.
                setFinalSeats(selectedSeats);
            }
        };

        fixSeatIds();
    }, [showtimeId, selectedSeats]);

    const handlePayment = async (e) => {
        e.preventDefault();
        
        // Wait if seat data is not ready yet
        if (finalSeats.length === 0) {
            console.log("Waiting for seat data...");
            return;
        }
        
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // --- PAYLOAD CREATION ---
            const payload = {
                showtimeId: showtimeId,
                seats: finalSeats.map(s => s._id), // Send only IDs to satisfy Backend
                amount: displayPrice,
                paymentMethod: 'Credit Card',
                cardLast4: cardDetails.cardNumber.slice(-4)
            };

            console.log("Sending Payment Payload:", payload);

            // 1. Process Payment
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/payments`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // --- 2. MARK SEATS AS BOOKED ---
            const seatIdsToBook = finalSeats.map(s => s._id); 
            await axios.post(`${process.env.REACT_APP_API_URL}/seats/book-seats`, {
                seatIds: seatIdsToBook
            });
            console.log("Seats successfully marked as booked.");
            
            // --- SUCCESS: Navigate Immediately (No Alert) ---
            navigate('/booking-success', { 
                state: { bookingRef: res.data.payment._id } 
            });
            
        } catch (err) {
            console.error("Payment Failed:", err);
            // We keep the error alert so the user knows if something failed
            if (err.response) {
                console.error("Server Response:", err.response.data);
                alert(`Payment Failed: ${err.response.data.message || err.response.data.error || 'Server Error'}`);
            } else {
                alert('Payment Failed. Check console for details.');
            }
            setLoading(false);
        }
    };

    if (loading) return <div className="payment-container"><h2 style={{color:'white'}}>Processing Payment...</h2></div>;

    return (
        <div className="payment-container">
            <div className="payment-card">
                <div className="payment-header">
                    <h2>Secure Checkout</h2>
                    {error && <div className="error-msg" style={{color: 'red'}}>{error}</div>}
                    <p style={{color: '#9ca3af'}}>For: {displayTitle}</p>
                </div>

                <div className="amount-box">
                    <span className="label">Total Payable</span>
                    <span className="value">Rs. {displayPrice}</span>
                </div>
                
                <div style={{color: '#9ca3af', marginBottom: '15px', fontSize: '0.9rem'}}>
                    {/* Display logic handles both Strings and Objects safely */}
                    Seats: {selectedSeats ? (typeof selectedSeats[0] === 'string' ? selectedSeats.join(', ') : selectedSeats.map(s=>s.number).join(', ')) : ''}
                </div>

                <form onSubmit={handlePayment}>
                    <div className="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" required className="form-input" placeholder="Name"
                            onChange={e => setCardDetails({...cardDetails, cardName: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Card Number</label>
                        <input type="text" required maxLength="16" className="form-input" placeholder="0000 0000 0000 0000"
                            onChange={e => setCardDetails({...cardDetails, cardNumber: e.target.value})} />
                    </div>
                    <div className="row">
                        <div className="col form-group">
                            <label>Expiry</label>
                            <input type="text" required placeholder="MM/YY" className="form-input"
                                onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} />
                        </div>
                        <div className="col form-group">
                            <label>CVV</label>
                            <input type="password" required maxLength="3" placeholder="123" className="form-input"
                                onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})} />
                        </div>
                    </div>

                    <button type="submit" className="pay-btn" disabled={loading || error}>
                        {loading ? 'PROCESSING...' : 'PAY NOW'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;