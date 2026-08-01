import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import axios from 'axios';
import {
  validateSriLankanPhone,
  validateCardNumber,
  validateCardholderName,
  validateExpiryDate,
  validateCVV
} from '../utils/validation';
import './Payment.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Field refs for focus-on-error behavior
  const cardNameRef = useRef(null);
  const cardNumberRef = useRef(null);
  const expiryRef = useRef(null);
  const cvvRef = useRef(null);
  const bankRef = useRef(null);
  const mobileNumberRef = useRef(null);

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

  const [fieldErrors, setFieldErrors] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    bank: '',
    mobileNumber: ''
  });

  useEffect(() => {
    if (!showtimeId || !isObjectId(showtimeId) || !selectedSeats || selectedSeats.length === 0) {
      setError("Missing or invalid booking details. Please return to seat selection.");
      return;
    }

    const fixSeatIds = async () => {
      const isStringArray = selectedSeats.length > 0 && typeof selectedSeats[0] === 'string';

      if (isStringArray) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/seats/${showtimeId}`);
          const allSeats = Array.isArray(res.data) ? res.data : (res.data?.data || []);

          const realSeatObjects = selectedSeats.map(seatName => {
            const match = seatName.match(/([A-Z]+)(\d+)/);

            if (!match) return null;

            const [, row, num] = match;

            return allSeats.find(
              s => s.row === row && String(s.number) === num
            );
          }).filter(Boolean);

          if (realSeatObjects.length === 0) {
            setError("Could not verify selected seats for this showtime.");
          } else {
            setFinalSeats(realSeatObjects);
          }

        } catch (err) {
          console.error("Could not fetch seat IDs:", err.response?.data || err);

          setError(
            err.response?.data?.message ||
            err.response?.data?.error ||
            "System error: Could not verify seat IDs."
          );
        }
      } else {
        const validObjects = selectedSeats.filter(s => s && s._id && isObjectId(s._id));
        if (validObjects.length === 0) {
          setError("Selected seats have invalid identifiers. Please re-select seats.");
        } else {
          setFinalSeats(validObjects);
        }
      }
    };

    fixSeatIds();
  }, [showtimeId, selectedSeats]);

  // Input change & blur handlers with validation
  const handleCardNameChange = (val) => {
    setCardDetails(prev => ({ ...prev, cardName: val }));
    if (fieldErrors.cardName) {
      const res = validateCardholderName(val);
      setFieldErrors(prev => ({ ...prev, cardName: res.valid ? '' : res.message }));
    }
  };

  const handleCardNameBlur = () => {
    const res = validateCardholderName(cardDetails.cardName);
    setFieldErrors(prev => ({ ...prev, cardName: res.valid ? '' : res.message }));
  };

  const handleCardNumberChange = (val) => {
    const res = validateCardNumber(val);
    setCardDetails(prev => ({ ...prev, cardNumber: res.formatted }));
    if (fieldErrors.cardNumber) {
      setFieldErrors(prev => ({ ...prev, cardNumber: res.valid ? '' : res.message }));
    }
  };

  const handleCardNumberBlur = () => {
    const res = validateCardNumber(cardDetails.cardNumber);
    setFieldErrors(prev => ({ ...prev, cardNumber: res.valid ? '' : res.message }));
  };

  const handleExpiryChange = (val) => {
    const res = validateExpiryDate(val);
    setCardDetails(prev => ({ ...prev, expiry: res.formatted }));
    if (fieldErrors.expiry) {
      setFieldErrors(prev => ({ ...prev, expiry: res.valid ? '' : res.message }));
    }
  };

  const handleExpiryBlur = () => {
    const res = validateExpiryDate(cardDetails.expiry);
    setFieldErrors(prev => ({ ...prev, expiry: res.valid ? '' : res.message }));
  };

  const handleCVVChange = (val) => {
    const res = validateCVV(val);
    setCardDetails(prev => ({ ...prev, cvv: res.clean }));
    if (fieldErrors.cvv) {
      setFieldErrors(prev => ({ ...prev, cvv: res.valid ? '' : res.message }));
    }
  };

  const handleCVVBlur = () => {
    const res = validateCVV(cardDetails.cvv);
    setFieldErrors(prev => ({ ...prev, cvv: res.valid ? '' : res.message }));
  };

  const handleMobileNumberChange = (val) => {
    setMobileBanking(prev => ({ ...prev, mobileNumber: val }));
    if (fieldErrors.mobileNumber) {
      const res = validateSriLankanPhone(val);
      setFieldErrors(prev => ({ ...prev, mobileNumber: res.valid ? '' : res.message }));
    }
  };

  const handleMobileNumberBlur = () => {
    const res = validateSriLankanPhone(mobileBanking.mobileNumber);
    setFieldErrors(prev => ({ ...prev, mobileNumber: res.valid ? '' : res.message }));
  };

  const validateForm = () => {
    const currentMethod = paymentMethod || 'Credit Card';
    const errors = {
      cardName: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      bank: '',
      mobileNumber: ''
    };
    let firstInvalidRef = null;

    if (currentMethod === 'Credit Card') {
      const nameRes = validateCardholderName(cardDetails.cardName);
      if (!nameRes.valid) {
        errors.cardName = nameRes.message;
        if (!firstInvalidRef) firstInvalidRef = cardNameRef;
      }

      const numRes = validateCardNumber(cardDetails.cardNumber);
      if (!numRes.valid) {
        errors.cardNumber = numRes.message;
        if (!firstInvalidRef) firstInvalidRef = cardNumberRef;
      }

      const expRes = validateExpiryDate(cardDetails.expiry);
      if (!expRes.valid) {
        errors.expiry = expRes.message;
        if (!firstInvalidRef) firstInvalidRef = expiryRef;
      }

      const cvvRes = validateCVV(cardDetails.cvv);
      if (!cvvRes.valid) {
        errors.cvv = cvvRes.message;
        if (!firstInvalidRef) firstInvalidRef = cvvRef;
      }
    } else if (currentMethod === 'Mobile Banking') {
      if (!mobileBanking.bank) {
        errors.bank = 'Please select your bank.';
        if (!firstInvalidRef) firstInvalidRef = bankRef;
      }

      const phoneRes = validateSriLankanPhone(mobileBanking.mobileNumber);
      if (!phoneRes.valid) {
        errors.mobileNumber = phoneRes.message;
        if (!firstInvalidRef) firstInvalidRef = mobileNumberRef;
      }
    }

    setFieldErrors(errors);

    if (firstInvalidRef && firstInvalidRef.current) {
      firstInvalidRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidRef.current.focus();
      return false;
    }

    const hasError = Object.values(errors).some(msg => msg !== '');
    return !hasError;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!showtimeId || !isObjectId(showtimeId)) {
      setError("Invalid showtime ID. Please return to movie details.");
      return;
    }

    if (finalSeats.length === 0) {
      setError("No valid seats selected for payment.");
      return;
    }

    const invalidSeat = finalSeats.find(s => !s._id || !isObjectId(s._id));
    if (invalidSeat) {
      setError("Selected seats contain invalid identifiers.");
      return;
    }

    const isValid = validateForm();
    if (!isValid) return;

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

      const newBookingId = res.data.bookingId || res.data.booking?._id;

      navigate(`/booking-success/${newBookingId}`, {
        state: {
          bookingId: newBookingId,
          bookingRef: res.data.bookingReference || res.data.booking?.bookingReference,
          booking: res.data.booking
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

  const currentMethod = paymentMethod || 'Credit Card';
  const hasValidationErrors = (currentMethod === 'Credit Card' && (fieldErrors.cardName || fieldErrors.cardNumber || fieldErrors.expiry || fieldErrors.cvv)) ||
                             (currentMethod === 'Mobile Banking' && (fieldErrors.bank || fieldErrors.mobileNumber));

  return (
    <div className="payment-container">
      <div className="payment-header-controls">
        <button className="back-nav-btn" onClick={() => { navigate(-1); }}>
          <FiArrowLeft /> Back
        </button>
      </div>

      <div className="payment-card">
        <div className="payment-card-header">
          <h2>Secure Checkout</h2>
          <p className="payment-method-display">
            Payment Method: <strong>{currentMethod}</strong>
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

        <form onSubmit={handlePayment} className="payment-form" noValidate>
          {currentMethod === "Credit Card" && (
            <>
              <div className="form-group">
                <label htmlFor="cardName">Cardholder Name</label>
                <input
                  id="cardName"
                  ref={cardNameRef}
                  type="text"
                  required
                  autoComplete="cc-name"
                  placeholder="John Doe"
                  className={`form-input ${fieldErrors.cardName ? 'input-error' : ''}`}
                  value={cardDetails.cardName}
                  onChange={(e) => handleCardNameChange(e.target.value)}
                  onBlur={handleCardNameBlur}
                  aria-invalid={!!fieldErrors.cardName}
                />
                {fieldErrors.cardName && (
                  <span className="inline-error-text">{fieldErrors.cardName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  id="cardNumber"
                  ref={cardNumberRef}
                  type="text"
                  inputMode="numeric"
                  required
                  autoComplete="cc-number"
                  maxLength="19"
                  placeholder="4242 4242 4242 4242"
                  className={`form-input ${fieldErrors.cardNumber ? 'input-error' : ''}`}
                  value={cardDetails.cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  onBlur={handleCardNumberBlur}
                  aria-invalid={!!fieldErrors.cardNumber}
                />
                {fieldErrors.cardNumber && (
                  <span className="inline-error-text">{fieldErrors.cardNumber}</span>
                )}
              </div>

              <div className="row">
                <div className="col form-group">
                  <label htmlFor="expiry">Expiry</label>
                  <input
                    id="expiry"
                    ref={expiryRef}
                    type="text"
                    inputMode="numeric"
                    required
                    autoComplete="cc-exp"
                    maxLength="5"
                    placeholder="MM/YY"
                    className={`form-input ${fieldErrors.expiry ? 'input-error' : ''}`}
                    value={cardDetails.expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    onBlur={handleExpiryBlur}
                    aria-invalid={!!fieldErrors.expiry}
                  />
                  {fieldErrors.expiry && (
                    <span className="inline-error-text">{fieldErrors.expiry}</span>
                  )}
                </div>

                <div className="col form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    ref={cvvRef}
                    type="password"
                    inputMode="numeric"
                    required
                    autoComplete="cc-csc"
                    maxLength="3"
                    placeholder="123"
                    className={`form-input ${fieldErrors.cvv ? 'input-error' : ''}`}
                    value={cardDetails.cvv}
                    onChange={(e) => handleCVVChange(e.target.value)}
                    onBlur={handleCVVBlur}
                    aria-invalid={!!fieldErrors.cvv}
                  />
                  {fieldErrors.cvv && (
                    <span className="inline-error-text">{fieldErrors.cvv}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {currentMethod === "Mobile Banking" && (
            <>
              <div className="form-group">
                <label htmlFor="bankSelect">Select Bank</label>
                <select
                  id="bankSelect"
                  ref={bankRef}
                  required
                  className={`form-input ${fieldErrors.bank ? 'input-error' : ''}`}
                  value={mobileBanking.bank}
                  onChange={(e) => {
                    setMobileBanking(prev => ({ ...prev, bank: e.target.value }));
                    if (e.target.value) setFieldErrors(prev => ({ ...prev, bank: '' }));
                  }}
                  aria-invalid={!!fieldErrors.bank}
                >
                  <option value="">Choose a Bank</option>
                  <option>Commercial Bank</option>
                  <option>Bank of Ceylon</option>
                  <option>People's Bank</option>
                  <option>HNB</option>
                  <option>Sampath Bank</option>
                </select>
                {fieldErrors.bank && (
                  <span className="inline-error-text">{fieldErrors.bank}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input
                  id="mobileNumber"
                  ref={mobileNumberRef}
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  placeholder="0771234567 or +94771234567"
                  className={`form-input ${fieldErrors.mobileNumber ? 'input-error' : ''}`}
                  value={mobileBanking.mobileNumber}
                  onChange={(e) => handleMobileNumberChange(e.target.value)}
                  onBlur={handleMobileNumberBlur}
                  aria-invalid={!!fieldErrors.mobileNumber}
                />
                {fieldErrors.mobileNumber && (
                  <span className="inline-error-text">{fieldErrors.mobileNumber}</span>
                )}
              </div>
            </>
          )}

          {currentMethod === "Pay at Counter" && (
            <div className="counter-info-box">
              <h3>Pay at Counter</h3>
              <p>Your selected seats will be reserved temporarily.</p>
              <p>Please complete your payment at the cinema counter at least <strong>30 minutes</strong> before the movie starts.</p>
              <p>Reservations expire automatically if payment is not completed.</p>
            </div>
          )}

          <button
            type="submit"
            className="pay-btn"
            disabled={loading || hasValidationErrors}
          >
            {currentMethod === "Pay at Counter"
              ? "Confirm Reservation"
              : currentMethod === "Mobile Banking"
                ? "Confirm Payment"
                : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;