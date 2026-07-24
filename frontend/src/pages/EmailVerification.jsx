import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import './EmailVerification.css';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await API.get(
          `/auth/verify-email/${token}`
        );
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Email verified successfully!');
          
          // Store token and user data if provided
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('role', response.data.user.role);
          }
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="email-verification-container">
      <div className="verification-card">
        {status === 'verifying' && (
          <>
            <div className="spinner"></div>
            <h2>{message}</h2>
            <p>Please wait while we verify your email address...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>{message}</h2>
            <p>Your email has been verified successfully. You can now access all features of your account.</p>
            <Link to="/login" className="home-button">Login to Your Account</Link>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="error-icon">✗</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <div className="action-buttons">
              <Link to="/resend-verification" className="resend-button">
                Request New Verification Email
              </Link>
              <Link to="/" className="home-button">Go to Home</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
