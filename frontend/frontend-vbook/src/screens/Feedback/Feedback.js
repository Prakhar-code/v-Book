import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/styles/Feedback.css';
import Navbar from '../../components/Navbar/Navbar';
import axios from 'axios';

const Feedback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking_id, user_id } = location.state || {};
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const maxFeedbackLength = 255;

  const handleRatingClick = (value) => {
    setRating(value);
    setErrors({ ...errors, rating: '' });
  };

  const handleMouseEnter = (value) => {
    setHoveredRating(value);
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
    setErrors({ ...errors, feedback: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating.';
    }
    if (feedback.trim() === '') {
      newErrors.feedback = 'Feedback cannot be empty.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      const feedbackData = {
        user_id: user_id,
        booking_id: booking_id,
        ratings: rating,
        feedback_text: feedback.trim()
      };
      console.log('Submitting feedback:', feedbackData);
      try {
        const response = await axios.post('http://127.0.0.1:8000/vbook/v1/users/feedback', feedbackData);
        console.log('Feedback submitted successfully:', response.data);
        alert('Feedback submitted successfully!');

        navigate('/previousBookings', { state: { feedbackGiven: true, booking_id: booking_id } });

        setRating(0);
        setFeedback('');
        setErrorMessage('');
      } catch (error) {
        console.error('There was an error submitting the feedback:', error.response ? error.response.data : error.message);
        setErrorMessage('There was an error submitting the feedback. Please try again.');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="feedback-container">
        <div className="feedback-form">
          <div className="rating-section">
            <h3>Ratings -</h3>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${hoveredRating >= star || rating >= star ? 'active' : ''}`}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleMouseEnter(star)}
                  onMouseLeave={handleMouseLeave}
                >
                  ★
                </span>
              ))}
            </div>
            {errors.rating && <span className="error">{errors.rating}</span>}
          </div>

          <div className="feedback-section">
            <h3>Your Feedback -</h3>
            <textarea
              className='feedback_area'
              value={feedback}
              onChange={handleFeedbackChange}
              placeholder="Write your feedback here..."
              maxLength={maxFeedbackLength}
            />
            {errors.feedback && <div className="error">{errors.feedback}</div>}
          </div>

          <div className="form-submit">
            <button className='submit-feedback' type="submit" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Feedback;
