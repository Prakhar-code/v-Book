import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import BackButton from "../../components/BackButton/BackButton";
import "../../assets/styles/IndividualTicket.css";
import Loader from "../../components/Commons/Loader";

const TicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticketData, setTicketData] = useState(null);

  const fetchTicketDetails = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:8000/vbook/v1/admins/manage-tickets/${ticketId}`
      );

      if (response.data && response.data.status === "success") {
        const sanitizedTicket = {
          ...response.data.ticket,
          name: String(response.data.ticket.name || ""),
          email: String(response.data.ticket.email || ""),
          date: String(response.data.ticket.date || ""),
          cabin_name: String(response.data.ticket.cabin_name || ""),
          status: String(response.data.ticket.status || ""),
          description: String(response.data.ticket.description || ""),
          response: String(response.data.ticket.response || ""),
        };
        setTicketData(sanitizedTicket);
        console.log(sanitizedTicket.email);
      } else {
        throw new Error(
          response.data?.detail || "Failed to fetch ticket details"
        );
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      setError(
        typeof error === "string"
          ? error
          : error.message || "Could not fetch ticket details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketDetails = async (updatedData) => {
    try {
      setError("");
      setIsLoading(true);

      console.log("Sending update:", updatedData);

      const response = await axios.put(
        `http://localhost:8000/vbook/v1/admins/manage-tickets/${ticketId}`,
        {
          status: updatedData.status,
          response: updatedData.response,
          description: updatedData.description,
        }
      );

      console.log("Server response:", response.data);

      if (
        response.data &&
        (response.data.status === "success" || response.data.ticket_id)
      ) {
        await fetchTicketDetails();
        return true;
      } else {
        throw new Error(response.data?.detail || "Failed to update ticket");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Could not update ticket"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);

  const handleClose = () => {
    navigate("/ticketmanagement");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    const updatedTicketData = {
      ...ticketData,
      // Force the status to CLOSED when saving
    };

    console.log("Saving ticket data:", updatedTicketData); // Add this
    const success = await updateTicketDetails(updatedTicketData);
    console.log("Save result:", success); // Add this
    if (success) {
      navigate("/ticketmanagement");
    }
  };

  const handleFieldChange = (field, value) => {
    setTicketData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{String(error)}</div>
        <button onClick={fetchTicketDetails} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="not-found-container">
        <div>No ticket data found</div>
        <button onClick={handleBack} className="back-button">
          <BackButton className="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="ticket-container">
            <div className="ticket-wrapper">
              <div className="breadcrumb">
                <button
                  onClick={handleBack}
                  className="back-button flex items-center text-gray-600 hover:text-gray-900"
                >
                  <BackButton className="w-4 h-4 mr-2" />
                </button>
                {/* <div className="separator">Back</div>
                    <span className="path">Admin / Ticket Management / Ticket_{ticketId}</span> */}
              </div>

              <div className="ticket-content">
                <div className="ticket-header">
                  <h2 className="ticket-id">Ticket ID: {String(ticketId)}</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={String(ticketData.name || "")}
                      disabled
                      className="readonly-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={String(ticketData.email || "")}
                      disabled
                      className="readonly-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={String(ticketData.date || "")}
                      disabled
                      className="readonly-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cabin</label>
                    <input
                      type="text"
                      value={String(ticketData.cabin_name || "")}
                      disabled
                      className="readonly-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={String(ticketData.status || "")}
                      onChange={(e) =>
                        handleFieldChange("status", e.target.value)
                      }
                    >
                      <option value="">Select Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={String(ticketData.description || "")}
                    // onChange={(e) => handleFieldChange('description', e.target.value)}
                    disabled
                    className="readonly-input"
                  />
                </div>

                <div className="form-group">
                  <label>Response</label>
                  <textarea
                    value={String(ticketData.response || "")}
                    onChange={(e) =>
                      handleFieldChange("response", e.target.value)
                    }
                  />
                </div>

                <div className="button-group">
                  <button onClick={handleSave} className="save-button">
                    Save
                  </button>
                  <button onClick={handleClose} className="close-button">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketDetails;
