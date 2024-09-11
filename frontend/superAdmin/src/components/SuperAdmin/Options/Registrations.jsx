/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import Webcam from "react-webcam";
import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import * as XLSX from "xlsx";
import axios from "axios";
import { api_url } from "../../../../apiLink";
import { Modal, Button } from "react-bootstrap";

const Registrations = () => {
  const [activeTab, setActiveTab] = useState("user");
  const [photo, setPhoto] = useState(null);
  const [hrData, setHrData] = useState([]);
  // const [existingData, setExistingData] = useState([]);
  const webcamRef = React.useRef(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [skippedData, setSkippedData] = useState([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [userData, setUserData] = useState({
    phoneNumber: "",
    patientName: "",
    employeeId: "",
    email: "",
    age: "",
    gender: "Male",
    package: "",
    subPackage: "",
    bookingId: "",
    reportsTaken: 0,
    additionalInfo: "",
    city: "",
    companyName: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    unqId: "",
    phoneNumber: "",
    age: "",
    gender: "",
    placedCity: "",
    placedCompany: "",
    photo: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [vendorData, setVendorData] = useState({
    id: "",
    name: "",
    phoneNumber: "",
    otherDetails: "",
  });

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${api_url}/api/vendors-reports`,
        vendorData
      );
      alert("Vendor registered successfully");
      setVendorData({ id: "", name: "", phoneNumber: "", otherDetails: "" });
    } catch (error) {
      console.error("Error registering vendor:", error);
      alert("Error registering vendor. Please try again.");
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowModal(false);
    try {
      const response = await axios.post(
        `${api_url}/api/flabo/register`,
        formData
      );
      if (response.status === 200) {
        setMessage(
          `<p>Registration successful, Contact the Administrator for Username and password.</p>`
        );
        setFormData({
          name: "",
          unqId: "",
          phoneNumber: "",
          age: "",
          gender: "",
          placedCity: "",
          placedCompany: "",
          photo: null,
        });
      } else {
        setMessage("<p>Registration failed</p>");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      if (error.response) {
        setMessage(
          `<p>Registration failed: ${
            error.response.data.error || "Server Error"
          }</p>`
        );
      } else if (error.request) {
        setMessage(
          "<p>No response received from server. Please check your connection.</p>"
        );
      } else {
        setMessage("<p>Registration failed. Please try again later.</p>");
      }
    }
  };

  const isFormValid = () => {
    return Object.values(formData).every(
      (field) => field !== "" && field !== null
    );
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleTakePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData((prevFormData) => ({ ...prevFormData, photo: imageSrc }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const hrDataWithKeys = json
        .map((row) => ({
          name: row["name"] || null,
          empid: row["employee id"] || null,
          phonenumber: row["phone"] || null,
          email: row["email id"] || null,
          city: row["city"] || null,
          companyname: row["company name"] || null,
        }))
        .filter(
          (row) =>
            row.empid &&
            row.email &&
            row.name &&
            row.phonenumber &&
            row.city &&
            row.companyname
        );

      if (hrDataWithKeys.length === 0) {
        alert("No valid data found in the uploaded file.");
        return;
      }

      try {
        const response = await axios.post(
          `${api_url}/api/hrimport/upload-excel`,
          { data: hrDataWithKeys }
        );

        const { processedData, skippedData, processedCount } = response.data;
        setProcessedCount(processedCount);
        setSkippedData(skippedData);

        setHrData(processedData);
        alert(
          `Data processed successfully! ${skippedData.length} entries were skipped due to duplicates.`
        );
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file. Please try again.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const getUniqueKey = async (empid, email, index) => {
    try {
      const response = await axios.get(
        `${api_url}/api/hrimport/get-unique-key`,
        {
          params: { empid, email },
        }
      );
      const updatedHrData = [...hrData];
      updatedHrData[index] = {
        ...updatedHrData[index],
        uniquekey: response.data.uniquekey,
      };
      setHrData(updatedHrData);
      return response.data.uniquekey;
    } catch (error) {
      console.error("Error fetching unique key:", error);
      return null;
    }
  };

  const fetchUniqueKeys = async () => {
    setIsLoadingKeys(true);
    const updatedHrData = await Promise.all(
      hrData.map(async (row, index) => {
        if (!row.uniquekey) {
          try {
            const uniquekey = await getUniqueKey(row.empid, row.email, index);
            return { ...row, uniquekey };
          } catch (error) {
            console.error("Error fetching unique key for row", index, error);
            alert(
              `Error fetching unique key for row ${
                index + 1
              }. Please check the data.`
            );
            return row;
          }
        }
        return row;
      })
    );
    setHrData(updatedHrData);
    setIsLoadingKeys(false);
  };

  useEffect(() => {
    if (activeTab === "hr" && hrData.length > 0 && !isLoadingKeys) {
      fetchUniqueKeys(hrData);
    }
  }, [activeTab, hrData, isLoadingKeys]);

  const tableRows = hrData.map((row, index) => (
    <tr key={index}>
      <td>{row.name}</td>
      <td>{row.empid}</td>
      <td>{row.phonenumber}</td>
      <td>{row.email}</td>
      <td>{row.city}</td>
      <td>{row.companyname}</td>
      <td>{row.uniquekey || "Loading..."}</td>
    </tr>
  ));

  const skippedTableRows = skippedData.map((row, index) => (
    <tr key={index}>
      <td>{row.name}</td>
      <td>{row.empid}</td>
      <td>{row.phonenumber}</td>
      <td>{row.email}</td>
      <td>{row.city}</td>
      <td>{row.companyname}</td>
      <td>{row.uniquekey}</td>
    </tr>
  ));
  const cleanedUserData = {
    ...userData,
    phoneNumber: userData.phoneNumber || "",
    patientName: userData.patientName || "",
    employeeId: userData.employeeId || "",
    email: userData.email || "",
    age: userData.age || "",
    gender: userData.gender || "Male",
    package: userData.package || "",
    subPackage: userData.subPackage || "",
    bookingId: userData.bookingId || "",
    reportsTaken: userData.reportsTaken || 1,
    additionalInfo: userData.additionalInfo || "",
    city: userData.city || "",
    companyName: userData.companyName || "",
  };
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${api_url}/api/users`,
        cleanedUserData
      );
      alert(
        `User registered successfully with time slot: ${response.data.timeSlot}`
      );
      setUserData({
        phoneNumber: "",
        patientName: "",
        employeeId: "",
        email: "",
        age: "",
        gender: "",
        package: "",
        subPackage: "",
        bookingId: "",
        reportsTaken: 1,
        additionalInfo: "",
        city: "",
        companyName: "",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error registering user. Please try again.");
    }
  };
  const handleSendLinks = async () => {
    try {
      for (const row of hrData) {
        const { name, phonenumber, city, companyname, uniquekey } = row;
        const link = `http://localhost:5176/#/hrpage/${city}/${companyname}/${uniquekey}`;
        const message = `Greetings from ChekMed, Hello ${name}, we are sending a unique link here click on that and upload employees list in an excel format to proceed with QR generation. ${link}`;

        await axios.post(
          "https://2factor.in/API/V1/{api_key}/ADDON_SERVICES/SEND/PSMS",
          {
            From: "CHKMED",
            To: phonenumber,
            Msg: message,
          }
        );
      }

      alert("Unique links sent successfully!");
    } catch (error) {
      console.error("Error sending links:", error);
      alert("Failed to send unique links. Please try again.");
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      ["name", "employee id", "phone", "email id", "city", "company name"],
      [
        "Example Name",
        "12345",
        "9876543210",
        "example@example.com",
        "City",
        "Company",
      ],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "hr_registration_template.xlsx");
  };

  return (
    <div className="container mt-3 ">
      <h3 className="main-title">REGISTRATIONS</h3>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "user" ? "active" : ""}`}
            onClick={() => handleTabClick("user")}
            style={{ color: "black" }}
          >
            User Registration
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "flabo" ? "active" : ""}`}
            onClick={() => handleTabClick("flabo")}
            style={{ color: "black" }}
          >
            Flabo Registration
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "vendor" ? "active" : ""}`}
            onClick={() => handleTabClick("vendor")}
            style={{ color: "black" }}
          >
            Vendor Registration
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "hr" ? "active" : ""}`}
            onClick={() => handleTabClick("hr")}
            style={{ color: "black" }}
          >
            HR Registration
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {activeTab === "hr" && (
          <div className="tab-pane fade show active">
            <form style={{ width: "350px" }}>
              <div className="mb-3">
                <label className="form-label">Upload Excel Sheet</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                />
              </div>
              <button
                className="btn btn-outline-dark mt-3"
                onClick={handleDownloadTemplate}
              >
                Download Template
              </button>
            </form>

            {hrData.length > 0 && (
              <>
                <Table className="mt-4" striped bordered hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Employee ID</th>
                      <th>Phone Number</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Company Name</th>
                      <th>Unique Key</th>
                    </tr>
                  </thead>
                  <tbody>{tableRows}</tbody>
                </Table>
                <button
                  className="btn btn-outline-dark mt-3"
                  onClick={handleSendLinks}
                >
                  Send Unique Links
                </button>
              </>
            )}

            {skippedData.length > 0 && (
              <>
                <h5>Skipped Entries</h5>
                <Table className="mt-4" striped bordered hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Employee ID</th>
                      <th>Phone Number</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Company Name</th>
                      <th>Unique Key</th>
                    </tr>
                  </thead>
                  <tbody>{skippedTableRows}</tbody>
                </Table>
                <button
                  className="btn btn-primary mt-3"
                  onClick={handleSendLinks}
                >
                  Resend Unique Links
                </button>
              </>
            )}
          </div>
        )}

        {activeTab === "user" && (
          <div className="tab-pane fade show active">
            <form className="row" onSubmit={handleUserSubmit}>
              <div className="col-3">
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.phoneNumber}
                    onChange={(e) =>
                      setUserData({ ...userData, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.employeeId}
                    onChange={(e) =>
                      setUserData({ ...userData, employeeId: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.patientName}
                    onChange={(e) =>
                      setUserData({ ...userData, patientName: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={userData.email}
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-control"
                    value={userData.age}
                    onChange={(e) =>
                      setUserData({ ...userData, age: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="col-3">
                <div className="mb-3">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    value={userData.gender}
                    onChange={(e) =>
                      setUserData({ ...userData, gender: e.target.value })
                    }
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Package</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.package}
                    onChange={(e) =>
                      setUserData({ ...userData, package: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Sub Package</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.subPackage}
                    onChange={(e) =>
                      setUserData({ ...userData, subPackage: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Booking ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.bookingId}
                    onChange={(e) =>
                      setUserData({ ...userData, bookingId: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Reports Taken</label>
                  <select
                    className="form-control"
                    value={userData.reportsTaken}
                    onChange={(e) =>
                      setUserData({ ...userData, reportsTaken: e.target.value })
                    }
                  >
                    <option>1</option>
                    <option>0</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Additional Info</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.additionalInfo}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        additionalInfo: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="col-3">
                <div className="mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.city}
                    onChange={(e) =>
                      setUserData({ ...userData, city: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userData.companyName}
                    onChange={(e) =>
                      setUserData({ ...userData, companyName: e.target.value })
                    }
                  />
                </div>
                <button type="submit" className="btn btn-outline-dark mt-3">
                  Register
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "flabo" && (
          <>
            {message && (
              <div
                style={{ paddingLeft: "45px" }}
                className={
                  message.includes("successful")
                    ? "text-success"
                    : "text-danger"
                }
                dangerouslySetInnerHTML={{ __html: message }}
              />
            )}
            <div className="tab-pane fade show active">
              <form className="row g-5" onSubmit={handleSubmit}>
                <div className="col-12 col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Unique ID</label>
                    <input
                      type="text"
                      className="form-control"
                      name="unqId"
                      value={formData.unqId}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="number"
                      className="form-control"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-control"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="placedCity"
                      value={formData.placedCity}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      className="form-control"
                      name="placedCompany"
                      value={formData.placedCompany}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Photo</label>
                    {formData.photo ? (
                      <div>
                        <img
                          src={formData.photo}
                          alt="Captured"
                          className="img-thumbnail"
                        />
                        <br />
                        <button
                          type="button"
                          className="btn btn-outline-dark mt-2"
                          onClick={() =>
                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              photo: null,
                            }))
                          }
                        >
                          Retake Photo
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="img-thumbnail"
                        />
                        <br />
                        <button
                          type="button"
                          className="btn btn-outline-dark mt-2"
                          onClick={handleTakePhoto}
                        >
                          Take Photo
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-outline-dark"
                    disabled={!isFormValid()}
                  >
                    Register
                  </button>
                </div>
              </form>
              <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Confirm Submission</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Are you sure you want to submit your details?
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleConfirmSubmit}>
                    Confirm
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </>
        )}

        {activeTab === "vendor" && (
          <div className="tab-pane fade show active">
            <form style={{ width: "350px" }} onSubmit={handleVendorSubmit}>
              <div className="mb-3">
                <label className="form-label">ID</label>
                <input
                  type="text"
                  className="form-control"
                  name="id"
                  value={vendorData.id}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, id: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={vendorData.name}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="phoneNumber"
                  value={vendorData.phoneNumber}
                  onChange={(e) =>
                    setVendorData({
                      ...vendorData,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Other Details</label>
                <input
                  type="text"
                  className="form-control"
                  name="otherDetails"
                  value={vendorData.otherDetails}
                  onChange={(e) =>
                    setVendorData({
                      ...vendorData,
                      otherDetails: e.target.value,
                    })
                  }
                />
              </div>
              <button type="submit" className="btn btn-outline-dark">
                Register
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registrations;
