import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import './ResendVerification.css';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await API.post(
        '/auth/resend-verification',
        { email }
      );

      if (response.data.success) {
        setStatus('success');
        setMessage('Verification email sent! Please check your inbox.');
        setEmail('');
      }
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        'Failed to send verification email. Please try again.'
      );
    }
  };

  return (
    <div className="resend-verification-container">
      <div className="resend-card">
        <h2>Resend Verification Email</h2>
        <p className="subtitle">
          Enter your email address and we'll send you a new verification link.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === 'loading'}
            />
          </div>

          {message && (
            <div className={`message ${status}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Sending...' : 'Send Verification Email'}
          </button>
        </form>

        <div className="links">
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
