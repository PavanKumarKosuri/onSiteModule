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

const GetHRs = () => {
  const [hrReports, setHrReports] = useState([]);
  const [activeTab] = useState("hr");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({
    empid: "",
    name: "",
    city: "",
    companyname: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isFilterCollapseOpen, setIsFilterCollapseOpen] = useState(false);
  const [isAddCollapseOpen, setIsAddCollapseOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [newEntryHr, setNewEntryHr] = useState({
    name: "",
    empid: "",
    phonenumber: "",
    email: "",
    city: "",
    companyname: "",
    uniquekey: "",
  });

  useEffect(() => {
    fetchHrReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHrReports = async () => {
    try {
      const response = await axios.get(
        `${api_url}/api/hrimport/get-all-hrdata`,
        {
          params: filters,
        }
      );

      if (response.data.length === 0) {
        setErrorMessage(
          "No HR reports found with the specified filter criteria"
        );
      } else {
        setErrorMessage("");
      }
      setHrReports(response.data);
    } catch (error) {
      console.error("Error fetching HR reports:", error);
      setErrorMessage("Error fetching HR reports");
    }
  };

  const handleFilter = async () => {
    try {
      await fetchHrReports();
    } catch (error) {
      console.error(`Error fetching filtered ${activeTab} reports:`, error);
      setErrorMessage(error.response?.data?.error || "Error fetching data");
    }
  };

  const handleClearFilters = async () => {
    setFilters({
      empid: "",
      name: "",
      city: "",
      companyname: "",
    });
    try {
      await fetchHrReports();
    } catch (error) {
      console.error("Error fetching all data:", error);
      setErrorMessage("Error fetching all data");
    }
  };

  const clearForm = () => {
    setNewEntryHr({
      name: "",
      empid: "",
      phonenumber: "",
      email: "",
      city: "",
      companyname: "",
      uniquekey: "",
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
      await axios.delete(`${api_url}/api/hrimport/delete-hr/${deleteId}`);
      fetchHrReports();
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
      const updatedHr = { ...currentEdit };
      await axios.put(
        `${api_url}/api/hrimport/update-hr/${currentEdit.id}`,
        updatedHr
      );

      setIsEditing(false);
      setCurrentEdit(null);
      fetchHrReports();
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  };

  const saveAdd = async () => {
    try {
      const requiredHrFields = [
        "name",
        "empid",
        "phonenumber",
        "email",
        "city",
        "companyname",
        "uniquekey",
      ];
      const isAnyHrFieldEmpty = requiredHrFields.some(
        (field) => !newEntryHr[field].trim()
      );

      if (isAnyHrFieldEmpty) {
        setErrorMessage("Please fill in all required fields.");
        return;
      }

      await axios.post(`${api_url}/api/hrimport/add-hr`, newEntryHr);
      setErrorMessage("");
      setIsAddCollapseOpen(false);
      clearForm();
      fetchHrReports();
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
              <input
                type="text"
                className="form-control"
                placeholder="Employee ID"
                name="empid"
                value={filters.empid || ""}
                onChange={(e) => handleInputChange(e, setFilters)}
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                name="name"
                value={filters.name || ""}
                onChange={(e) => handleInputChange(e, setFilters)}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="City"
                name="city"
                value={filters.city || ""}
                onChange={(e) => handleInputChange(e, setFilters)}
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Company Name"
                name="companyname"
                value={filters.companyname || ""}
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
            {Object.keys(newEntryHr).map((key) => (
              <div className="form-group" key={key}>
                <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input
                  type="text"
                  className="form-control"
                  name={key}
                  value={newEntryHr[key]}
                  onChange={(e) => handleAddInputChange(e, setNewEntryHr)}
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
        onClick={() => downloadExcel(hrReports, "hr_reports.xlsx")}
      >
        Download Excel
      </a>
      <table className="table table-hover table-striped table-sm mt-3">
        <thead className="table">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Employee ID</th>
            <th>Phone Number</th>
            <th>Email</th>
            <th>City</th>
            <th>Company Name</th>
            <th>Unique Key</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hrReports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>
                {isEditing && currentEdit && currentEdit.id === report.id ? (
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={currentEdit.name}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  report.name
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === report.id ? (
                  <input
                    type="text"
                    className="form-control"
                    name="empid"
                    value={currentEdit.empid}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  report.empid
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === report.id ? (
                  <input
                    type="text"
                    className="form-control"
                    name="phonenumber"
                    value={currentEdit.phonenumber}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  report.phonenumber
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === report.id ? (
                  <input
                    type="text"
                    className="form-control"
                    name="email"
                    value={currentEdit.email}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  report.email
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === report.id ? (
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={currentEdit.city}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  report.city
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === report.id ? (
                  <input
                    type="text"
                    className="form-control"
                    name="companyname"
                    value={currentEdit.companyname}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  report.companyname
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === report.id ? (
                  <input
                    type="text"
                    className="form-control"
                    name="uniquekey"
                    value={currentEdit.uniquekey}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  report.uniquekey
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === report.id ? (
                  <button className="btn btn-outline-dark" onClick={saveEdit}>
                    Save
                  </button>
                ) : (
                  <div className="d-flex">
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => handleEdit(report)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger ml-2 btn-sm"
                      style={{ marginLeft: "10px" }}
                      onClick={() => handleDelete(report.id)}
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

      {showModal && (
        <div
          className="modal show"
          tabIndex="-1"
          role="dialog"
          style={{ display: "block" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleCancelDelete}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this entry?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetHRs;
