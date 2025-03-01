import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import '../../assets/styles/AdminDashboard.css'; 

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleButtonClick = (page) => {
    navigate(`/${page}`);
  };

  return (
    <>
      <Navbar />
      <div className="grid-container">
        <div className="grid-item">
          <button className="button" onClick={() => handleButtonClick('cabinrequests')}>
            Cabin Requests
          </button>
        </div>
        <div className="grid-item">
          <button className="button" onClick={() => handleButtonClick('cabinManagement')}>
            Cabin Management
          </button>
        </div>
        <div className="grid-item">
          <button className="button" onClick={() => handleButtonClick('ticketmanagement')}>
            Raised Tickets
          </button>
        </div>
        <div className="grid-item">
          <button className="button" onClick={() => handleButtonClick('manageaccess')}>
            Access Management
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
