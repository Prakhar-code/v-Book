import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/Editcabin.css';
import Navbar from '../../components/Navbar/Navbar';
import BackButton from '../../components/BackButton/BackButton';

const EditCabinPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cabinData = location.state?.cabinData?.cabins;

  const [cabinName, setCabinName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [amenities, setAmenities] = useState('');
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!cabinData) {
      navigate('/cabinmanagement');
    } else {
      setCabinName(cabinData.name || '');
      setLocationName(cabinData.location || '');
      setCapacity(cabinData.capacity ? cabinData.capacity.toString() : '');
      setAmenities(cabinData.facilities ? cabinData.facilities.join(', ') : '');
      setStatus(cabinData.status || '');
      console.log("cabin ID",cabinData.id)
    }
  }, [cabinData, navigate]);

  const handleCabinNameChange = (e) => {
    setCabinName(e.target.value);
    setErrors({ ...errors, cabinName: '' });
  };

  const handleLocationChange = (e) => {
    setLocationName(e.target.value);
    setErrors({ ...errors, locationName: '' });
  };

  const handleCapacityChange = (e) => {
    setCapacity(e.target.value);
    setErrors({ ...errors, capacity: '' });
  };

  const handleAmenitiesChange = (e) => {
    setAmenities(e.target.value);
    setErrors({ ...errors, amenities: '' });
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setErrors({ ...errors, status: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!cabinName.trim()) {
      newErrors.cabinName = 'This field cannot be empty';
    }
    if (!locationName.trim()) {
      newErrors.locationName = 'This field cannot be empty';
    }
    if (!capacity) {
      newErrors.capacity = 'This field cannot be empty';
    } else if (isNaN(capacity)) {
      newErrors.capacity = 'Capacity must be a numeric value';
    } else if (parseInt(capacity) <= 3) {
      newErrors.capacity = 'Capacity must be greater than 3';
    } else if (parseInt(capacity) > 60) {
      newErrors.capacity = 'Capacity cannot be greater than 60';
    }
    if (!amenities.trim()) {
      newErrors.amenities = 'This field cannot be empty';
    } else if (typeof amenities !== 'string') {
      newErrors.amenities = 'Amenities must be a comma-separated string';
    }
    if (!status.trim()) {
      newErrors.status = 'This field cannot be empty';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      const requestData = {
        name: cabinName,
        office: locationName,
        capacity: parseInt(capacity),
        status: status,
        amenities: amenities.split(',').map((item) => item.trim()).join(', ')
      };
  
      try {
        const response = await axios.put(`http://127.0.0.1:8000/vbook/v1/cabins/${cabinData.id}`, requestData);
        alert('Form submitted successfully!');
        navigate('/admindashboard');
      } catch (error) {
        if (error.response && error.response.data) {
          setErrorMessage(`Validation error: ${JSON.stringify(error.response.data.errors || error.response.data)}`);
        } else {
          setErrorMessage('There was an error submitting the form. Please try again.');
        }
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this cabin?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/vbook/v1/cabins/${cabinData.id}`);
        alert('Cabin deleted successfully!');
        navigate('/admindashboard');
      } catch (error) {
        setErrorMessage('There was an error deleting the cabin. Please try again.');
      }
    }
  };

  return (
    <>
      <Navbar />
      <BackButton/>
      <div className="page-container">
        <div className="form-section">
          <div className="form-card">
            <h2 className="form-title">Edit Cabin</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Cabin Name</label>
                <input
                  type="text"
                  name="cabinName"
                  className="form-inputcabin"
                  value={cabinName}
                  onChange={handleCabinNameChange}
                />
                {errors.cabinName && (
                  <span className="error">{errors.cabinName}</span>
                )}
              </div>

              <div className="form-field">
                <label>Location</label>
                <input
                  type="text"
                  name="locationName"
                  className="form-inputcabin"
                  value={locationName}
                  onChange={handleLocationChange}
                />
                {errors.locationName && (
                  <span className="error">{errors.locationName}</span>
                )}
              </div>

              <div className="form-field">
                <label>Capacity</label>
                <input
                  type="text"
                  name="capacity"
                  className="form-inputcabin"
                  value={capacity}
                  onChange={handleCapacityChange}
                />
                {errors.capacity && (
                  <span className="error">{errors.capacity}</span>
                )}
              </div>

              <div className="form-field">
                <label>Amenities</label>
                <input
                  type="text"
                  name="amenities"
                  className="form-inputcabin"
                  value={amenities}
                  onChange={handleAmenitiesChange}
                />
                {errors.amenities && (
                  <span className="error">{errors.amenities}</span>
                )}
              </div>

              <div className="form-field">
                <label>Status</label>
                <select
                  className="form-inputcabin"
                  value={status}
                  onChange={handleStatusChange}
                >
                  <option value="">Select status</option>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
                {errors.status && (
                  <span className="error">{errors.status}</span>
                )}
              </div>

              {errorMessage && <div className="error-message">{errorMessage}</div>}

              <div className="form-submit">
                <button className="submit-cabin" type="submit">Submit</button>
              </div>
              <div className="form-submit">
                <button className="delete-cabin" onClick={handleDelete} type="button">Delete</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditCabinPage;