import React, { useState } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { validateEmail } from '../../utils/validation';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  const handleEmailChange = (val) => {
    setEmail(val);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
    if (formError) setFormError("");
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
    if (formError) setFormError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    setEmailNotVerified(false);

    const errors = { email: '', password: '' };
    let hasError = false;

    const emailRes = validateEmail(email);
    if (!emailRes.valid) {
      errors.email = emailRes.message;
      hasError = true;
    }

    if (!password) {
      errors.password = "Please enter your password.";
      hasError = true;
    }

    setFieldErrors(errors);

    if (hasError) return;

    setIsLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email: email.trim().toLowerCase(), password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);

      if (data.user.role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid email or password. Please try again.';

      if (errorMessage.toLowerCase().includes('verify your email')) {
        setEmailNotVerified(true);
      } else {
        setFormError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-container">
        <button
          className="auth-back-btn"
          onClick={() => navigate('/home')}
          type="button"
          aria-label="Back to Homepage"
        >
          <FaArrowLeft /> <span>Home</span>
        </button>

        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-title">
            CINE<span className="gold-text">NOVA</span>
          </div>
          <div className="auth-brand-tagline">Where Stories Come Alive</div>
        </div>

        {/* Form Main */}
        <div className="auth-form-body">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your CineNova experience.</p>

          {formError && (
            <div className="auth-alert-error" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            {/* Email Field */}
            <div className="auth-input-group">
              <label htmlFor="login-email" className="auth-label">Email Address</label>
              <div className="auth-field-wrapper">
                <MdEmail className="auth-input-icon-left" />
                <input
                  id="login-email"
                  type="email"
                  className={`auth-text-input ${fieldErrors.email ? 'has-error' : ''}`}
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  aria-label="Email Address"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  required
                />
              </div>
              {fieldErrors.email && (
                <span id="email-error" className="auth-field-error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="auth-input-group">
              <div className="auth-label-row">
                <label htmlFor="login-password" className="auth-label">Password</label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="login-password-field">
                <MdLock className="auth-input-icon-left" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`auth-text-input ${fieldErrors.password ? 'has-error' : ''}`}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  aria-label="Password"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {fieldErrors.password && (
                <span id="password-error" className="auth-field-error">{fieldErrors.password}</span>
              )}
            </div>

            {/* Sign In Button */}
            <button type="submit" className="auth-primary-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-loading-content">
                  <span className="spinner-sm"></span> Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Email Not Verified Alert */}
          {emailNotVerified && (
            <div className="auth-alert-warning">
              <p>Your email address is not verified yet.</p>
              <Link to="/resend-verification" className="auth-resend-link">
                Click here to resend verification email
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <div className="auth-nav-footer">
            <p className="auth-switch-text">
              Don’t have an account?{" "}
              <Link to="/register" className="auth-action-link">
                Create Account
              </Link>
            </p>

            <div className="auth-admin-divider">
              <span className="auth-divider-line"></span>
              <span className="auth-divider-text">OR</span>
              <span className="auth-divider-line"></span>
            </div>

            <p className="auth-admin-text">
              Are you an administrator?{" "}
              <Link to="/admin-login" className="auth-admin-link">
                Admin Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
