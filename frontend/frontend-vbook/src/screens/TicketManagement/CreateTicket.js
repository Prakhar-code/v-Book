import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "../../components/Navbar/Navbar.js";
import "../../assets/styles/CreateTicket.css";
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Commons/Loader';

const RaiseTicket = () => {
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(new Date());
  const [cabin, setCabin] = useState('');
  const [cabinid, setCabinid] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cabins, setCabins] = useState([]);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [dateError, setDateError] = useState('');
  const [cabinError, setCabinError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const navigate = useNavigate();


  useEffect(() => {
    
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setUserId(userData.id || '');
    }
    
    setDate(new Date());

    
    fetchCabins();
  }, []);

  
  const fetchCabins = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/vbook/v1/cabins');
      if (response.data && Array.isArray(response.data.cabins)) {
        setCabins(response.data.cabins);
      } else {
        console.error('Unexpected response data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching cabins:', error.response ? error.response.data : error.message);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCabinid = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/vbook/v1/cabins/${cabinid}`);
      } catch (error) {
        console.error('Error fetching cabinid:', error.response ? error.response.data : error.message);
        setErrorMessage('There was an error fetching the cabin list. Please try again.');
      }
      finally {
        setIsLoading(false);
      }
    };

    fetchCabinid();
  }, []);


 
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(value)
    switch (name) {
      case 'cabin':
        setCabinid(value);
        setCabin(value);
        setCabinError('');
        break;
      case 'description':
        setDescription(value);
        setDescriptionError('');
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!date) {
      setDateError('Date is required');
      isValid = false;
    }

    if (!cabin) {
      setCabinError('Please select a cabin');
      isValid = false;
    }

    if (!description.trim()) {
      setDescriptionError('Description is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        console.log(cabinid)
        const response = await axios.post('http://localhost:8000/vbook/v1/users/raise-ticket', {
            "user_id": userId,
            "cabin_id": cabinid,
            "date": date.toISOString().split('T')[0],
            "description": description,
            "response":" ",
            "status": "Open",
          
        });
        if (response.status === 201 || response.status === 200) {
          alert("Ticket raised successfully");
          navigate('/userdashboard', { state: { cabinData: response.data } });

          setCabin('');
          setDescription('');
          setDate(new Date());
        }
      } catch (error) {
        console.error('Error creating ticket:', error);
        alert('Failed to create ticket. Please try again.');
      }
      finally {
        setIsLoading(false);
      }
    }
  };
  
    return (
      <>
        <Navbar />
        {isLoading ? <Loader /> :<div>
        <div className="form-wrapper">
          <div className="form-container">
            <h2 className="title">Create Ticket</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name -</label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    readOnly
                  />
                  {nameError && <span className="error-message">{nameError}</span>}
                </div>

                <div className="form-group">
                  <label>Email -</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    readOnly
                  />
                  {emailError && <span className="error-message">{emailError}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date -</label>
                  <input
                    type="date"
                    name="date"
                    value={date.toISOString().split('T')[0]}
                    readOnly
                  />
                  {dateError && <span className="error-message">{dateError}</span>}
                </div>

                <div className="form-group">
                  <label>Cabin -</label>
                  <select
                    name="cabin"
                    className={`cabin-select ${cabinError ? 'error-input' : ''}`}
                    value={cabin}
                    onChange={handleChange}
                  >
                    <option value="">Select cabin</option>
                    {cabins.map(cabin => (
                      <option key={cabin.id} value={cabin.id}>{cabin.name}</option>
                    ))}
                  </select>
                  {cabinError && <span className="error-message">{cabinError}</span>}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description -</label>
                <textarea
                  rows="4"
                  name="description"
                  className={descriptionError ? 'error-input' : ''}
                  value={description}
                  onChange={handleChange}
                ></textarea>
                {descriptionError && <span className="error-message">{descriptionError}</span>}
              </div>

              <button type="submit" className='create-ticket_button'>Create</button>
            </form>
          </div>
        </div>
      </div>
      }
      </>
    )
  };  
  
  export default RaiseTicket;