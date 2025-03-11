import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import '../../assets/styles/CabinManagement.css';
import BackButton from '../../components/BackButton/BackButton';

const CabinManagement = () => {
  const [cabins, setCabins] = useState([]);
  const [selectedCabin, setSelectedCabin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCabins = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/vbook/v1/cabins');
        if (response.data && Array.isArray(response.data.cabins)) {
          setCabins(response.data.cabins);
          // setCabins(response.data.Array)
        } else {
          console.error('Unexpected response data:', response.data);
          setErrorMessage('Invalid cabin data received. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching cabins:', error.response ? error.response.data : error.message);
        setErrorMessage('There was an error fetching the cabin list. Please try again.');
      }
    };

    fetchCabins();
  }, []);

  const handleCabinChange = (event) => {
    setSelectedCabin(event.target.value);
    setErrorMessage('');
  };

  const handleEditClick = async () => {
    if (!selectedCabin) {
      setErrorMessage('Please select a cabin.');
      return;
    }
  
    try {
      const response = await axios.get(`http://127.0.0.1:8000/vbook/v1/cabins/${selectedCabin}`);
      const cabinData = response.data;
      navigate('/editcabin', { state: { cabinData } });
    } catch (error) {
      setErrorMessage('There was an error fetching the cabin data. Please try again.');
    }
  };
  
  

  return (
    <>
      <Navbar />
      <BackButton/>
      <div className="cabin-management-container">
        
        <div className="cabin-management-wrapper">
          <h1 className="cabin-management-title">Cabin Management</h1>
          <div className="cabin-selection-wrapper">
            <div className="cabin-selection">
              <label htmlFor="cabin-select" className="cabin-select-label">Select Cabin:</label>
              <select
                id="cabin-select"
                value={selectedCabin}
                onChange={handleCabinChange}
                className="cabin-select"
              >
                <option value="">Select cabin</option>
                {cabins.map(cabin => (
                  <option key={cabin.id} value={cabin.id}>{cabin.name}</option>
                ))}
              </select>
            </div>
            {errorMessage && <span className="error-message">{errorMessage}</span>}
            <button className="edit-button" onClick={handleEditClick}>Edit</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CabinManagement;