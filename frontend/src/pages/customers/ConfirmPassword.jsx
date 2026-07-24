import React, { useState } from 'react'
import './ConfirmPassword.css'
import { FaArrowLeft } from 'react-icons/fa'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const ConfirmPassword = () => {

const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault(); 

    if (!newPassword || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }
    const email = localStorage.getItem('resetEmail');


    setIsLoading(true);
    try {
    await API.post('/password/reset-password', { email, newPassword });
    localStorage.removeItem('resetEmail');
    alert('Password changed successfully!');
    navigate("/login");
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to reset password');
  } finally {
    setIsLoading(false);
  }
  };
  return (
     <div className="changepassword-wrapper">
            <div className="changepassword-form-box">
            <button className="back-button" onClick={() => navigate('/reset-password')} type="button">
              <FaArrowLeft />
            </button>
            <form action="" onSubmit={handleChangePassword}>
                <h1>Forgot Password</h1>
                <div className="label">
                    <label>Enter the new password</label>
                </div>
                <div className="changepassword-input-box">
                    <input type={showNewPassword ? "text" : "password"} placeholder='New Password' value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} aria-label="New Password"/>
                    <div className='icon' onClick={() => setShowNewPassword(!showNewPassword)} style={{cursor: 'pointer'}}>
                      {showNewPassword ? <IoMdEyeOff /> : <IoMdEye />}
                    </div>
                </div>

                <div className="label">
                    <label>Confirm New Password</label>
                </div>
                <div className="changepassword-input-box">
                    <input type={showConfirmPassword ? "text" : "password"} placeholder='Confirm New Password' value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} aria-label="Confirm New Password"/>
                    <div className='icon' onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{cursor: 'pointer'}}>
                      {showConfirmPassword ? <IoMdEyeOff /> : <IoMdEye />}
                    </div>
                </div>

                <button type='submit' disabled={isLoading}>
                  {isLoading ? "Changing Password..." : "Change Password"}
                </button>
    
            </form>
            </div>
        </div>
  )
}

export default ConfirmPassword
