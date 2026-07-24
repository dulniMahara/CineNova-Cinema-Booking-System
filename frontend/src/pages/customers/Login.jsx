import React, { useState } from 'react';
import { FaUser, FaArrowLeft } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); 

    if (!email || !password) {
      alert("Email and password are required");
      return; 
    }

    setIsLoading(true);
    setEmailNotVerified(false);
    try {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('role', data.user.role);
    
    
    if (data.user.role === 'admin') {
      navigate("/admin/movies");
    } else {
      navigate("/home");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed';
    
    // Check if error is about unverified email
    if (errorMessage.toLowerCase().includes('verify your email')) {
      setEmailNotVerified(true);
    }
    
    alert(errorMessage);
  } finally {
    setIsLoading(false);
  }
  };

  return (
    <div className="login-wrapper">
      <div className="login-form-box">
        <button className="back-button" onClick={() => navigate('/home')} type="button">
          <FaArrowLeft />
        </button>
        <form onSubmit={handleLogin}>
          <h1>Login</h1>

          <div className="login-input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email Address"
            />
            <FaUser className="icon" />
          </div>

          <div className="login-input-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
            />
            <div className="icon" onClick={() => setShowPassword(!showPassword)} style={{cursor: 'pointer'}}>
              {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
            </div>
          </div>

          <div className="login-forgot-password">
            <label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </label>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>

          {emailNotVerified && (
            <div className="email-not-verified" style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#856404', fontSize: '14px' }}>
                Your email is not verified yet.
              </p>
              <Link 
                to="/resend-verification" 
                style={{ 
                  color: '#0056b3', 
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Click here to resend verification email
              </Link>
            </div>
          )}

          <div className="register">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>

           <div className="admin-login">
            <p>
              Are you an admin? <Link to="/admin-login">Admin Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
