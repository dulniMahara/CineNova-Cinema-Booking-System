import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiShield, FiCreditCard, FiLock } from 'react-icons/fi';
import axios from 'axios';
import './Payment.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data passed from previous page
  const {
    showtimeId,
    selectedSeats, // Objects OR strings like ["A1", "A2"]
    totalPrice,
    movieTitle,
    showtime,
    date,
    hall,
    ticketPrice,
    paymentMethod
  } = location.state || {};

  console.log("PAYMENT PAGE RECEIVED SHOWTIME ID:", showtimeId);
  console.log("PAYMENT PAGE STATE:", location.state);

  const isObjectId = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);

  const displayPrice = totalPrice || 0;
  const displayTitle = (movieTitle && !isObjectId(movieTitle)) ? movieTitle : "Movie Ticket";
  const hallName = (hall && !isObjectId(hall)) ? hall : "Standard 2D";
  const startTime = (showtime && !isObjectId(showtime)) ? showtime : "07:30 PM";
  const formattedDate = (date && !isObjectId(date)) ? date : "Today";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [finalSeats, setFinalSeats] = useState([]);

  const [cardDetails, setCardDetails] = useState({
    cardName: '', cardNumber: '', expiry: '', cvv: ''
  });

  const [mobileBanking, setMobileBanking] = useState({
    bank: "",
    mobileNumber: ""
  });

  useEffect(() => {
    if (!showtimeId || !selectedSeats) {
      setError("Missing booking details. Please return to seat selection.");
      return;
    }

    const fixSeatIds = async () => {
      const isStringArray = selectedSeats.length > 0 && typeof selectedSeats[0] === 'string';

      if (isStringArray) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/seats/${showtimeId}`);
          const allSeats = res.data;

          const realSeatObjects = selectedSeats.map(seatName => {
            const match = seatName.match(/([A-Z]+)(\d+)/);

            if (!match) return null;

            const [, row, num] = match;

            return allSeats.find(
              s => s.row === row && String(s.number) === num
            );
          }).filter(Boolean);

          setFinalSeats(realSeatObjects);

        } catch (err) {
          console.error("Could not fetch seat IDs:", err.response?.data || err);

          setError(
            err.response?.data?.error ||
            "System error: Could not verify seat IDs."
          );
        }
      } else {
        setFinalSeats(selectedSeats);
      }
    };

    fixSeatIds();
  }, [showtimeId, selectedSeats]);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (finalSeats.length === 0) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const payload = {
        showtimeId: showtimeId,
        seats: finalSeats.map(s => s._id),
        amount: displayPrice,
        paymentMethod: paymentMethod || 'Credit Card',
        cardLast4: cardDetails.cardNumber.slice(-4) || '1234'
      };

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/payments`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const seatIdsToBook = finalSeats.map(s => s._id);
      await axios.post(`${process.env.REACT_APP_API_URL}/seats/book-seats`, {
        seatIds: seatIdsToBook
      });

      navigate('/booking-success', {
        state: {
          bookingRef: res.data.payment._id,
          movieTitle: displayTitle,
          showtime: `${formattedDate}, ${startTime}`,
          hall: hallName,
          selectedSeats: selectedSeats,
          amount: displayPrice,
          paymentMethod: paymentMethod
        }
      });

    } catch (err) {
      console.error("Payment Failed:", err);
      if (err.response) {
        alert(`Payment Failed: ${err.response.data.message || err.response.data.error || 'Server Error'}`);
      } else {
        alert('Payment Failed. Please try again.');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-container loading-state">
        <div className="payment-loading-spinner">
          <div className="spinner-ring"></div>
          <h2>Processing Secure Payment...</h2>
          <p>Please do not refresh or close the page.</p>
        </div>
      </div>
    );
  }

  const seatsDisplay = selectedSeats
    ? (typeof selectedSeats[0] === 'string'
      ? selectedSeats.join(', ')
      : selectedSeats.map(s => `${s.row}${s.number}`).join(', '))
    : '';

  return (
    <div className="payment-container">
      <div className="payment-header-controls">
        <button className="back-nav-btn" onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); navigate(-1); }}>
          <FiArrowLeft /> Back
        </button>
      </div>

      <div className="payment-card">
        <div className="payment-card-header">
          <h2>Secure Checkout</h2>
          <p className="payment-method-display">
            Payment Method: <strong>{paymentMethod || 'Credit Card'}</strong>
          </p>
          <p className="movie-for-text">Movie: <span>{displayTitle}</span> | Format: <span>{hallName}</span></p>
          <p className="movie-for-text">Schedule: <span>{formattedDate} at {startTime}</span></p>
          {error && <div className="error-msg">{error}</div>}
        </div>

        <div className="amount-box">
          <span className="label">Total Payable</span>
          <span className="value">Rs. {displayPrice}</span>
          {selectedSeats && selectedSeats.length > 0 && (
            <div className="payment-seats-chips">
              {(typeof selectedSeats[0] === 'string'
                ? selectedSeats
                : selectedSeats.map(s => `${s.row}${s.number}`)
              ).map((seatLabel) => (
                <span key={seatLabel} className="seat-chip gold-chip">
                  {seatLabel}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Security Section Banner */}
        <div className="security-banner">
          <FiShield className="security-icon" />
          <span>Your booking information is securely processed.</span>
        </div>

        <form onSubmit={handlePayment} className="payment-form">
          {paymentMethod === "Credit Card" && (
            <>
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  required
                  autoComplete="cc-name"
                  placeholder="John Doe"
                  value={cardDetails.cardName}
                  onChange={(e) =>
                    setCardDetails({
                      ...cardDetails,
                      cardName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  required
                  autoComplete="cc-number"
                  maxLength="19"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) =>
                    setCardDetails({
                      ...cardDetails,
                      cardNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="row">
                <div className="col form-group">
                  <label>Expiry</label>
                  <input
                    type="text"
                    required
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        expiry: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    required
                    maxLength="4"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cvv: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === "Mobile Banking" && (
            <>
              <div className="form-group">
                <label>Select Bank</label>

                <select
                  required
                  value={mobileBanking.bank}
                  onChange={(e) =>
                    setMobileBanking({
                      ...mobileBanking,
                      bank: e.target.value,
                    })
                  }
                >
                  <option value="">Choose a Bank</option>
                  <option>Commercial Bank</option>
                  <option>Bank of Ceylon</option>
                  <option>People's Bank</option>
                  <option>HNB</option>
                  <option>Sampath Bank</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mobile Number</label>

                <input
                  type="tel"
                  required
                  placeholder="07X XXX XXXX"
                  value={mobileBanking.mobileNumber}
                  onChange={(e) =>
                    setMobileBanking({
                      ...mobileBanking,
                      mobileNumber: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          {paymentMethod === "Pay at Counter" && (
            <div className="counter-info-box">
              <h3>Pay at Counter</h3>

              <p>
                Your selected seats will be reserved temporarily.
              </p>

              <p>
                Please complete your payment at the cinema counter
                at least <strong>30 minutes</strong> before the movie starts.
              </p>

              <p>
                Reservations expire automatically if payment is not completed.
              </p>
            </div>
          )}
          <button
            type="submit"
            className="pay-now-btn"
            disabled={loading}
          >
            {paymentMethod === "Pay at Counter"
              ? "Confirm Reservation"
              : paymentMethod === "Mobile Banking"
                ? "Confirm Payment"
                : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;