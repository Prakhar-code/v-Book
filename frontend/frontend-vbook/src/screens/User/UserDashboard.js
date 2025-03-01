import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "../../assets/styles/UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleButtonClick = (page) => {
    navigate(`/${page}`);
  };

  return (
    <>
      <Navbar />
      <div className="user-grid-container">
        <div className="user-grid-item">
          <button
            className="user-button"
            onClick={() => handleButtonClick("cabin-booking-map")}
          >
            Book Cabin
          </button>
        </div>
        <div className="user-grid-item">
          <button
            className="user-button"
            onClick={() => handleButtonClick("upcomingBookings")}
          >
            Upcoming Bookings
          </button>
        </div>
        <div className="user-grid-item">
          <button
            className="user-button"
            onClick={() => handleButtonClick("raiseTicket")}
          >
            Raise Ticket
          </button>
        </div>
        <div className="user-grid-item">
          <button
            className="user-button"
            onClick={() => handleButtonClick("previousBookings")}
          >
            Previous Bookings
          </button>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
