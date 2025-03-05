
import React, { useState } from "react";
import '../../assets/styles/ManageAccess.css';
import Navbar from "../../components/Navbar/Navbar";
import BackButton from "../../components/BackButton/BackButton";
import axios from 'axios';
import Loader from '../../components/Commons/Loader';



function ManageAccess() {
    const [employee_id, setEmployeeID] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleInputChange = (event) => {
        const value = event.target.value;
    
        const intValue = parseInt(value, 10);
        
        if (!isNaN(intValue) || value === '') {
          setEmployeeID(intValue || 0); 
        }
      };
    const handleUpdate = async () => {
        if (!role) {
            setError('Please select a role.');
            return;
        }
 
        setError('');
 
        try {
            setIsLoading(true);
            const response = await axios.put('http://127.0.0.1:8000/vbook/v1/admins/access-management', 
            {
               "role" :role,
                "employee_id":employee_id
            });
            console.log('Response : ',response);
            if (response.data.status === 'success') {
            alert('Role updated successfully!');}
            else if(response.data.status === 'failed'){
                alert('Invalid Employee-ID')
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role.');
        }
        finally {
            setIsLoading(false);
        }
    };

 
    return (
        <>
        <Navbar/>
        {isLoading ? <Loader /> :<div>
            <div className="back-button">
                <BackButton />
            </div>
            <div className="content-box">
                <h2 className="title">Manage Access</h2>
                {error && <div className="error-message">{error}</div>}
                <div className="form-group1">
                    <button className="label-button">Employee ID</button>
                    <input
                        type="text"
                        value={employee_id === 0 ? '' : employee_id} 
                        onChange={handleInputChange}
                        className="white-input"
                    />
                </div>
                <div className="form-group1">
                    <button className="label-button">Emp. Role</button>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                </div>
                <button className="update-button" onClick={handleUpdate}>Update</button>
            </div>
            </div>
            }
    </>
    );
}
 
export default ManageAccess;