import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../assets/styles/VerifyEmail.css";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";
import BackButton from "../../components/BackButton/BackButton";
 
const VerifiyEmail = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(60); // 10 minutes in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false); // New state for Resend OTP button
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData;
  const hasCalledAPI = useRef(false);
 
  useEffect(() => {
    if (!userData) {
      navigate("/register");
      return;
    }
 
    if (!hasCalledAPI.current) {
      sendOTP();
      hasCalledAPI.current = true;
    }
 
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
 
    return () => clearInterval(timer);
  }, [userData, navigate]);
 
  const sendOTP = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/vbook/v1/auth/verify-email", {
        email: userData.email,
      });
      setSuccess("OTP sent successfully");
      setError("");
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
      setSuccess("");
      hasCalledAPI.current = false;
    }
  };
 
  const handleResendOTP = async () => {
    setIsResending(true);
    setCountdown(60);
 
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
 
    await sendOTP();
    setIsResending(false);
    setIsLoading(false);
 
    // Clear the timer on component unmount
    return () => clearInterval(timer);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/vbook/v1/auth/verify-otp",
        {
          email: userData.email,
          otp: otp,
        }
      );
      if (response.status === 200) {
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/vbook/v1/auth/register",
            userData
          );
          setSuccess("Email verified successfully!");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } catch (registerError) {
          setError("Registration failed. Please try again.");
          setIsLoading(false);
          console.error("Registration error:", registerError);
        }
      }
    } catch (error) {
      setError(error.response?.data?.detail || "Verification failed");
    }
  };
 
  const formatTime = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
 
  return (
    <>
      <Navbar />
      {/* <IoArrowBack /> */}
      <div className="body-container">
        <BackButton />
        <div className="verify-email-container">
          {/* <div className="back-button">
            <BackButton />
          </div> */}
          <div className="verification-div">
            <h4>Email Verification</h4>
            <p>
              Please enter the verification code sent to{" "}
              <strong>
                <u>{userData?.email}</u>
              </strong>
            </p>
 
            {success && <div className="success-message">{success}</div>}
            {error && <div className="warning">{error}</div>}
 
            <form onSubmit={handleSubmit}>
              <div className="otp-box">
                <div className="otp-input">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    maxLength="6"
                    required
                  />
                </div>
              </div>
 
              <div className="verify-submit">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
 
            <div className="timer-div">
              Time remaining: {formatTime(countdown)}
            </div>
 
            {countdown === 0 && (
              <div className="verify-submit">
                <button onClick={handleResendOTP} disabled={isResending}>
                  {isResending ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
 
export default VerifiyEmail;

