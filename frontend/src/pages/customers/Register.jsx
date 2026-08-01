import React, { useState, useRef } from 'react';
import { FaUser, FaArrowLeft, FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { validateSriLankanPhone } from '../../utils/validation';

const Register = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formErrors, setFormErrors] = useState({
      name: '',
      email: '',
      phone: '',
      password: ''
    });

    const phoneRef = useRef(null);

    const handlePhoneChange = (val) => {
      setPhone(val);
      if (formErrors.phone) {
        const res = validateSriLankanPhone(val);
        setFormErrors(prev => ({ ...prev, phone: res.valid ? '' : res.message }));
      }
    };

    const handlePhoneBlur = () => {
      if (phone) {
        const res = validateSriLankanPhone(phone);
        setFormErrors(prev => ({ ...prev, phone: res.valid ? '' : res.message }));
      }
    };

    const handleSignup = async (e) => {
      e.preventDefault();

      const errors = { name: '', email: '', phone: '', password: '' };
      let hasError = false;

      if (!name.trim()) {
        errors.name = "Please enter your name.";
        hasError = true;
      }
      if (!email.trim()) {
        errors.email = "Please enter your email.";
        hasError = true;
      }
      if (phone) {
        const pRes = validateSriLankanPhone(phone);
        if (!pRes.valid) {
          errors.phone = pRes.message;
          hasError = true;
        }
      }
      if (!password) {
        errors.password = "Please enter a password.";
        hasError = true;
      }

      setFormErrors(errors);

      if (hasError) {
        if (errors.phone && phoneRef.current) {
          phoneRef.current.focus();
        }
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await API.post('/auth/register', { name, email, phone, password });
        alert(data.message || "Registration successful! Please check your email to verify your account.");
        navigate("/login");
      } catch (error) {
        alert(error.response?.data?.message || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    };

  return (
     <div className="register-wrapper">
            <div className="register-form-box">
            <button className="back-button" onClick={() => navigate('/home')} type="button">
              <FaArrowLeft />
            </button>
            <form action="" onSubmit={handleSignup} noValidate>
                <h1>Register</h1>
                <div className="register-input-box">
                    <input type="text" placeholder='Full Name' value={name} onChange={(e) => setName(e.target.value)} aria-label="Full Name" required />
                    <FaUser className='icon' />
                </div>
                {formErrors.name && <span className="inline-error-text" style={{ color: '#FCA5A5', fontSize: '0.8rem', display: 'block', marginTop: '-10px', marginBottom: '10px' }}>{formErrors.name}</span>}

                <div className="register-input-box">
                    <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email Address" required />
                    <MdEmail className='icon' />
                </div>
                {formErrors.email && <span className="inline-error-text" style={{ color: '#FCA5A5', fontSize: '0.8rem', display: 'block', marginTop: '-10px', marginBottom: '10px' }}>{formErrors.email}</span>}

                <div className="register-input-box">
                    <input
                      ref={phoneRef}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder='Mobile Number (e.g. 0771234567)'
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={handlePhoneBlur}
                      aria-label="Mobile Number"
                    />
                    <FaPhone className='icon' />
                </div>
                {formErrors.phone && <span className="inline-error-text" style={{ color: '#FCA5A5', fontSize: '0.8rem', display: 'block', marginTop: '-10px', marginBottom: '10px' }}>{formErrors.phone}</span>}

                <div className="register-input-box">
                    <input type={showPassword ? "text" : "password"} placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" required />
                    <div className='icon' onClick={() => setShowPassword(!showPassword)} style={{cursor: 'pointer'}}>
                      {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                    </div>
                </div>
                {formErrors.password && <span className="inline-error-text" style={{ color: '#FCA5A5', fontSize: '0.8rem', display: 'block', marginTop: '-10px', marginBottom: '10px' }}>{formErrors.password}</span>}

                <button type='submit' disabled={isLoading}>
                  {isLoading ? "Signing up..." : "Sign up"}
                </button>

                <div className="register">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </form>
            </div>
        </div>
  )
}

export default Register
