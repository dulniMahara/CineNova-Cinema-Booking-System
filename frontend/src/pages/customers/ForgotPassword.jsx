import React, { useState } from 'react'
import { FaUser, FaArrowLeft } from "react-icons/fa";
import './ForgotPassword.css'
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

   const handleSendOtp = async (e) => {
    e.preventDefault(); 

    if (!email) {
      alert("Email is required");
      return; 
    }

    setIsLoading(true);
    try {
    await API.post('/password/send-otp', { email });
    localStorage.setItem('resetEmail', email);
    alert('OTP sent to your email!');
    navigate("/reset-password");
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to send OTP');
  } finally {
    setIsLoading(false);
  }
  };
    
  return (
    <div className="forgotpassword-wrapper">
        <div className="forgotpassword-form-box">
        <button className="back-button" onClick={() => navigate('/login')} type="button">
          <FaArrowLeft />
        </button>
        <form action="" onSubmit={handleSendOtp}>
            <h1>Forgot Password</h1>
            <div className="label">
                <label>Enter your email address</label>
            </div>
            <div className="forgotpassword-input-box">
                <input type="email" placeholder='Email' value={email}
              onChange={(e) => setEmail(e.target.value)} aria-label="Email Address" />
                <FaUser className='icon' />
            </div>

            <button type='submit' disabled={!email || isLoading}>
              {isLoading ? "Sending..." : "Send OTP"}
            </button>

        </form>
        </div>
    </div>
  )
}

export default ForgotPassword
