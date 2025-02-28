import React, { useState } from "react";
import "../../assets/styles/ForgotPassword.css";
import Navbar from "../../components/Navbar/Navbar";
import { Route, useNavigate } from "react-router-dom";
import axios from 'axios';
function ForgotPassword() {
  const [email, setemail] = useState("");
  const [otp, setotp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState("");
  const [apiMessage, setapiMessage] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [newpassword, setnewpassword] = useState("");
  const [verifyotp, setverifyotp] = useState(false);
  const [sendotp, setsendotp] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [passwordIsValid, setPasswordIsValid] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordmatch, setpasswordmatch] = useState(false);
  
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const emailInput = e.target.value;

    setemail(emailInput);
    
    setErrorMessage("");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@yash\.com$/;
    setIsValid(emailRegex.test(emailInput));
  };

  const handlesendotp = async () => {
    if(!email){
     alert("Please fill Email");
    }
    else if(!isValid){
      alert("Email doesnot have yash domain");}
    else{
      try {
        const response = await axios.post('http://127.0.0.1:8000/vbook/v1/auth/forget-password', 
        {
           "email" :email,
            
        });
    
        if (response.data.status === "success"){
        setsendotp(true);
        
        alert(response.data.message);
        setsendotp(true);
      }
      else{
        alert(response.message)
      }
    } catch (error) {
        console.error('Error sending otp:', error);
        alert('Failed to send otp.');
    }
    
    }
  };

  const handleotpChange = (e) => {
    setotp(e.target.value);
    setErrorMessage("");
    if (e.target.value && !/^\d{4}$/.test(e.target.value)) {
      
    }
  };
  const handleCancelClick = () => {
    navigate("/login");
    alert("Forgot password Verification Cancelled");
  };
  const handleverifyotp = async (e) =>{
    if(!otp){
      alert("OTP cant be empty")
    }
    // else if(otp && !/^\d{4}$/.test(otp)){
    //   alert("OTP should only contains digit")
    // }
    else{
    try{
      const response = await axios.post('http://127.0.0.1:8000/vbook/v1/auth/verify-otp', 
        {
           "email" :email,
           "otp":otp,
            
        });
    if(response.data.status==="success"){
    setverifyotp(true);}
    else{
    alert(response.data.message)
    }}
  catch (error) {
    console.error('Error verifying otp:', error);
    alert('Failed to verify otp.');
}

}
  };
  const handlenewpasswordChange = (e) => {
    setnewpassword(e.target.value);
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_ -])[A-Za-z\d@$!%*?&_ -]{8,}$/;
    setPasswordIsValid(passwordPattern.test(e.target.value));
    if (e.target.value === confirmPassword) {
      setpasswordmatch(true);
    }
    else{
      setpasswordmatch(false);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setconfirmPassword(e.target.value);
    if (e.target.value === newpassword) {
      setpasswordmatch(true);
    }
    else{
      setpasswordmatch(false);
    }
  };
  const handleChangePassword = async (e) => {
    if(!confirmPassword || !newpassword){
      alert("Please fill all the fields ")
    }
    else if(!passwordmatch){
      alert("Password Doesn't match")
    }
    else{
      //alert("Password changed succesfully")
      try{
        
        const response = await axios.post('http://127.0.0.1:8000/vbook/v1/auth/update-password', 
          {
             "email" :email,
             "password":newpassword,
              
          });
          alert("Password changed succesfully");
          navigate('/login');
    }catch(error)
      {
    console.error('Error changing password:', error);
    alert('Failed to change password.');
      }
  }
};
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="header">
          {/* <img src={logo} alt="Logo" className="logo" /> */}
        </div>
        <div className="verification-box">
          <h2 className="heading">Forgot Password </h2>
          {!sendotp && !verifyotp && (
            <div>
              <input
                type="text"
                placeholder="enter email"
                className="input-box"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>
          )}
          {!isValid && (
            <div className="error-message">
              <p>
                Invalid Email, Please enter an email with '@yash.com' domain
              </p>
            </div>
          )}{" "}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {!sendotp && !verifyotp && (
            <div className="sendotp">
              <button type="submit" onClick={handlesendotp}>
                send otp
              </button>
            </div>
          )}
          {sendotp && !verifyotp && (
            <input
              type="text"
              placeholder="enter otp"
              className="input-box"
              value={otp}
              onChange={handleotpChange}
              required
            />
          )}
          {sendotp && !verifyotp && (
            <div className="sendotp">
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              <button onClick={handleverifyotp}>Verify OTP</button>
            </div>
          )}
          {verifyotp && (
            <div>
              <input
                type="password"
                placeholder="enter new password"
                className="input-box"
                value={newpassword}
                onChange={handlenewpasswordChange}
                required
              />
              {!passwordIsValid && newpassword && (
                <div className="error-message">
                  <p>
                    "Password must be at least 8 characters, including an
                    uppercase letter, a lowercase letter, a number, and a
                    special character."
                  </p>
                </div>
              )}
              <input
                type="password"
                placeholder="confirm password"
                className="input-box"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
              {confirmPassword && !passwordmatch && (
                <div className="error-message">
                  <p>Password do not match</p>
                </div>
              )}
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              <div className="sendotp">
                <button onClick={handleChangePassword}>Change Password</button>
              </div>
            </div>
          )}
          <div className="cancel-button">
            <button onClick={handleCancelClick}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}
export default ForgotPassword;
