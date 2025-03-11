import React, { useState, useEffect } from 'react';
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/styles/cabinBooking.css';
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

const CabinBookingAdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: ''
  });

  const selectedCabin = location.state?.selectedCabin;

  useEffect(() => {
    if (!selectedCabin) {
      navigate('/cabinrequests');
      return;
    }


    
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/vbook/v1/users/cabins/bookings/${selectedCabin.id}`);
        const data = await response.json();
        
        if (data.status === "success") {
            const calendarEvents = data.bookings.data.map((booking) => ({
              title: `Booked by ${booking.email}`,
              start: booking.start_time,
              end: booking.end_time,
              backgroundColor: booking.status === "approved" ? '#4CAF50' : booking.status === "pending" ? '#FFC157FF' : '#FF0000',
              borderColor: booking.status === "approved" ? '#4CAF50' : booking.status === "pending" ? '#FFC157FF' : '#FF0000',
              textColor: '#ffffff',
              allDay: false
            }));
            setEvents(calendarEvents);
          } else {
            setEvents([]);
          }
          setError(null);
      } catch (error) {
        console.error('Booking fetch error:', error);
        setError("Error fetching bookings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedCabin, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleClosePopup = () => {
    setPopupPosition(null);
    setSelectedDate(null);
    setBookingForm(prev => ({
      ...prev,
      startTime: '',
      endTime: ''
    }));
  };

  const handleFinalBooking = async () => {
    if (!bookingForm.startTime || !bookingForm.endTime) {
      alert('Please select start and end times');
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
    const bookingRequest = {
      userId: localStorage.getItem("userid"),
      email: localStorage.getItem("useremail"),
      name: localStorage.getItem("username"),
      startTime: startdatetime,
      endTime: enddatetime,
      purpose: bookingForm.reason || "null",
      additionalRequirements: bookingForm.requirements || "null"
    };
    

    try {
      setIsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/vbook/v1/admin/book-cabin/${selectedCabin.id}`, {
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
        const newEvent = {
          title: `Booked by ${bookingRequest.email}`,
          start: startdatetime,
          allDay: false,
          end: enddatetime,
          fullDetails: {
          extendedProps: {
          name: bookingForm.name,
          email: bookingForm.email,
          cabin_name: selectedCabin.name,
          reason: bookingForm.reason,
          requirement: bookingForm.requirements,
          startTime: bookingForm.startTime,
          endTime: bookingForm.endTime
        }
      }
        };
        setEvents(prevEvents => [...prevEvents, newEvent]);
        alert('Booking confirmed!');
      }
    } catch (error) {
      alert('Error during booking');
    }
    finally {
      setIsLoading(false);
    }

    handleClosePopup();
  };

 
  if (error) {
    return (
      <div className="calendar-container">
        <div className="error-message">
          {error}
          <button 
            onClick={() => navigate('/cabinrequests')} 
            className="back-button"
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Back to Cabin Requests
          </button>
        </div>
      </div>
    );
  }

  if (!selectedCabin) {
    return (
      <div className="calendar-container">
        <div className="error-message">
          No cabin selected. Please select a cabin first.
          <button 
            onClick={() => navigate('/cabinrequests')} 
            className="back-button"
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Back to Cabin Requests
          </button>
        </div>
      </div>
    );
  }

  return (<>  {isLoading ? <Loader /> :<div>
    <div className="calendar-container">
      <h2 className="calendar-header">Cabin Schedule - {selectedCabin.name}</h2>

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

      {popupPosition && selectedDate && (
        <TimeSelectionPopup
          onClose={handleClosePopup}
          onSubmit={handleFinalBooking}
          bookingForm={bookingForm}
          handleInputChange={handleInputChange}
        />
      )}
    </div>
    </div>}
    </>
  );
};

export default CabinBookingAdminPage;