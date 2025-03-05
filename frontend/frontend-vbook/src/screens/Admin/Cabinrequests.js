import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "../../assets/styles/acceptreject.css";
import BackButton from "../../components/BackButton/BackButton";
import axios from "axios";
import Loader from "../../components/Commons/Loader";

const CabinRequests = () => {
  const [cabins, setCabins] = useState([]);
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCabins = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://127.0.0.1:8000/vbook/v1/cabins");
        const data = await response.json();

        if (data.status === "Success") {
          setCabins(data.cabins);
          await fetchAllBookings();
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
  }, []);

  const fetchAllBookings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:8000/vbook/v1/admins/cabins/requests`
      );
      if (response.data.status === "success") {
        if (response.data.bookings === "No Request pending") {
          setBookings([]);
        } else {
          setBookings(response.data.bookings);
        }
      }
    } catch (error) {
      setError("Error fetching bookings");
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleCabinSelect = (e) => {
    const cabinId = e.target.value;
    const cabin = cabins.find((c) => c.id === parseInt(cabinId));
    setSelectedCabin(cabin);
    setErrorMessage("");
  };

  const handleCheckAvailability = () => {
    if (!selectedCabin) {
      setErrorMessage("Please select a cabin.");
      return;
    }

    navigate("/cabinbookingadmin", {
      state: {
        selectedCabin: selectedCabin,
      },
    });
  };

  const formatDateTime = (dateTimeString) => {
    var date=new Date(dateTimeString).toUTCString().replace('GMT','');
    return date;
  };

  const handleAccept = async (bookingId) => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        "http://localhost:8000/vbook/v1/admins/cabins/requests",
        {
          request_status: "approved",
          booking_id: bookingId,
        }
      );
      console.log(response)
      if(response.status === 200) {
      alert("Status updated successfully- Booking Accepted");
      fetchAllBookings();
      }
      
    } catch (error) {
      console.log(error);
      if(error.response.status === 409)
        {
          alert("Cabin already booked for the selected time, Unable to accept.");
        }
        else{
          console.log(error.response.status);
          alert("Error accepting booking");
        }
      setError("Error accepting booking");
    }
    finally {
      setIsLoading(false);
      }
  };

  const handleReject = async (bookingId) => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        "http://localhost:8000/vbook/v1/admins/cabins/requests",
        {
          request_status: "rejected",
          booking_id: bookingId,
        }
      );
      alert("Status updated successfully- Booking Rejected");
      fetchAllBookings();
    } catch (error) {
      setError("Error rejecting booking");
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {isLoading ? <Loader /> :<div>
      <div className="back-button">
        <BackButton />
      </div>

      <div className="ticket-management-container">
        <div className="ticket-management-wrapper">
          <div className="cabin-selection">
            <label htmlFor="cabin-select" className="cabin-select-label">
              Select Cabin:
            </label>
            <select
              id="cabin-select"
              onChange={handleCabinSelect}
              className="cabin-select"
              value={selectedCabin ? selectedCabin.id : ""}
            >
              <option value="">Select cabin</option>
              {cabins.map((cabin) => (
                <option key={cabin.id} value={cabin.id}>
                  {cabin.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              className="check-availability-btn"
              onClick={handleCheckAvailability}
            >
              Check Availability
            </button>
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          {bookings.length < 1 ? (
            <div className="no-bookings-message">
              No bookings requests found.
            </div>
          ) : (
            <div className="ticket-selection-wrapper">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>EMPLOYEE NAME</th>
                    <th>CABIN NAME</th>
                    <th>START-TIME</th>
                    <th>END-TIME</th>
                    <th>PURPOSE</th>
                    <th>REQUIREMENTS</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.booking_id}>
                      <td>{booking.email}</td>
                      <td>{booking.cabin_name}</td>
                      <td>{formatDateTime(booking.start_time)}</td>
                      <td>{formatDateTime(booking.end_time)}</td>
                      <td>{booking.purpose}</td>
                      <td>{booking.additional_requirements}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(booking.booking_id)}
                            className="accept-btn"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(booking.booking_id)}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>}
    </>
  );
};

export default CabinRequests;
