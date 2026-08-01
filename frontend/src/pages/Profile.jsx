import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiShield, 
  FiLock, 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiEye, 
  FiEyeOff, 
  FiAlertTriangle, 
  FiAward, 
  FiArrowLeft,
  FiTrash2,
  FiCheckCircle
} from 'react-icons/fi';
import Avatar from '../components/Avatar';
import API from '../services/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Custom modal for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const role = localStorage.getItem('role');
    setUser({ ...userData, role: role || 'customer' });
    setEditedUser({ name: userData.name || '' });

    // Auto-scroll to change password section if hash is present
    if (location.hash === '#change-password') {
      const el = document.getElementById('change-password-card');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 200);
      }
    }
  }, [location.hash]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ name: user.name });
  };

  const handleUpdate = async () => {
    if (!editedUser.name.trim()) {
      alert('Name is required');
      return;
    }

    setIsLoading(true);
    try {
      await API.put('/auth/profile', { name: editedUser.name });
      
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
      alert('Password changed successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
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
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-page-container">

        {/* Top Control Bar */}
        <div className="profile-top-bar">
          <button className="profile-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
        </div>

        {/* SECTION 1: PROFILE HEADER */}
        <div className="profile-header-card">
          <div className="header-card-glow"></div>
          <div className="header-card-content">
            <div className="profile-avatar-wrapper">
              <Avatar name={user.name} size="large" />
            </div>
            
            <div className="header-user-meta">
              <h1 className="user-title-name">{user.name || 'User'}</h1>
              <p className="user-title-email">{user.email || ''}</p>
            </div>

            <div className="header-role-badge">
              <span className={`account-role-chip ${user.role}`}>
                {user.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: PROFILE INFORMATION CARD */}
        <div className="profile-glass-card">
          <div className="card-header-bar">
            <div className="card-title-group">
              <FiUser className="card-header-icon" />
              <h2>Profile Information</h2>
            </div>
            {!isEditing ? (
              <button className="btn-action-outline" onClick={handleEdit}>
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <div className="action-btn-group">
                <button className="btn-action-solid" onClick={handleUpdate} disabled={isLoading}>
                  <FiSave /> {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button className="btn-action-ghost" onClick={handleCancel}>
                  <FiX /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="card-body-content">
            {/* Field 1: Name */}
            <div className="info-field-row">
              <div className="field-label-box">
                <FiUser className="field-icon" />
                <span>Full Name</span>
              </div>
              <div className="field-value-box">
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-text-input"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <span className="field-value-text">{user.name || 'Not provided'}</span>
                )}
              </div>
            </div>

            {/* Field 2: Email */}
            <div className="info-field-row">
              <div className="field-label-box">
                <FiMail className="field-icon" />
                <span>Email Address</span>
              </div>
              <div className="field-value-box verified-value">
                <span className="field-value-text">{user.email || 'Not provided'}</span>
                <span className="verified-badge"><FiCheckCircle /> Verified</span>
              </div>
            </div>

            {/* Field 3: Account Type / Role */}
            <div className="info-field-row">
              <div className="field-label-box">
                <FiShield className="field-icon" />
                <span>Account Type</span>
              </div>
              <div className="field-value-box">
                <span className={`account-role-chip ${user.role}`}>
                  {user.role === 'admin' ? 'Administrator' : 'Standard Member'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: SECURITY CARD */}
        <div className="profile-glass-card" id="change-password-card">
          <div className="card-header-bar">
            <div className="card-title-group">
              <FiLock className="card-header-icon" />
              <h2>Security & Password</h2>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="security-form">
            {/* Input 1: Current Password */}
            <div className="form-field-group">
              <label>Current Password</label>
              <div className="input-with-eye">
                <input
                  type={showCurrent ? "text" : "password"}
                  className="profile-text-input"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  placeholder="Enter current password"
                />
                <button 
                  type="button" 
                  className="eye-toggle-btn"
                  onClick={() => setShowCurrent(!showCurrent)}
                  title="Toggle Password Visibility"
                >
                  {showCurrent ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Input 2: New Password */}
            <div className="form-field-group">
              <label>New Password</label>
              <div className="input-with-eye">
                <input
                  type={showNew ? "text" : "password"}
                  className="profile-text-input"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                />
                <button 
                  type="button" 
                  className="eye-toggle-btn"
                  onClick={() => setShowNew(!showNew)}
                  title="Toggle Password Visibility"
                >
                  {showNew ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Input 3: Confirm New Password */}
            <div className="form-field-group">
              <label>Confirm New Password</label>
              <div className="input-with-eye">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="profile-text-input"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  placeholder="Re-enter new password"
                />
                <button 
                  type="button" 
                  className="eye-toggle-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  title="Toggle Password Visibility"
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-submit-row">
              <button type="submit" className="btn-action-gold" disabled={isLoading}>
                <FiLock /> {isLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 4: DANGER ZONE CARD */}
        <div className="profile-glass-card danger-zone-card">
          <div className="card-header-bar danger-header">
            <div className="card-title-group">
              <FiAlertTriangle className="card-header-icon danger-icon" />
              <h2 className="danger-title">Danger Zone</h2>
            </div>
          </div>

          <div className="danger-zone-body">
            <div className="danger-info-text">
              <h4>Delete Account</h4>
              <p>Permanently remove your CineNova account and all associated booking data. This action is irreversible.</p>
            </div>
            
            <button 
              className="btn-danger-solid"
              onClick={() => setShowDeleteModal(true)}
              disabled={isLoading}
            >
              <FiTrash2 /> Delete Account
            </button>
          </div>
        </div>

      </div>

      {/* CUSTOM CONFIRMATION MODAL FOR DELETE ACCOUNT */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="glass-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-warning-icon">
              <FiAlertTriangle />
            </div>
            <h3 className="modal-title">Delete Account Confirmation</h3>
            <p className="modal-subtext">
              Are you sure you want to permanently delete your account? You will lose access to all your bookings and member perks.
            </p>
            
            <div className="modal-action-row">
              <button 
                className="btn-action-ghost" 
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
              >
                Keep Account
              </button>
              <button 
                className="btn-danger-solid" 
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
