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

const GetPackages = () => {
  const [qrData, setQRData] = useState([]);
  const [activeTab] = useState("qr");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({
    searchCriteria: "city",
    searchText: "",
    city: "",
    companyName: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isFilterCollapseOpen, setIsFilterCollapseOpen] = useState(false);
  const [isAddCollapseOpen, setIsAddCollapseOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);

  useEffect(() => {
    fetchQRReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQRReports = async () => {
    try {
      const qrResponse = await axios.get(`${api_url}/api/generateqr/all`, {
        params: filters,
      });
      const qrData = await Promise.all(
        qrResponse.data.map(async (qr) => {
          const packageResponse = await axios.get(
            `${api_url}/api/packages/${qr.id}`
          );
          const packages = await Promise.all(
            packageResponse.data.map(async (pkg) => {
              const subpackageResponse = await axios.get(
                `${api_url}/api/subpackages/${pkg.id}`
              );
              return { ...pkg, subpackages: subpackageResponse.data };
            })
          );
          return { ...qr, packages };
        })
      );
      setQRData(qrData);
    } catch (error) {
      console.error("Error fetching QR reports:", error);
      setErrorMessage("Error fetching QR reports");
    }
  };

  const handleFilter = async () => {
    try {
      await fetchQRReports();
    } catch (error) {
      console.error(`Error fetching filtered ${activeTab} reports:`, error);
      setErrorMessage(error.response?.data?.error || "Error fetching data");
    }
  };

  const handleClearFilters = async () => {
    setFilters({
      searchCriteria: "city",
      searchText: "",
      city: "",
      companyName: "",
    });
    try {
      await fetchQRReports();
    } catch (error) {
      console.error("Error fetching all data:", error);
      setErrorMessage("Error fetching all data");
    }
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
      await axios.delete(`${api_url}/api/generateqr/${deleteId}`);
      fetchQRReports();
      setShowModal(false);
    } catch (error) {
      console.error(`Error deleting ${activeTab} entry:`, error);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
  };

  const saveQrEdit = async () => {
    try {
      const updatedQr = { ...currentEdit };
      await axios.put(`${api_url}/api/generateqr/${currentEdit.id}`, updatedQr);

      for (const pkg of currentEdit.packages) {
        await axios.put(`${api_url}/api/packages/${pkg.id}`, {
          packageName: pkg.packageName,
        });

        for (const subpkg of pkg.subpackages) {
          await axios.put(`${api_url}/api/subpackages/${subpkg.id}`, {
            subPackageName: subpkg.subPackageName,
          });
        }
      }

      setIsEditing(false);
      setCurrentEdit(null);
      fetchQRReports();
    } catch (error) {
      console.error("Error saving QR report edit:", error);
      setErrorMessage("Error saving QR report edit");
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
      <div className={`collapse ${isFilterCollapseOpen ? "show" : ""}`}>
        <div className="card card-body">
          <div className="row mb-3">
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
              <button className="btn btn-outline-dark mx-1" onClick={handleFilter}>
                Apply Filters
              </button>
              <button
                className="btn btn-outline-dark"
                onClick={handleClearFilters}
              >
                Clear Filters
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
        onClick={() => downloadExcel(qrData, "qr_reports.xlsx")}
      >
        Download Excel
      </a>
      <div className="table-responsive mt-3">
        <table className="table table-hover table-striped">
          <thead className="table">
            <tr>
              <th>ID</th>
              <th>City</th>
              <th>Company Name</th>
              <th>Packages & Sub-Packages</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {qrData.map((qr) => (
              <tr key={qr.id}>
                <td>{qr.id}</td>
                <td>
                  {isEditing && currentEdit && currentEdit.id === qr.id ? (
                    <input
                      type="text"
                      name="city"
                      value={currentEdit.city}
                      onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                    />
                  ) : (
                    qr.city
                  )}
                </td>
                <td>
                  {isEditing && currentEdit && currentEdit.id === qr.id ? (
                    <input
                      type="text"
                      name="companyName"
                      value={currentEdit.companyName}
                      onChange={(e) => handleEditInputChange(e, setCurrentEdit)}
                    />
                  ) : (
                    qr.companyName
                  )}
                </td>
                <td>
                  <table className="table table-bordered table-hover striped table-sm mb-0">
                    <tbody>
                      {qr.packages.map((pkg) => (
                        <React.Fragment key={pkg.id}>
                          <tr>
                            <td>
                              {isEditing &&
                              currentEdit &&
                              currentEdit.id === qr.id ? (
                                <input
                                  type="text"
                                  name="packageName"
                                  value={
                                    currentEdit.packages.find(
                                      (p) => p.id === pkg.id
                                    )?.packageName || ""
                                  }
                                  onChange={(e) =>
                                    handleEditInputChange(
                                      e,
                                      setCurrentEdit,
                                      pkg.id
                                    )
                                  }
                                />
                              ) : (
                                pkg.packageName
                              )}
                            </td>
                            <td>
                              <ul
                                className="list-unstyled"
                                style={{ paddingLeft: "20px" }}
                              >
                                {pkg.subpackages.map((subpkg) => (
                                  <li key={subpkg.id}>
                                    {isEditing &&
                                    currentEdit &&
                                    currentEdit.id === qr.id ? (
                                      <input
                                        type="text"
                                        name="subPackageName"
                                        value={
                                          currentEdit.packages
                                            .find((p) => p.id === pkg.id)
                                            ?.subpackages.find(
                                              (sp) => sp.id === subpkg.id
                                            )?.subPackageName || ""
                                        }
                                        onChange={(e) =>
                                          handleEditInputChange(
                                            e,
                                            setCurrentEdit,
                                            pkg.id,
                                            subpkg.id
                                          )
                                        }
                                      />
                                    ) : (
                                      subpkg.subPackageName
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td>
                  {isEditing && currentEdit && currentEdit.id === qr.id ? (
                    <button
                      className="btn btn-outline-primary"
                      onClick={saveQrEdit}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-outline-warning  btn-sm mx-1"
                        onClick={() => handleEdit(qr)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger  btn-sm my-1"
                        onClick={() => handleDelete(qr.id)}
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
      </div>
      <div
        className="modal fade"
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

export default GetPackages;
