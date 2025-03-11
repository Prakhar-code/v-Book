import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import '../../assets/styles/cabinBooking.css';
import Navbar from '../../components/Navbar/Navbar';
import Loader from '../../components/Commons/Loader';


const TimeSelectionPopup = ({ onClose, onSubmit, bookingForm, handleInputChange }) => {
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 9; hour < 20; hour++) {
      for (let minute of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="popup-overlay">
      <div className="time-selection-popup">
        <h4 className="popup-title">Select Cabin Booking Time</h4>
        <div className="popup-content">
          <div className="time-input-group">
            <select
              name="startTime"
              value={bookingForm.startTime}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Start Time</option>
              {timeOptions.map((time) => {
                const currentTime = new Date();
                const [hours, minutes] = time.split(':');
                const optionTime = new Date();
                optionTime.setHours(hours, minutes, 0);

                return optionTime > currentTime ? (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ) : null;
              })}
            </select>
          </div>
          <div className="time-input-group">
            <select
              name="endTime"
              value={bookingForm.endTime}
              onChange={handleInputChange}
              required
            >
              <option value="">Select End Time</option>
              {timeOptions
                .filter(time => time > bookingForm.startTime)
                .map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
            </select>
          </div>
          <div className="popup-buttons">
            <button onClick={onSubmit} className="confirm-btn">
              Confirm
            </button>
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDetailsPopup = ({ onClose, onSubmit, bookingForm, handleInputChange }) => {
  return (
    <div className="popup-overlay">
      <div className="user-details-popup">
        <h4 className="popup-title">Enter Your Details</h4>
        <div className="popup-content">
        <div className="form-group3">
            <label className="form-label">Name : </label> <label className="form-label-value">{localStorage.getItem("username")}</label>
            
          </div>
          <div className="form-group3">
            <label className="form-label">Email : </label><label className="form-label-value">{localStorage.getItem("useremail")}</label>
           
          
          </div>
        <div className="form-group2">
              <label className="form-label">Reason</label>
              <input
                name="reason"
                value={bookingForm.reason}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                required
              />
            </div>
 
            <div className="form-group2">
              <label className="form-label">Additional Requirements</label>
              <input
                name="requirements"
                value={bookingForm.requirements}
                onChange={handleInputChange}
                className="form-textarea"
                rows="2"
                placeholder="Any specific equipment or setup needed?"
              />
            </div>
          
          <div className="popup-buttons">
            <button onClick={onSubmit} className="confirm-btn">
              Book Cabin
            </button>
            <button onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const CabinBookingPage = () => {
  const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
  const location = useLocation();
  const [cabins, setCabins] = useState([]);
  const [selectedCabin, setSelectedCabin] = useState(location.state?.selectedCabin || null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [popupPosition, setPopupPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  
  
  const [bookingForm, setBookingForm] = useState({
    reason: '',
    requirements: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    console.log('after navigation',selectedCabin)
    const fetchCabins = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/vbook/v1/cabins");
        const data = await response.json();

        if (data.status === "Success") {
          setCabins(data.cabins);
          
          // Check if a cabin was preselected from the map
          if (location.state?.preselected && location.state?.selectedCabin) {
            const preCabin = location.state.selectedCabin;
            setSelectedCabin(preCabin);
            console.log('preCabin',preCabin)
            console.log('selectedCabin',selectedCabin)

            handleCabinSelect(preCabin.id);
            setShowCalendar(true);
          }
        } else {
          setError("Error fetching cabins");
        }
      } catch (error) {
        setError("Error fetching cabins");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCabins();
  }, [location.state]);


  const handleCabinSelect = async (cabinId) => {
    const cabin = cabins.find(c => c.id === cabinId);
    // setSelectedCabin(cabin);
 
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/vbook/v1/users/cabins/bookings/${cabinId}`);
        const data = await response.json();
 
        if (data.status === "success") {
          const formattedBookings = data.bookings.data.map((booking) => ({
            title: `Booking: ${booking.status.toUpperCase()}`,
            start: booking.start_time,
            end: booking.end_time,
            backgroundColor: booking.status === "approved" ? '#4CAF50' : booking.status === "pending" ? '#FFC157FF' : '#FF0000',
            borderColor: booking.status === "approved" ? '#4CAF50' : booking.status === "pending" ? '#FFC157FF' : '#FF0000',
            textColor: '#ffffff',
            allDay: false,
          }));
 
          setEvents(formattedBookings);
        } else {
          setError("Error fetching bookings");
        }
      } catch (error) {
        setError("Error fetching bookings");
      }
      finally {
        setIsLoading(false);
      }
    };
 
    fetchBookings();
  };
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
 
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setShowCalendar(true);
  };
 
  const handleDateClick = (info) => {
    const clickedDate = new Date(info.dateStr);
    const dayOfWeek = clickedDate.getDay();
 
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      alert('Booking is only available on weekdays');
      return;
    }
 
    setPopupPosition(true);
    setSelectedDate(info.dateStr);
  };
  const navigate = useNavigate();

  const handleBack = () => {
    setShowCalendar(false);
    navigate('/cabin-booking-map');
  };
  const handleClosePopup = () => {
    setPopupPosition(null);
    setSelectedDate(null);
    setBookingForm(prev => ({
      ...prev,
      reason: '',
      requirements: '',
      startTime: '',
      endTime: ''
    }));
  };
 
  const handleFinalBooking = async () => {
    if (!bookingForm.startTime || !bookingForm.endTime) {
      alert('Please select start and end times');
      return;
    }
    console.log('Final booking:', bookingForm);
  
    // Instead of directly booking, show user details popup
    setPopupPosition(null);
    setShowUserDetailsPopup(true);
  };

  // Create a method to submit final booking
const submitFinalBooking = async () => {
  console.log('Submitting final booking:', bookingForm);
  console.log('CABIN', selectedCabin);
  // Validate user details
  if (!bookingForm.reason) {
    alert('Please fill in all user details');
    return;
  }

  const convertToSQLDateTime = (isoDateTime, time) => {
    const datePart = isoDateTime.split('T')[0];
    const timePart = `${time}:00`;
    return `${datePart} ${timePart}`;
  };
 
  const isoDateTime = selectedDate;
  const startdatetime = convertToSQLDateTime(isoDateTime, bookingForm.startTime);
  const enddatetime = convertToSQLDateTime(isoDateTime, bookingForm.endTime);
 
  if (new Date(enddatetime) <= new Date(startdatetime)) {
    alert('End time must be after start time');
    return;
  }
 
  const newEvent = {
    // title: `${bookingForm.name} - ${selectedCabin.name}`,
    start: startdatetime,
    end: enddatetime,
    allDay: false,
    extendedProps: {
      fullDetails: {
        // name: bookingForm.name,
        email: bookingForm.email,
        // cabin_name: selectedCabin.name,
        reason: bookingForm.reason,
        requirement: bookingForm.requirements,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime
      }
    }
  };
 
  const bookingRequest = {
    userId: localStorage.getItem("userid"),
    email: localStorage.getItem('useremail'),
    name:localStorage.getItem('username'),
    startTime: startdatetime,
    endTime: enddatetime,
    purpose: bookingForm.reason,
    additionalRequirements: bookingForm.requirements || "No Additional Requirements"
  };
 
  try {
    setIsLoading(true);

    const response = await fetch(`http://127.0.0.1:8000/vbook/v1/users/book-cabin/${selectedCabin.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingRequest),
    });
 
    const data = await response.json();
 
    if (data.status === "error") {
      alert(data.message);
    } else {
      setEvents(prevEvents => [...prevEvents, newEvent]);
      alert('Booking confirmed!');
      handleClosePopup();
      setShowUserDetailsPopup(false);
    }
  } catch (error) {
    console.error('Error during booking:', error);
    alert('Error during booking');
  }
  finally {
    setIsLoading(false);
  }
};



  if (showCalendar) {
    return (
      <>
        <Navbar/>
        {isLoading ? <Loader /> : (
          <div>
            <div className="calendar-container">
              <h2 className="calendar-header">Cabin Schedule - {selectedCabin.name}</h2>
              
              <div>
                <button
                  className="back-button-calendar"
                  onClick={handleBack}
                >
                  Back to Cabin Map
                </button>
              </div>

              {/* Rest of the calendar rendering remains the same */}
              <div className="calendar-wrapper">
                <Fullcalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridDay"
                  headerToolbar={{
                    start: "today prev,next",
                    center: "title",
                    end: "dayGridMonth,timeGridWeek,timeGridDay"
                  }}
                  height="600px"
                  events={events}
                  dateClick={handleDateClick}
                  businessHours={{
                    daysOfWeek: [1, 2, 3, 4, 5],
                    startTime: '09:00',
                    endTime: '20:00'
                  }}
                  validRange={(nowDate) => ({
                    start: nowDate
                  })}
                />
              </div>

              {/* Existing time selection popup */}
              {popupPosition && selectedDate && (
                <TimeSelectionPopup
                  onClose={handleClosePopup}
                  onSubmit={handleFinalBooking}
                  bookingForm={bookingForm}
                  handleInputChange={handleInputChange}
                />
              )}
              {showUserDetailsPopup && (
                <UserDetailsPopup
                  onClose={() => setShowUserDetailsPopup(false)}
                  onSubmit={submitFinalBooking}
                  bookingForm={bookingForm}
                  handleInputChange={handleInputChange}
                />
              )}
            </div>
          </div>
        )}
      </>
    );
  }
};

export default CabinBookingPage;
