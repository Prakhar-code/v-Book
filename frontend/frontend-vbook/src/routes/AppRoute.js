import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegistrationPage from "../screens/RegistrationPage/RegistrationPage";
import CabinManagement from "../screens/CabinManagment/CabinManagment";
import VerifyEmail from "../screens/VerifyEmail/VerifyEmail";
import EditCabin from "../screens/CabinManagment/Editcabin";
import AdminDashboard from "../screens/Admin/AdminDashboard";
import ForgotPassword from "../screens/Login/ForgotPassword";
import UserDashboard from "../screens/User/UserDashboard";
import UserPreviousBookings from "../screens/User/UserPreviousBookings";
import UserUpcomingBookings from "../screens/User/UserUpcomingBookings";
import Login from "../screens/Login/Login";
import ProtectedRoute from "./ProtectedRoute";
import CabinBooking from "../screens/CabinBooking/CabinBooking"
import ManageAccess from "../screens/Admin/ManageAccess";
import TicketManagement from "../screens/TicketManagement/Ticketmanagement";
import IndividualTicket from "../screens/TicketManagement/individualticket";
import Feedback from "../screens/Feedback/Feedback";
import NotAuthorized from "../screens/Login/NotAuthorized";
import RaiseTicket from "../screens/TicketManagement/CreateTicket";
import CabinBookingadminPage from "../screens/CabinBooking/CabinBookingAdmin";
import Cabinrequests from "../screens/Admin/Cabinrequests";
import CitMap from "../screens/Map/CitMap";
const AppRoute = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verifyemail" element={<VerifyEmail />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/cabinbooking" element={<CabinBooking />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/cabinbooking" element={<CabinBooking />} />
        <Route path="/notauthorized" element={<NotAuthorized />} />
        <Route path="/cabinbookingadmin" element={<CabinBookingadminPage />} />
        <Route path="/cabinrequests" element={<Cabinrequests />} />
        <Route path="/cabin-booking-map" element={<CitMap />} />
    

        {/* <Route path="/ticketmanagement"  */}
        {/* <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/userdashboard" element={<UserDashboard />} /> */}
        
        <Route
          path="/userdashboard"
          element={<ProtectedRoute element={UserDashboard} allowedRoles={['user']} />}
        />
        <Route
          path="/bookCabin"
          element={<ProtectedRoute element={CabinBooking} allowedRoles={['user']} />}
        />
        <Route
          path="/upcomingBookings"
          element={<ProtectedRoute element={UserUpcomingBookings} allowedRoles={['user']} />}
        />        
        <Route
          path="/previousBookings"
          element={<ProtectedRoute element={UserPreviousBookings} allowedRoles={['user']} />}
        />
        <Route
          path="/raiseTicket"
          element={<ProtectedRoute element={RaiseTicket} allowedRoles={['user']} />}
        />
        <Route
          path="/ticket/:ticketId"
          element={<ProtectedRoute element={IndividualTicket} allowedRoles={['admin']} />}
        />
        <Route
          path="/admindashboard"
          element={<ProtectedRoute element={AdminDashboard} allowedRoles={['admin']} />}
        />
        <Route
          path="/ticketmanagement"
          element={<ProtectedRoute element={TicketManagement} allowedRoles={['admin']} />}
        />
        <Route
          path="/cabinmanagement"
          element={<ProtectedRoute element={CabinManagement} allowedRoles={['admin']} />}
        />
        <Route
          path="/editcabin"
          element={<ProtectedRoute element={EditCabin} allowedRoles={['admin']} />}
        />
        <Route
          path="/manageaccess" element={<ProtectedRoute element={ManageAccess} allowedRoles={['admin']} />} />
      </Routes>
    </Router>
  );
};

export default AppRoute;
