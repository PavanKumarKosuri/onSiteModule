/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { api_url } from "../../../../../apiLink";
import {
  handleInputChange,
  handleEditInputChange,
  handleAddInputChange,
  downloadExcel,
} from "./commonFunctions";

const GetUsers = () => {
  const [users, setUsers] = useState([]);
  const [activeTab] = useState("user");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({
    searchCriteria: "phoneNumber",
    searchText: "",
    city: "",
    companyName: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isFilterCollapseOpen, setIsFilterCollapseOpen] = useState(false);
  const [isAddCollapseOpen, setIsAddCollapseOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [newEntry, setNewEntry] = useState({
    phoneNumber: "",
    patientName: "",
    employeeId: "",
    email: "",
    age: "",
    gender: "",
    package: "",
    subPackage: "",
    bookingId: "",
    reportsTaken: "",
    additionalInfo: "",
    city: "",
    companyName: "",
    timeslot: "",
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${api_url}/api/users/filter`, {
        params: {
          [filters.searchCriteria]: filters.searchText,
          reportsPending:
            filters.searchCriteria === "reportsPending"
              ? filters.searchText
              : undefined,
          city: filters.city,
          companyName: filters.companyName,
        },
      });
      if (response.data.length === 0) {
        setErrorMessage("No user found with the specified filter criteria");
      } else {
        setErrorMessage("");
      }
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching filtered users:", error);
    }
  };

  const handleFilter = async () => {
    try {
      await fetchUsers();
    } catch (error) {
      console.error(`Error fetching filtered ${activeTab} reports:`, error);
      setErrorMessage(error.response?.data?.error || "Error fetching data");
    }
  };

  const handleClearFilters = async () => {
    setFilters({
      searchCriteria: "phoneNumber",
      searchText: "",
      city: "",
      companyName: "",
    });
    try {
      await fetchUsers();
    } catch (error) {
      console.error("Error fetching all data:", error);
      setErrorMessage("Error fetching all data");
    }
  };

  const clearForm = () => {
    setNewEntry({
      phoneNumber: "",
      patientName: "",
      employeeId: "",
      email: "",
      age: "",
      gender: "",
      package: "",
      subPackage: "",
      bookingId: "",
      reportsTaken: "",
      additionalInfo: "",
      city: "",
      companyName: "",
      timeslot: "",
    });
  };

  const handleEdit = (entry) => {
    setCurrentEdit(entry);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${api_url}/api/users/${deleteId}`);
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      console.error(`Error deleting ${activeTab} entry:`, error);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
  };

  const saveEdit = async () => {
    try {
      const updatedUser = { ...currentEdit };
      await axios.put(
        `${api_url}/api/users/reports/${currentEdit.id}`,
        updatedUser
      );

      setIsEditing(false);
      setCurrentEdit(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  };

  const saveAdd = async () => {
    try {
      const requiredFields = [
        "phoneNumber",
        "patientName",
        "employeeId",
        "email",
        "age",
        "gender",
        "package",
        "subPackage",
        "bookingId",
        "reportsTaken",
        "additionalInfo",
        "city",
        "companyName",
        "timeslot",
      ];
      const isAnyFieldEmpty = requiredFields.some(
        (field) => !newEntry[field].trim()
      );

      if (isAnyFieldEmpty) {
        setErrorMessage(
          "Please fill in all required fields for the user report."
        );
        return;
      }

      await axios.post(`${api_url}/api/users`, newEntry);
      setErrorMessage("");
      setIsAddCollapseOpen(false);
      clearForm();
      fetchUsers();
    } catch (error) {
      console.error(`Error adding new ${activeTab} report:`, error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          setErrorMessage(
            `Server responded with error: ${
              error.response.data.error || error.response.statusText
            }`
          );
        } else if (error.request) {
          setErrorMessage(
            "No response received from the server. Please check your network connection."
          );
        } else {
          setErrorMessage(
            "An error occurred while setting up the request. Please try again."
          );
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="container mt-3">
      <button
        className="btn btn-outline-dark mb-3"
        onClick={() => setIsFilterCollapseOpen(!isFilterCollapseOpen)}
      >
        Filter
      </button>
      <button
        className="btn btn-outline-dark mb-3 mx-2"
        onClick={() => setIsAddCollapseOpen(!isAddCollapseOpen)}
      >
        Add
      </button>
      <div className={`collapse ${isFilterCollapseOpen ? "show" : ""}`}>
        <div className="card card-body">
          <div className="row mb-3">
            <div className="col">
              <select
                className="form-select"
                name="searchCriteria"
                value={filters.searchCriteria}
                onChange={(e) => handleInputChange(e, setFilters)}
              >
                <option value="employeeId">Employee ID</option>
                <option value="patientName">Patient Name</option>
                <option value="phoneNumber">Phone Number</option>
                <option value="reportsPending">Reports Status</option>
              </select>
            </div>
            <div className="col">
              {filters.searchCriteria === "reportsPending" ? (
                <select
                  className="form-select"
                  name="searchText"
                  value={filters.searchText}
                  onChange={(e) => handleInputChange(e, setFilters)}
                >
                  <option value="">Select One</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              ) : (
                <input
                  type={
                    filters.searchCriteria === "employeeId" ? "number" : "text"
                  }
                  className="form-control"
                  placeholder={`Enter ${
                    filters.searchCriteria === "employeeId"
                      ? "Employee ID"
                      : "Search Text"
                  }`}
                  name="searchText"
                  value={filters.searchText}
                  onChange={(e) => handleInputChange(e, setFilters)}
                />
              )}
            </div>
          </div>
          <div className="row mb-3 mt-3">
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="City"
                name="city"
                value={filters.city}
                onChange={(e) => handleInputChange(e, setFilters)}
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Company Name"
                name="companyName"
                value={filters.companyName}
                onChange={(e) => handleInputChange(e, setFilters)}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <button className="btn btn-outline-dark" onClick={handleFilter}>
                Apply Filters
              </button>
              <button
                className="btn btn-outline-dark ml-2"
                style={{ marginLeft: "10px" }}
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`collapse ${isAddCollapseOpen ? "show" : ""} mt-3`}>
        <div className="card card-body">
          <form>
            {Object.keys(newEntry).map((key) => (
              <div className="form-group" key={key}>
                <label>{key}</label>
                <input
                  type="text"
                  className="form-control"
                  name={key}
                  value={newEntry[key]}
                  onChange={(e) => handleAddInputChange(e, setNewEntry)}
                />
              </div>
            ))}
          </form>

          <div className="row">
            <div className="col">
              <button className="btn btn-outline-dark mt-3" onClick={saveAdd}>
                Confirm Add
              </button>
              <button
                className="btn btn-outline-dark mt-3 ml-2"
                style={{ marginLeft: "10px" }}
                onClick={clearForm}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && <p className="text-danger">{errorMessage}</p>}
      <br />
      <a
        className="downloadLink"
        style={{ color: "black", cursor: "pointer" }}
        onClick={() => downloadExcel(users, "user_reports.xlsx")}
      >
        Download Excel
      </a>
      <table className="table table-hover table-striped table-sm mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Phone Number</th>
            <th>Patient Name</th>
            <th>Employee ID</th>
            <th>Email</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Package</th>
            <th>Sub Package</th>
            <th>Booking Id</th>
            <th>Reports Taken</th>
            <th>Additional Info</th>
            <th>City</th>
            <th>Company Name</th>
            <th>Time Slot</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="phoneNumber"
                    value={currentEdit.phoneNumber}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.phoneNumber
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="patientName"
                    value={currentEdit.patientName}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.patientName
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="employeeId"
                    value={currentEdit.employeeId}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.employeeId
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="email"
                    value={currentEdit.email}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="age"
                    value={currentEdit.age}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.age
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="gender"
                    value={currentEdit.gender}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.gender
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="package"
                    value={currentEdit.package}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.package
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="subPackage"
                    value={currentEdit.subPackage}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.subPackage
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="bookingId"
                    value={currentEdit.bookingId}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.bookingId
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="number"
                    name="reportsTaken"
                    value={currentEdit.reportsTaken}
                    placeholder="Enter 0 or 1"
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.reportsTaken
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="additionalInfo"
                    value={currentEdit.additionalInfo}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.additionalInfo
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="city"
                    value={currentEdit.city}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.city
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="companyName"
                    value={currentEdit.companyName}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.companyName
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <input
                    type="text"
                    name="timeslot"
                    value={currentEdit.timeslot}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  user.timeslot
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === user.id ? (
                  <button
                    className="btn btn-outline-primary"
                    onClick={saveEdit}
                  >
                    Save
                  </button>
                ) : (
                  <div className="d-flex">
                    <button
                      className="btn btn-outline-warning btn-sm mx-1"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className="modal"
        tabIndex="-1"
        style={{ display: showModal ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Confirmation</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCancelDelete}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this entry?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetUsers;
