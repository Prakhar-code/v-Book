import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import '../../assets/styles/TicketManagement.css';
import BackButton from "../../components/BackButton/BackButton";
import axios from "axios";
import Loader from '../../components/Commons/Loader';
const TicketManagement = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("http://localhost:8000/vbook/v1/admins/manage-tickets");
                if (response.data.status === "success") {
                    if (Array.isArray(response.data.tickets)) {
                        setTickets(response.data.tickets);
                    } else {
                        setErrorMessage('No tickets available');
                        setTickets([]);
                    }
                } else {
                    setErrorMessage('Failed to fetch tickets');
                    setTickets([]);
                }
            } catch (error) {
                setErrorMessage(error.response?.data?.detail || 'Could not fetch tickets');
                console.error('Error fetching tickets:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (error) {
            return dateString;
        }
    };

    const handleTicketClick = (ticketId) => {
        navigate(`/ticket/${ticketId}`);
    };

    return (
        <>
            <Navbar />
            {isLoading ? <Loader /> :<div>
            <div className="back-button">
                <BackButton />
            </div>
            <div className="ticket-management-container">
                <div className="ticket-management-wrapper">
                    <h1 className="ticket-management-title">Ticket Management</h1>
                    <div className="ticket-selection-wrapper">
                        
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        {!isLoading && tickets.length > 0 && (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ticket ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr
                                            key={ticket.ticket_id}
                                            onClick={() => handleTicketClick(ticket.ticket_id)}
                                            style={{ cursor: 'pointer' }}
                                            className="hover:bg-gray-100"
                                        >
                                            <td className="text-blue-600 hover:text-blue-800">
                                                {ticket.ticket_id}
                                            </td>
                                            <td>{formatDate(ticket.date)}</td>
                                            <td>
                                                <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!isLoading && tickets.length === 0 && !errorMessage && (
                            <div className="no-tickets-message">No tickets found</div>
                        )}
                    </div>
                </div>
            </div>
            </div>}
        </>
    );
};

export default TicketManagement;