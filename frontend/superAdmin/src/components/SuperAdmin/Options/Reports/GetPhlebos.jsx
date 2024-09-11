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

const GetPhlebos = () => {
  const [flabosReports, setFlaboReports] = useState([]);
  const [activeTab] = useState("flabos");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({
    unqId: "",
    name: "",
    placedCity: "",
    placedCompany: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isFilterCollapseOpen, setIsFilterCollapseOpen] = useState(false);
  const [isAddCollapseOpen, setIsAddCollapseOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [newEntryFlabo, setNewEntryFlabo] = useState({
    name: "",
    unqId: "",
    phoneNumber: "",
    age: "",
    gender: "",
    placedCity: "",
    placedCompany: "",
  });

  useEffect(() => {
    fetchFlaboReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFlaboReports = async () => {
    try {
      const response = await axios.get(`${api_url}/api/flabos-reports`, {
        params: filters,
      });

      if (response.data.length === 0) {
        setErrorMessage(
          "No flabo reports found with the specified filter criteria"
        );
      } else {
        setErrorMessage("");
      }
      setFlaboReports(response.data);
    } catch (error) {
      console.error("Error fetching Flabo reports:", error);
      setErrorMessage("Error fetching Flabo reports");
    }
  };

  const handleFilter = async () => {
    try {
      await fetchFlaboReports();
    } catch (error) {
      console.error(`Error fetching filtered ${activeTab} reports:`, error);
      setErrorMessage(error.response?.data?.error || "Error fetching data");
    }
  };

  const handleClearFilters = async () => {
    setFilters({
      unqId: "",
      name: "",
      placedCity: "",
      placedCompany: "",
    });
    try {
      await fetchFlaboReports();
    } catch (error) {
      console.error("Error fetching all data:", error);
      setErrorMessage("Error fetching all data");
    }
  };

  const clearForm = () => {
    setNewEntryFlabo({
      name: "",
      unqId: "",
      phoneNumber: "",
      age: "",
      gender: "",
      placedCity: "",
      placedCompany: "",
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
      await axios.delete(`${api_url}/api/flabos-reports/${deleteId}`);
      fetchFlaboReports();
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
      const updatedFlabo = { ...currentEdit };
      await axios.put(
        `${api_url}/api/flabos-reports/${currentEdit.id}`,
        updatedFlabo
      );

      setIsEditing(false);
      setCurrentEdit(null);
      fetchFlaboReports();
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  };

  const saveAdd = async () => {
    try {
      const requiredFlaboFields = [
        "name",
        "unqId",
        "phoneNumber",
        "age",
        "gender",
        "placedCity",
        "placedCompany",
      ];
      const isAnyFlaboFieldEmpty = requiredFlaboFields.some(
        (field) => !newEntryFlabo[field].trim()
      );

      if (isAnyFlaboFieldEmpty) {
        setErrorMessage("Please fill in all required fields.");
        return;
      }

      await axios.post(`${api_url}/api/flabos-reports`, newEntryFlabo);
      setErrorMessage("");
      setIsAddCollapseOpen(false);
      clearForm();
      fetchFlaboReports();
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
                placeholder="UnqId"
                name="unqId"
                value={filters.unqId || ""}
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
                placeholder="Placed City"
                name="placedCity"
                value={filters.placedCity || ""}
                onChange={(e) => handleInputChange(e, setFilters)}
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Placed Company"
                name="placedCompany"
                value={filters.placedCompany || ""}
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
            {Object.keys(newEntryFlabo).map((key) => (
              <div className="form-group" key={key}>
                <label>{key}</label>
                <input
                  type="text"
                  className="form-control"
                  name={key}
                  value={newEntryFlabo[key]}
                  onChange={(e) => handleAddInputChange(e, setNewEntryFlabo)}
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
        onClick={() => downloadExcel(flabosReports, "flabos_reports.xlsx")}
      >
        Download Excel
      </a>
      <table className="table table-hover table-striped table-sm mt-3">
        <thead className="table">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>UnqId</th>
            <th>Phone Number</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Placed City</th>
            <th>Placed Company</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flabosReports.map((flabo) => (
            <tr key={flabo.id}>
              <td>{flabo.id}</td>
              <td>
                {isEditing && currentEdit && currentEdit.id === flabo.id ? (
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-sm"
                    value={currentEdit.name}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  flabo.name
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === flabo.id ? (
                  <input
                    type="text"
                    name="unqId"
                    className="form-control form-control-sm"
                    value={currentEdit.unqId}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  flabo.unqId
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === flabo.id ? (
                  <input
                    type="text"
                    name="phoneNumber"
                    className="form-control form-control-sm"
                    value={currentEdit.phoneNumber}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  flabo.phoneNumber
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === flabo.id ? (
                  <input
                    type="text"
                    name="age"
                    className="form-control form-control-sm"
                    value={currentEdit.age}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  flabo.age
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === flabo.id ? (
                  <input
                    type="text"
                    name="gender"
                    className="form-control form-control-sm"
                    value={currentEdit.gender}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  flabo.gender
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === flabo.id ? (
                  <input
                    type="text"
                    name="placedCity"
                    className="form-control form-control-sm"
                    value={currentEdit.placedCity}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  flabo.placedCity
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === flabo.id ? (
                  <input
                    type="text"
                    name="placedCompany"
                    className="form-control form-control-sm"
                    value={currentEdit.placedCompany}
                    onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                  />
                ) : (
                  flabo.placedCompany
                )}
              </td>
              <td>
                {isEditing && currentEdit && currentEdit.id === flabo.id ? (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={saveEdit}
                  >
                    Save
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-outline-warning btn-sm mx-1"
                      onClick={() => handleEdit(flabo)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(flabo.id)}
                    >
                      Delete
                    </button>
                  </>
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

export default GetPhlebos;
