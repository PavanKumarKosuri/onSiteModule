/* eslint-disable no-unused-vars */
// phlebo\src\components\Login\Options\Settings.jsx
import { api_url } from "../../../../apiLink";
import React, { useState } from "react";
import axios from "axios";

const AdminForm = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    // Validate the form data
    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage("New password and confirm new password must match!");
      setMessageType("error");
      setTimeout(() => setMessage(""), 4000);
      return;
    }
    try {
      const response = await axios.post(`${api_url}/api/change-password/lt`, {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      if (response.status === 200) {
        setMessage("Password changed successfully");
        setMessageType("success");
        // Reset form fields
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        setMessage("Failed to change password");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage("Failed to change password");
      setMessageType("error");
    }
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <div className="container mx-2" style={{ width: "300px" }}>
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
            type="password" // Changed from "text" to "password"
            className="form-control"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            required
          />
        </div>
        {message && (
          <div
            className={`alert ${
              messageType === "success" ? "alert-success" : "alert-danger"
            }`}
          >
            {message}
          </div>
        )}
        <button type="submit" className="btn btn-outline-dark">
          Change Password
        </button>
      </form>
    </div>
  );
};

export default AdminForm;
