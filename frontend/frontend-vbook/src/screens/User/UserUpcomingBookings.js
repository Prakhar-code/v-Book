import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import '../../assets/styles/UpcomingBookings.css';
import Loader from '../../components/Commons/Loader';

const UserUpcomingBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingBookingId, setDeletingBookingId] = useState(null);

  useEffect(() => {
    fetchUpcomingBookings();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUpcomingBookings = async () => {
    try {
      const user_id = localStorage.getItem('userid');
      const response = await axios.post('http://127.0.0.1:8000/vbook/v1/users/upcoming-bookings', {
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

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setDeletingBookingId(bookingId);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/vbook/v1/users/delete/bookings/${bookingId}`);
      console.log(response);
      if (response.data && response.status === 200) {
        setBookings(prevbookings => prevbookings.filter(booking => booking.booking_id !== bookingId));
        setSuccessMessage('Booking cancelled successfully!');
      } else {
        setErrorMessage('Failed to cancel the booking. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting booking:', error.response ? error.response.data : error.message);
      setErrorMessage('There was an error canceling your booking. Please try again.');
    } finally {
      setDeletingBookingId(null);
    }
  };

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
  
  return (
    <>
      <Navbar />
      {isLoading ? <Loader /> :<div>
      <div className="upcoming-bookings-container">
        <div className="upcoming-bookings-wrapper">
          <h1 className="upcoming-bookings-title">Upcoming Bookings</h1>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          {bookings.length === 0 ? (
            <div className="no-bookings-message">No upcoming bookings found.</div>
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
                      <strong>Purpose:</strong> {booking.purpose}
                    </div>
                    <div className="booking-info">
                      <strong>Start Time:</strong> {formatDateTime(booking.start_time)}
                    </div>
                    <div className="booking-info">
                      <strong>End Time:</strong> {formatDateTime(booking.end_time)}
                    </div>
                    <div className="booking-info">
                      <strong>Cabin ID:</strong> {booking.cabin_id}
                    </div>
                    <div className="booking-info">
                      <strong>Additional Requirements:</strong> {booking.additional_requirements || 'None'}
                    </div>
                    <div className="booking-info">
                      <strong>Booked On:</strong> {formatDateTime(booking.booking_timestamp)}
                    </div>
                  </div>
                  <div className="booking-actions">
                    <button
                      className={`delete-button ${deletingBookingId === booking.booking_id ? 'deleting' : ''}`}
                      onClick={() => handleDeleteBooking(booking.booking_id)}
                      disabled={deletingBookingId === booking.booking_id}
                    >
                      {deletingBookingId === booking.booking_id ? 'Canceling...' : 'Cancel Booking'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>}
    </>
  );
};

export default UserUpcomingBookings;