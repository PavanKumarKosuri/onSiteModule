/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { api_url } from "../../../../../apiLink";
import { handleInputChange, handleEditInputChange, handleAddInputChange, downloadExcel } from './commonFunctions';

const GetVendors = () => {
  const [vendorReports, setVendorReports] = useState([]);
  const [activeTab] = useState("vendors");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    phoneNumber: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isFilterCollapseOpen, setIsFilterCollapseOpen] = useState(false);
  const [isAddCollapseOpen, setIsAddCollapseOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [newEntryVendor, setNewEntryVendor] = useState({
    name: "",
    phoneNumber: "",
    otherDetails: "",
  });

  useEffect(() => {
    fetchVendorReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVendorReports = async () => {
    try {
      const response = await axios.get(`${api_url}/api/vendors-reports`, {
        params: filters,
      });

      if (response.data.length === 0) {
        setErrorMessage("No vendor reports found with the specified filter criteria");
      } else {
        setErrorMessage("");
      }
      setVendorReports(response.data);
    } catch (error) {
      console.error("Error fetching vendor reports:", error);
      setErrorMessage("Error fetching vendor reports");
    }
  };

  const handleFilter = async () => {
    try {
      await fetchVendorReports(); // Fetch based on the active tab and applied filters
    } catch (error) {
      console.error(`Error fetching filtered ${activeTab} reports:`, error);
      setErrorMessage(error.response?.data?.error || "Error fetching data"); // Display error toast
    }
  };

  const handleClearFilters = async () => {
    setFilters({
      name: "",
      phoneNumber: "",
    });
    try {
      await fetchVendorReports(); // Fetch all reports after clearing filters
    } catch (error) {
      console.error("Error fetching all data:", error);
      setErrorMessage("Error fetching all data"); // Display error toast
    }
  };

  const clearForm = () => {
    setNewEntryVendor({
      name: "",
      phoneNumber: "",
      otherDetails: "",
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
      await axios.delete(`${api_url}/api/vendors-reports/${deleteId}`);
      fetchVendorReports();
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
      const updatedVendor = { ...currentEdit };
      await axios.put(`${api_url}/api/vendors-reports/${currentEdit.id}`, updatedVendor);

      setIsEditing(false);
      setCurrentEdit(null);
      fetchVendorReports();
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  };

  const saveAdd = async () => {
    try {
      const requiredVendorFields = ["name", "phoneNumber", "otherDetails"];
      const isAnyVendorFieldEmpty = requiredVendorFields.some((field) => !newEntryVendor[field].trim());

      if (isAnyVendorFieldEmpty) {
        setErrorMessage("Please fill in all required fields.");
        return;
      }

      await axios.post(`${api_url}/api/vendors-reports`, newEntryVendor);
      setErrorMessage("");
      setIsAddCollapseOpen(false);
      clearForm();
      fetchVendorReports();
    } catch (error) {
      console.error(`Error adding new ${activeTab} report:`, error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          setErrorMessage(`Server responded with error: ${error.response.data.error || error.response.statusText}`);
        } else if (error.request) {
          setErrorMessage("No response received from the server. Please check your network connection.");
        } else {
          setErrorMessage("An error occurred while setting up the request. Please try again.");
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="container mt-3">
      <button className="btn btn-outline-dark mb-3" onClick={() => setIsFilterCollapseOpen(!isFilterCollapseOpen)}>
        Filter
      </button>
      <button className="btn btn-outline-dark mb-3 mx-2" onClick={() => setIsAddCollapseOpen(!isAddCollapseOpen)}>
        Add
      </button>
      <div className={`collapse ${isFilterCollapseOpen ? "show" : ""}`}>
        <div className="card card-body">
          <div className="row mb-3">
            <div className="col">
              <input type="text" className="form-control" placeholder="Name" name="name" value={filters.name || ""} onChange={(e) => handleInputChange(e, setFilters)} />
            </div>
            <div className="col">
              <input type="number" className="form-control" placeholder="Phone Number" name="phoneNumber" value={filters.phoneNumber || ""} onChange={(e) => handleInputChange(e, setFilters)} />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <button className="btn btn-outline-dark" onClick={handleFilter}>
                Apply Filters
              </button>
              <button className="btn btn-outline-dark ml-2" style={{ marginLeft: "10px" }} onClick={handleClearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`collapse ${isAddCollapseOpen ? "show" : ""} mt-3`}>
        <div className="card card-body">
          <form>
            {Object.keys(newEntryVendor).map((key) => (
              <div className="form-group" key={key}>
                <label>{key}</label>
                <input type="text" className="form-control" name={key} value={newEntryVendor[key]} onChange={(e) => handleAddInputChange(e, setNewEntryVendor)} />
              </div>
            ))}
          </form>

          <div className="row">
            <div className="col">
              <button className="btn btn-outline-dark mt-3" onClick={saveAdd}>
                Confirm Add
              </button>
              <button className="btn btn-outline-dark mt-3 ml-2" style={{ marginLeft: "10px" }} onClick={clearForm}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && <p className="text-danger">{errorMessage}</p>}
      <br />
      <a className="downloadLink" style={{ color: "black", cursor: "pointer" }} onClick={() => downloadExcel(vendorReports, "vendor_reports.xlsx")}>
        Download Excel
      </a>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Other Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendorReports.map((vendor) => (
            <tr key={vendor.id}>
              <td>{vendor.id}</td>
              <td>{isEditing && currentEdit && currentEdit.id === vendor.id ? <input type="text" name="name" value={currentEdit.name} onChange={(e) => handleEditInputChange(e, setCurrentEdit)} /> : vendor.name}</td>
              <td>{isEditing && currentEdit && currentEdit.id === vendor.id ? <input type="text" name="phoneNumber" value={currentEdit.phoneNumber} onChange={(e) => handleEditInputChange(e, setCurrentEdit)} /> : vendor.phoneNumber}</td>
              <td>{isEditing && currentEdit && currentEdit.id === vendor.id ? <input type="text" name="otherDetails" value={currentEdit.otherDetails} onChange={(e) => handleEditInputChange(e, setCurrentEdit)} /> : vendor.otherDetails}</td>
              <td>
                {isEditing && currentEdit && currentEdit.id === vendor.id ? (
                  <button className="btn btn-outline-primary" onClick={saveEdit}>
                    Save
                  </button>
                ) : (
                  <>
                    <button className="btn btn-outline-warning mr-2" onClick={() => handleEdit(vendor)}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger mx-1" onClick={() => handleDelete(vendor.id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="modal" tabIndex="-1" style={{ display: showModal ? "block" : "none" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Confirmation</h5>
              <button type="button" className="btn-close" onClick={handleCancelDelete} aria-label="Close"></button>
            </div>
            <div className="modal-body">Are you sure you want to delete this entry?</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetVendors;