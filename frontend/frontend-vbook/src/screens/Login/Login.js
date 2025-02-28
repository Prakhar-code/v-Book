import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { FaRegEyeSlash } from "react-icons/fa";
import Navbar1 from "../../components/Navbar/Navbar1.js";
import "../../assets/styles/Login.css";
import axios from "axios";
import Loader from "../../components/Commons/Loader.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (e) => {
    const emailInput = e.target.value;
    setEmail(emailInput);
    if (emailInput === "") {
      setIsValid(true);
      setErrorMessage("");
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@yash\.com$/;
      setIsValid(emailRegex.test(emailInput));
    }
  };

  const handlePassword = (e) => {
    const passwordInput = e.target.value;
    setPassword(passwordInput);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:8000/vbook/v1/auth/login",
        {
          email: email,
          password: password,
        }
      );

      const token = response.data.access_token;

      const userData = {
        email: response.data.user_email,
        name: response.data.user_name,
        role: response.data.role,
        id: response.data.user_id
      };
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("userid", response.data.user_id);
      localStorage.setItem("username", response.data.user_name);
      localStorage.setItem("useremail", response.data.user_email);


      localStorage.setItem("user", JSON.stringify(userData));


      if (userData.role === "admin") {
        navigate("/admindashboard", { replace: true });
      } else if (userData.role === "user") {
        navigate("/userdashboard", { replace: true });
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setErrorMessage(
              "Invalid credentials. Please check your email and password."
            );
            break;
          case 404:
            setErrorMessage("User not found. Please check your email.");
            break;
          case 500:
            setErrorMessage("Server error. Please try again later.");
            break;
          default:
            setErrorMessage("An error occurred. Please try again.");
        }
      } else {
        setErrorMessage("Network error. Please check your connection.");
      }
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <Navbar1 />
      </div>
      {isLoading ? <Loader /> :<div>
      <div className="body-container">
        <div className="vbook-container">
          <div className="vbook-space">
            <h3>vbook</h3>
            <p>
              <div className="one">Your One Stop</div>
              <div className="two">Destination</div>
              <div className="three">For Cabin</div>
              <div className="four">Bookings</div>
            </p>
          </div>
          <div className="login-div">
            <h4>LOGIN</h4>
            <form onSubmit={handleSubmit}>
              <div className="email-box">
                <div className="user-icon-input">
                  <CiUser />
                </div>
                <div className="email-input">
                  <input
                    name="email"
                    value={email}
                    onChange={validateEmail}
                    placeholder="Username/Email"
                    type="email"
                    required
                  />
                </div>
              </div>
              {!isValid && (
                <div className="warning">
                  <p>
                    Invalid Email, Please enter an email with '@yash.com' domain
                  </p>
                </div>
              )}
              <div className="password-box">
                <div className="eye-icon-input">
                  <FaRegEyeSlash />
                </div>
                <div className="password-input">
                  <input
                    name="password"
                    value={password}
                    onChange={handlePassword}
                    placeholder="Password"
                    type="password"
                    required
                  />
                </div>
              </div>

              <div className="login-submit">
                <button type="submit">Login</button>
              </div>
            </form>
            {errorMessage && (
              <div className="error-message">
                <p>{errorMessage}</p>
              </div>
            )}
            <div className="hyperlinks-div">
              <div className="forgot-password-div">
                <a href="/forgotpassword">Forgot Password?</a>
              </div>
              <div className="signup-div">
                <p>
                  Dont Have an Account? <a href="/register"> Sign Up</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>}
    </div>
  );
}

export default Login;