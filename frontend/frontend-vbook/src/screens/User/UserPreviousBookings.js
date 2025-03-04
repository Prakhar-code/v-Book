import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import '../../assets/styles/PreviousBookings.css';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Commons/Loader';
import BackButton from '../../components/BackButton/BackButton';


const PreviousBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreviousBookings = async () => {
      try {
        const user_id = localStorage.getItem('userid');
        const response = await axios.post('http://127.0.0.1:8000/vbook/v1/users/previous-bookings', {
          user_id: user_id
        });

        if (response.data && response.data.success && Array.isArray(response.data.data.bookings)) {
          setBookings(response.data.data.bookings);
        } else {
          console.error('Unexpected response data:', response.data);
          setErrorMessage('Invalid booking data received. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error.response ? error.response.data : error.message);
        setErrorMessage('There was an error fetching your booking history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviousBookings();
  }, []);

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const handleFeedback = (bookingId, userId) => {
    navigate('/feedback', { state: { booking_id: bookingId, user_id: userId } });
  };

  return (
    <>
    <Navbar />
    {isLoading ? <Loader /> :<div>
      
      <div className="previous-bookings-container">
        <div className="previous-bookings-wrapper">
        <BackButton/>
          <h1 className="previous-bookings-title">Previous Bookings</h1>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {bookings.length === 0 ? (
            <div className="no-bookings-message">No previous bookings found.</div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.booking_id} className="booking-card">
                  <div className="booking-header">
                    <h2>Booking #{booking.booking_id}</h2>
                    <span className={`booking-status ${getStatusClass(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="booking-details">
                    <div className="booking-info">
                      <strong>Cabin ID:</strong> {booking.cabin_id}
                    </div>
                    <div className="booking-info">
                      <strong>Booked On:</strong> {formatDateTime(booking.booking_timestamp)}
                    </div>
                    <div className="booking-info">
                      <strong>Start Time:</strong> {formatDateTime(booking.start_time)}
                    </div>
                    <div className="booking-info">
                      <strong>End Time:</strong> {formatDateTime(booking.end_time)}
                    </div>
                    <div className="booking-info">
                      <strong>Purpose:</strong> {booking.purpose}
                    </div>
                    <div className="booking-info">
                      <strong>Additional Requirements:</strong> {booking.additional_requirements || 'None'}
                    </div>
                    <button 
                      className="feedback-button" 
                      onClick={() => handleFeedback(booking.booking_id, booking.user_id)}
                      disabled={booking.feedback_given}  
                    >
                      Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div></div>}
    </>
  );
};

export default PreviousBookings;
