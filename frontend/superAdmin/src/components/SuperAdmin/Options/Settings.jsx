/* eslint-disable no-unused-vars */
import { api_url } from "../../../../apiLink";
import React, { useState } from "react";
import axios from "axios";

const AdminForm = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const handleSubmitAddAdmin = (e) => {
    e.preventDefault();
    // Logic for adding new admin
  };

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    // Validate the form data
    if (formData.newPassword !== formData.confirmNewPassword) {
      alert("New password and confirm new password must match!");
      return;
    }
    try {
      const response = await axios.post(`${ api_url }/api/admin/change-password`, {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
  
      if (response.status === 200) {
        alert("Password changed successfully");
        // Reset form fields
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        alert("Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password");
    }
  };

  return (
    <div className="container mx-2" style={{width:"300px"}}>
      <h2 className="mt-5">Change Password</h2>
      <form onSubmit={handleSubmitChangePassword}>
        <div className="mb-3">
          <label htmlFor="oldPassword" className="form-label">
            Old Password
          </label>
          <input
            type="password"
            className="form-control"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            New Password
          </label>
          <input
            type="password"
            className="form-control"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmNewPassword" className="form-label">
            Confirm New Password
          </label>
          <input
            type="text"
            className="form-control"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-outline-dark">
          Change Password
        </button>
      </form>
    </div>
  );
};

export default AdminForm;
