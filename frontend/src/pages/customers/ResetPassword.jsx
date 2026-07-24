import React, { useState, useRef } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import './ResetPassword.css';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.includes("")) {
      alert("Please enter the complete 6-digit code");
      return;
    }

    const email = localStorage.getItem('resetEmail');
  const otpString = otp.join('');

  setIsLoading(true);
  try {
    await API.post('/password/verify-otp', { email, otp: otpString });
    navigate("/confirm-password");
  } catch (error) {
    alert(error.response?.data?.message || 'Invalid OTP');
  } finally {
    setIsLoading(false);
  }
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-form-box">
        <button className="back-button" onClick={() => navigate('/forgot-password')} type="button">
          <FaArrowLeft />
        </button>
        <form onSubmit={handleSubmit}>
          <h1>Forgot Password</h1>

          <div className="label">
            <label>Enter the 6 digit code</label>
          </div>

          <div className="reset-input-box">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
