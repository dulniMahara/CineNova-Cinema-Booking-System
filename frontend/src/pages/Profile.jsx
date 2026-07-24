import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import API from '../services/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [editedUser, setEditedUser] = useState({
    name: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const role = localStorage.getItem('role');
    setUser({ ...userData, role });
    setEditedUser({ name: userData.name });
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ name: user.name });
  };

  const handleUpdate = async () => {
    if (!editedUser.name) {
      alert('Name is required');
      return;
    }

    setIsLoading(true);
    try {
      await API.put('/auth/profile', editedUser);
      
      const updatedUser = { ...user, name: editedUser.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      alert('Password changed successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await API.delete('/auth/profile');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      alert('Account deleted successfully');
      navigate('/register');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete account');
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-header-section">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>My Profile</h1>
        </div>

        <div className="profile-card">
          <div className="card-header">
            <h2>Profile Information</h2>
            {!isEditing ? (
              <button className="edit-button" onClick={handleEdit}>
                <FaEdit /> Edit
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-button" onClick={handleUpdate} disabled={isLoading}>
                  <FaSave /> {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="info-row">
              <div className="info-label">
                <FaUser className="info-icon" />
                <span>Name</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="info-input"
                  value={editedUser.name}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                />
              ) : (
                <div className="info-value">{user.name}</div>
              )}
            </div>

            <div className="info-row">
              <div className="info-label">
                <FaEnvelope className="info-icon" />
                <span>Email</span>
              </div>
              <div className="info-value">{user.email}</div>
            </div>

            <div className="info-row">
              <div className="info-label">
                <FaUser className="info-icon" />
                <span>Role</span>
              </div>
              <div className="info-value">
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-header">
            <h2>Change Password</h2>
            {!showPasswordForm && (
              <button className="edit-button" onClick={() => setShowPasswordForm(true)}>
                <FaLock /> Change
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="password-form">

              <div className="form-group password-input-box">
                <label>Current Password</label>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  placeholder="Current Password"
                />
                <span className="password-eye-icon" onClick={() => setShowCurrent((prev) => !prev)}>
                  {showCurrent ? <IoMdEyeOff /> : <IoMdEye />}
                </span>
              </div>

              <div className="form-group password-input-box">
                <label>New Password</label>
                <input
                  type={showNew ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  placeholder="New Password"
                />
                <span className="password-eye-icon" onClick={() => setShowNew((prev) => !prev)}>
                  {showNew ? <IoMdEyeOff /> : <IoMdEye />}
                </span>
              </div>

              <div className="form-group password-input-box">
                <label>Confirm New Password</label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  placeholder="Confirm New Password"
                />
                <span className="password-eye-icon" onClick={() => setShowConfirm((prev) => !prev)}>
                  {showConfirm ? <IoMdEyeOff /> : <IoMdEye />}
                </span>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-card danger-card">
          <div className="card-header">
            <h2>Delete Account</h2>
          </div>
          <div className="danger-content">
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button 
              className="delete-button" 
              onClick={handleDeleteAccount}
              disabled={isLoading}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
