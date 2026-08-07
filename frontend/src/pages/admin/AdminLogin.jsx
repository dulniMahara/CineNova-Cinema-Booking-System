import React, { useState } from 'react'
import './AdminLogin.css'
import { FaUser, FaHome } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const AdminLogin = () => {
    const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault(); 

    if (!email || !password) {
      alert("Email and password are required");
      return; 
    }

    setIsLoading(true);
    try {
    const { data } = await API.post('/auth/adminlogin', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('role', data.user.role);
    navigate("/admin/dashboard");
  } catch (error) {
    alert(error.response?.data?.message || 'Admin login failed');
  } finally {
    setIsLoading(false);
  }
  };
  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-form-box">
        <button className="back-button" onClick={() => navigate('/home')} type="button" aria-label="Back to Home" title="Back to Home">
          <FaHome size={22} />
        </button>

        <div className="admin-brand-header">
          <div className="admin-brand-title">
            CINE<span className="gold-text">NOVA</span>
          </div>
          <div className="admin-badge-container">
            <span className="admin-badge">ADMIN PORTAL</span>
          </div>
        </div>

        <form onSubmit={handleAdminLogin}>
          <div className="admin-login-input-box">
            <input
              type="email"
              placeholder="Admin Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email Address"
              required
            />
            <FaUser className="icon" />
          </div>

          <div className="admin-login-input-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              required
            />
            <div className="icon toggle-pwd-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
            </div>
          </div>

          <button type="submit" className="admin-submit-btn" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Access Admin Portal"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
