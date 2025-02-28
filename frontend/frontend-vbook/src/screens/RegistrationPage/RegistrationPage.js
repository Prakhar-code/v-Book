import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/RegistrationPage.css";
import {
  validatePassword,
  validateEmail,
} from "../../utils/passwordvalidation";
import Navbar1 from "../../components/Navbar/Navbar1";
import axios from "axios";
import Loader from "../../components/Commons/Loader";

const RegistrationPage = () => {
  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    removeError(name);
  };

  const removeError = (name) => {
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleIdInput = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, "");

    if (numericValue !== value) {
      setErrors({
        ...errors,
        employee_id: "Employee ID should only contain numbers and no spaces",
      });
    } else {
      removeError("empid");
    }

    setForm({ ...form, employee_id: numericValue });
  };

  const validateForm = () => {
    const validationErrors = {};
    if (form.email.length < 15 || form.email.length > 64) {
      validationErrors.email =
        "Email must be between 15 and 64 characters long";
    } else if (!validateEmail(form.email)) {
      validationErrors.email = "Invalid email address";
    }
    if (!validatePassword(form.password)) {
      validationErrors.password =
        "Password must be at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character.";
    }
    if (form.password !== form.confirm_password) {
      validationErrors.confirm_password = "Passwords do not match";
    }
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        setIsLoading(true);
        const formData = {
          ...form,
          employee_id: parseInt(form.employee_id),
        };

        navigate("/verifyemail", {
          state: { userData: formData },
        });
      } catch (error) {
        console.error("Error registering:", error);
        setErrors({ submit: "Registration failed. Please try again." });
      }
      finally {
        setIsLoading(false);
        }
    }
  };

  return (
    <>
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
          <div className="registration-div">
            <h4>REGISTER</h4>
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  id="employee_id"
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  onInput={handleIdInput}
                  className="registration-input"
                  placeholder="Enter your Employee ID"
                  required
                />
              </div>
              {errors.employee_id && (
                <span className="error">{errors.employee_id}</span>
              )}
              <div className="form-group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="registration-input"
                  placeholder="Enter your Name"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="registration-input"
                  placeholder="Enter your Email"
                  required
                />
              </div>
              {errors.email && <span className="error">{errors.email}</span>}
              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="registration-input"
                  placeholder="Enter your Password"
                  required
                />
              </div>
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
              <div className="form-group">
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  className="registration-input"
                  placeholder="Confirm your Password"
                  required
                />
              </div>
              {errors.confirm_password && (
                <span className="error">{errors.confirm_password}</span>
              )}
              <button type="submit" className="register-button">
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>}
    </>
  );
};

export default RegistrationPage;
