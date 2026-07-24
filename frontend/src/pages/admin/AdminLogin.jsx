import React, { useState } from 'react'
import './AdminLogin.css'
import { FaUser, FaArrowLeft } from "react-icons/fa";
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
    navigate("/admin/movies");
  } catch (error) {
    alert(error.response?.data?.message || 'Admin login failed');
  } finally {
    setIsLoading(false);
  }
  };
  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-form-box">
        <button className="back-button" onClick={() => navigate('/home')} type="button">
          <FaArrowLeft />
        </button>
        <form onSubmit={handleAdminLogin}>
          <h1>Admin Login</h1>

          <div className="admin-login-input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email Address"
            />
            <FaUser className="icon" />
          </div>

          <div className="admin-login-input-box">
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


          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>

          
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
