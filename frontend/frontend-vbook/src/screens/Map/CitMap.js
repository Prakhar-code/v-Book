import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../../assets/styles/MapStyle.css";
import "../../assets/styles/CabinDetails.css";
import Office from "../Map/img";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";

export default function CitMap() {
  const [selected, setSelected] = useState(undefined);
  const [cabins, setCabins] = useState([]);
  const [selectedCabin, setSelectedCabin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCabins = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/vbook/v1/cabins");
        setCabins(response.data.cabins);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cabins:", error);
        setLoading(false);
      }
    };

    fetchCabins();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Available": return "#34d399";
      case "Under Maintenance": return "#f43f5e";
      case "Not Available" : return "#6E6E6EFF";
      default: return "#777";
    }
  };

  const handleViewSchedule = () => {
    console.log("Selected Cabin just before navigation:", selectedCabin);
    if (selectedCabin) {
      // Pass selected cabin data to booking page via state
      navigate('/cabinbooking', { 
        state: { 
          selectedCabin: selectedCabin,
          preselected: true 
        } 
      });
    }
  };

  return (<>
    <Navbar></Navbar>
    <div className="CitMap">
      <div className="rooms">
        <h2>Cabins</h2>
        <br/>
        <p className="tip">Select your preferred cabin:</p>
        {loading ? (
          <p>Loading cabins...</p>
        ) : (
          cabins.map((cabin) => (
            <React.Fragment key={cabin.id}>
              <div
                onMouseEnter={() => {
                  setSelected(cabin.name.toLowerCase().replace(/\s+/g, '-'));
                  setSelectedCabin(cabin);
                }}
                className={`room-link ${selected === cabin.name.toLowerCase().replace(/\s+/g, '-') ? "active" : ""}`}
              >
                <span
                  className="square"
                  style={{
                    backgroundColor: getStatusColor(cabin.status),
                  }}
                ></span>
                {cabin.name}
              </div>
            </React.Fragment>
          ))
        )}
      </div>
      <div className="map">
        <Office
          selected={selected}
          onHovered={(id) => {
            setSelected(id);
            setSelectedCabin(cabins.find((cabin) => cabin.name.toLowerCase().replace(/\s+/g, '-') === id));
          }}
        />
      </div>
      {selectedCabin && (
        <div className="cabin-details">
          <h3 className="cabin-header">
            {selectedCabin.name}
            <span
              className="status-indicator"
              style={{ backgroundColor: getStatusColor(selectedCabin.status) }}
            ></span>
          </h3>
          
          <div className="cabin-facilities">
            <div>
              <strong>Capacity:</strong>
              <div>{selectedCabin.capacity} people</div>
            </div>
           
            <div>
              <strong>Status:</strong>
              <div style={{ textTransform: 'capitalize' }}>
                {selectedCabin.status}
              </div>
            </div>
            <div>
              <strong>Location:</strong>
              <div>{selectedCabin.location}</div>
            </div>
            <div>
              <strong>Facilities:</strong>
              <div className="facilities-container">
                {selectedCabin.facilities.map((facility, index) => (
                  <span key={index} className="facility-tag">
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="schedule-button">
            <button 
              type="submit" 
              className="submit-button"
              onClick={handleViewSchedule}
              disabled={selectedCabin.status !== 'Available'}
            >
              View Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  </>);
}