import React, { useState, useEffect } from "react";
import "../../assets/styles/Navbar.css";
import vbook from "../../assets/images/Book 1.png";
import userIcon from "../../assets/icons/user_white.png";
import Loader from "../Commons/Loader";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [isLoading, setIsLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    name: "",
    role: ""
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const errors = [];
    if (!validations.length) errors.push("at least 8 characters");
    if (!validations.uppercase) errors.push("one uppercase letter");
    if (!validations.lowercase) errors.push("one lowercase letter");
    if (!validations.special) errors.push("one special character");

    return {
      isValid: Object.values(validations).every(v => v),
      errorMessage: errors.length ? `Password must contain ${errors.join(', ')}` : ''
    };
  };
  const navigate = useNavigate();
  const handleHomeNavigation = () => {

    if(localStorage.getItem('role') === 'admin'){
    navigate("/admindashboard");
    }
    else{
      navigate("/userdashboard");
    }
  };
  const handlePasswordChange = (e, field) => {
    const newValue = e.target.value;
    setPasswordData(prev => ({
      ...prev,
      [field]: newValue
    }));

    setValidationErrors(prev => ({
      ...prev,
      [field]: ''
    }));

    if (field === 'newPassword') {
      const { errorMessage } = validatePassword(newValue);
      setValidationErrors(prev => ({
        ...prev,
        newPassword: errorMessage
      }));

      if (passwordData.confirmPassword) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: newValue !== passwordData.confirmPassword ?
            'Passwords do not match' : ''
        }));
      }
    }

    if (field === 'confirmPassword') {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: newValue !== passwordData.newPassword ?
          'Passwords do not match' : ''
      }));
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          email: parsedUser.email || '',
          name: parsedUser.name || '',
          role: parsedUser.role || ''
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/vBook/v1/auth/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCloseModal = () => {
    setIsChangePasswordOpen(false);
    setValidationErrors({ newPassword: '', confirmPassword: '' });
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const handleChangePassword = () => {
    setIsChangePasswordOpen(true);
    setDropdownOpen(false);
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password before submission
    const { isValid, errorMessage } = validatePassword(passwordData.newPassword);
    if (!isValid) {
      setError(errorMessage);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const body = JSON.stringify({
        email: userData.email,
        oldpassword: passwordData.oldPassword,
        newpassword: passwordData.newPassword
      });
    
      
      const response = await fetch('/vbook/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body
      });
      const data = await response.json();
      // console.log('Password change response:', response);
      // console.log('Password change response data:', data);

      if (response.ok) {
        setSuccess('Password changed successfully');
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setError('An error occurred. Please try again.');
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.profile-container')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <img src={vbook} alt="vBook Logo" className="navbar-logo" onClick={handleHomeNavigation} />
        </div>
        <div className="navbar-right">
          <div className="profile-container">
            <img
              src={userIcon}
              alt="User"
              className="profile-icon"
              onClick={toggleDropdown}
            />
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="user-info">
                  <p className="user-name">{userData.name}</p>
                  <p className="user-email">{userData.email}</p>
                  <p className="user-role">{userData.role}</p>
                </div>
                <button className="dropdown-button" onClick={handleChangePassword}>
                  Change Password
                </button>
                <button className="dropdown-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isChangePasswordOpen && ( <> {isLoading ? <Loader /> :<div>
        <div className="modal-overlay">
          <div className="modal">
            <h2>Change Password</h2>
            <form onSubmit={handleSubmitPasswordChange}>
              <div className="form-group">
                <label>Current Password:</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    oldPassword: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange(e, 'newPassword')}
                  required
                />
                {validationErrors.newPassword && (
                  <div className="validation-error">{validationErrors.newPassword}</div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange(e, 'confirmPassword')}
                  required
                />
                {validationErrors.confirmPassword && (
                  <div className="validation-error">{validationErrors.confirmPassword}</div>
                )}
              </div>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              <div className="modal-buttons">
                <button
                  type="submit"
                  disabled={!!validationErrors.newPassword || !!validationErrors.confirmPassword}
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      }</>
      )}
    </>
  );
}

export default Navbar;