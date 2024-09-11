/* eslint-disable react/prop-types */
// phlebo\src\pages\Register.jsx
import { api_url } from "../../apiLink.js";
import React, { useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import Header2 from "../components/shared/Header2.jsx";

const Register = () => {
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
  const webcamRef = React.useRef(null);
  const handleTakePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData((prevFormData) => ({ ...prevFormData, photo: imageSrc }));
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

  return (
    <>
      <>
        <Header2 />
      </>
      <div className="container">
        <h2 className="px-5 py-2 mb-4" style={{ color: "purple" }}>
          PHLEBO REGISTRATION
        </h2>
        {message && (
          <div
            style={{ paddingLeft: "45px" }}
            className={
              message.includes("successful") ? "text-success" : "text-danger"
            }
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}
        <div className="form-signin px-5 py-4">
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
        </div>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Submission</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to submit your details?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmSubmit}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Register;
