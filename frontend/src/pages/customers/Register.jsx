import React, { useState, useRef } from 'react';
import { FaUser, FaArrowLeft, FaPhone } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { 
  validateName, 
  validateEmail, 
  validateSriLankanPhone, 
  validatePassword, 
  validateConfirmPassword 
} from '../../utils/validation';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);

  // Real-time password requirement checks
  const pwdReqs = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const handleNameChange = (val) => {
    setName(val);
    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
    if (formError) setFormError("");
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
    if (formError) setFormError("");
  };

  const handlePhoneChange = (val) => {
    if (val.length > 10) return;
    setPhone(val);
    if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
    if (formError) setFormError("");
  };

  const handlePhoneBlur = () => {
    if (phone) {
      const res = validateSriLankanPhone(phone);
      setFormErrors(prev => ({ ...prev, phone: res.valid ? '' : res.message }));
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (formErrors.password) setFormErrors(prev => ({ ...prev, password: '' }));
    if (formErrors.confirmPassword && confirmPassword) {
      const matchRes = validateConfirmPassword(val, confirmPassword);
      setFormErrors(prev => ({ ...prev, confirmPassword: matchRes.valid ? '' : matchRes.message }));
    }
    if (formError) setFormError("");
  };

  const handleConfirmPasswordChange = (val) => {
    setConfirmPassword(val);
    if (formErrors.confirmPassword) {
      const matchRes = validateConfirmPassword(password, val);
      setFormErrors(prev => ({ ...prev, confirmPassword: matchRes.valid ? '' : matchRes.message }));
    }
    if (formError) setFormError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const errors = { name: '', email: '', phone: '', password: '', confirmPassword: '' };
    let hasError = false;
    let firstErrorRef = null;

    const nameRes = validateName(name);
    if (!nameRes.valid) {
      errors.name = nameRes.message;
      hasError = true;
      if (!firstErrorRef) firstErrorRef = nameRef;
    }

    const emailRes = validateEmail(email);
    if (!emailRes.valid) {
      errors.email = emailRes.message;
      hasError = true;
      if (!firstErrorRef) firstErrorRef = emailRef;
    }

    if (phone) {
      const phoneRes = validateSriLankanPhone(phone);
      if (!phoneRes.valid) {
        errors.phone = phoneRes.message;
        hasError = true;
        if (!firstErrorRef) firstErrorRef = phoneRef;
      }
    }

    const pwdRes = validatePassword(password);
    if (!pwdRes.valid) {
      errors.password = pwdRes.message;
      hasError = true;
      if (!firstErrorRef) firstErrorRef = passwordRef;
    }

    const confirmRes = validateConfirmPassword(password, confirmPassword);
    if (!confirmRes.valid) {
      errors.confirmPassword = confirmRes.message;
      hasError = true;
    }

    setFormErrors(errors);

    if (hasError) {
      if (firstErrorRef && firstErrorRef.current) {
        firstErrorRef.current.focus();
      }
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await API.post('/auth/register', { 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        phone: phone.trim(), 
        password 
      });

      const msg = data.message || "Account created successfully! Please check your inbox to verify your email address.";
      setSuccessMessage(msg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Unable to create your account. Please try again.';
      setFormError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card-container">
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

        {/* Header Title */}
        <div className="auth-form-body">
          <h1 className="auth-title">Create Your CineNova Account</h1>
          <p className="auth-subtitle">Join CineNova and start booking your favourite movies.</p>

          {formError && (
            <div className="auth-alert-error" role="alert">
              {formError}
            </div>
          )}

          {successMessage && (
            <div className="auth-alert-success" role="status">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSignup} noValidate>
            {/* Desktop 2-Column Grid Layout */}
            <div className="register-form-grid">
              
              {/* Full Name */}
              <div className="auth-input-group">
                <label htmlFor="reg-name" className="auth-label">
                  Full Name <span className="req-star">*</span>
                </label>
                <div className="auth-field-wrapper">
                  <FaUser className="auth-input-icon-left" />
                  <input
                    id="reg-name"
                    ref={nameRef}
                    type="text"
                    className={`auth-text-input ${formErrors.name ? 'has-error' : ''}`}
                    autoComplete="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    aria-label="Full Name"
                    aria-invalid={!!formErrors.name}
                    aria-describedby={formErrors.name ? "name-error" : undefined}
                    required
                  />
                </div>
                {formErrors.name && (
                  <span id="name-error" className="auth-field-error">{formErrors.name}</span>
                )}
              </div>

              {/* Phone Number */}
              <div className="auth-input-group">
                <label htmlFor="reg-phone" className="auth-label">
                  Mobile Number <span className="opt-text">(Optional)</span>
                </label>
                <div className="auth-field-wrapper">
                  <FaPhone className="auth-input-icon-left" />
                  <input
                    id="reg-phone"
                    ref={phoneRef}
                    type="tel"
                    className={`auth-text-input ${formErrors.phone ? 'has-error' : ''}`}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0771234567"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={handlePhoneBlur}
                    aria-label="Mobile Number"
                    aria-invalid={!!formErrors.phone}
                    aria-describedby={formErrors.phone ? "phone-error" : undefined}
                  />
                </div>
                {formErrors.phone && (
                  <span id="phone-error" className="auth-field-error">{formErrors.phone}</span>
                )}
              </div>

              {/* Email Address */}
              <div className="auth-input-group full-width">
                <label htmlFor="reg-email" className="auth-label">
                  Email Address <span className="req-star">*</span>
                </label>
                <div className="auth-field-wrapper">
                  <MdEmail className="auth-input-icon-left" />
                  <input
                    id="reg-email"
                    ref={emailRef}
                    type="email"
                    className={`auth-text-input ${formErrors.email ? 'has-error' : ''}`}
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    aria-label="Email Address"
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? "reg-email-error" : undefined}
                    required
                  />
                </div>
                {formErrors.email && (
                  <span id="reg-email-error" className="auth-field-error">{formErrors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <label htmlFor="reg-password" className="auth-label">
                  Password <span className="req-star">*</span>
                </label>
                <div className="register-password-field">
                  <MdLock className="auth-input-icon-left" />
                  <input
                    id="reg-password"
                    name="password"
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    className={`auth-text-input ${formErrors.password ? 'has-error' : ''}`}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    aria-label="Password"
                    aria-invalid={!!formErrors.password}
                    aria-describedby={formErrors.password ? "reg-password-error" : undefined}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formErrors.password && (
                  <span id="reg-password-error" className="auth-field-error">{formErrors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="auth-input-group">
                <label htmlFor="reg-confirm-password" className="auth-label">
                  Confirm Password <span className="req-star">*</span>
                </label>
                <div className="register-password-field">
                  <MdLock className="auth-input-icon-left" />
                  <input
                    id="reg-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`auth-text-input ${formErrors.confirmPassword ? 'has-error' : ''}`}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    aria-label="Confirm Password"
                    aria-invalid={!!formErrors.confirmPassword}
                    aria-describedby={formErrors.confirmPassword ? "confirm-error" : undefined}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <span id="confirm-error" className="auth-field-error">{formErrors.confirmPassword}</span>
                )}
              </div>

            </div>

            {/* Password Requirements Indicator */}
            <div className="pwd-requirements-box">
              <div className="pwd-req-title">Password must contain:</div>
              <div className="pwd-req-grid">
                <span className={`pwd-req-pill ${pwdReqs.length ? 'met' : ''}`}>
                  {pwdReqs.length ? '✓' : '•'} 8+ Characters
                </span>
                <span className={`pwd-req-pill ${pwdReqs.upper ? 'met' : ''}`}>
                  {pwdReqs.upper ? '✓' : '•'} Uppercase Letter
                </span>
                <span className={`pwd-req-pill ${pwdReqs.lower ? 'met' : ''}`}>
                  {pwdReqs.lower ? '✓' : '•'} Lowercase Letter
                </span>
                <span className={`pwd-req-pill ${pwdReqs.number ? 'met' : ''}`}>
                  {pwdReqs.number ? '✓' : '•'} One Number
                </span>
                <span className={`pwd-req-pill ${pwdReqs.special ? 'met' : ''}`}>
                  {pwdReqs.special ? '✓' : '•'} Special Character (!@#$)
                </span>
              </div>
            </div>

            {/* Create Account Button */}
            <button type="submit" className="auth-primary-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-loading-content">
                  <span className="spinner-sm"></span> Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign In Navigation */}
          <div className="auth-nav-footer">
            <p className="auth-switch-text">
              Already have an account?{" "}
              <Link to="/login" className="auth-action-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
