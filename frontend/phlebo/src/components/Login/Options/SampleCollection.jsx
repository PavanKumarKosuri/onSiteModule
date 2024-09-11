/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// phlebo\src\components\Login\Options\SampleCollection.jsx
import { api_url } from "../../../../apiLink";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";

const SampleCollection = () => {
  const [bookingId, setBookingId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [reportsTaken, setReportsTaken] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [otp, setOTP] = useState("");
  const [timer, setTimer] = useState(0);
  const [otpMessage, setOtpMessage] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const api_key = "34042a44-c38b-11eb-8089-0200cd936042";
  const otp_template_name = "SampleTaken_Confirmation";

  const handleBookingIdChange = (e) => {
    setBookingId(e.target.value);
  };

  const handleCollectButtonClick = async (bookingId) => {
    try {
      const response = await axios.get(
        `${api_url}/api/users/reports-taken/${bookingId}`
      );
      const data = response.data;
      setPatientName(data.patientName);
      setPhoneNumber(data.phoneNumber);
      setReportsTaken(data.reportsTaken === 1);
      setModalOpen(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setBookingMessage(
          "Booking ID not found. Please check the ID and try again."
        );
      } else {
        setBookingMessage("An error occurred while fetching user details.");
        console.error("Error details:", error);
      }
      setTimeout(() => setBookingMessage(""), 3000);
    }
  };

  useEffect(() => {
    let timerId;
    if (timer > 0) {
      timerId = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [timer]);

  const handleSendOTP = () => {
    setTimer(30);
    let url = `https://2factor.in/API/V1/${api_key}/SMS/${phoneNumber}/AUTOGEN/${otp_template_name}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.Status === "Success") {
          setOtpMessage("OTP sent successfully");
        } else {
          setOtpMessage("Failed to send OTP. Please try again.");
        }
        setTimeout(() => setOtpMessage(""), 3000);
      })
      .catch((err) => {
        setOtpMessage("Error: " + err.message);
        setTimeout(() => setOtpMessage(""), 3000);
      });
  };

  const handleVerifyOTP = () => {
    let url = `https://2factor.in/API/V1/${api_key}/SMS/VERIFY3/${phoneNumber}/${otp}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.Details === "OTP Matched") {
          handleCollectSample();
        } else {
          setOtpMessage("Invalid OTP. Please try again.");
          setOTP("");
          setTimeout(() => setOtpMessage(""), 3000);
        }
      });
  };

  const handleCollectSample = async () => {
    try {
      await fetch(`${api_url}/api/users/reports-taken/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ReportsTaken: true,
          additionalInfo: additionalInfo,
        }),
      });
      setReportsTaken(true);
      setModalOpen(false);
      setAdditionalInfo("");
    } catch (error) {
      console.error("Error updating reportsTaken status:", error);
    }
  };

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>Sample Collection</h3>
      </div>
      <div className="row mb-3">
        <div className="col-12 col-md-5 mx-0 mb-1 position-relative">
          <input
            type="text"
            className="form-control"
            placeholder="Booking ID"
            value={bookingId}
            onChange={handleBookingIdChange}
          />
          {bookingMessage && (
            <p className="text-danger mt-2">{bookingMessage}</p>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-md-5 mx-0 mb-1">
          <button
            className="btn btn-outline-dark w-100"
            onClick={() => handleCollectButtonClick(bookingId)}
          >
            Collect
          </button>
        </div>
      </div>
      <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Collect Sample</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Booking ID: {bookingId}</h4>
          <h4>
            Patient Name: <b>{patientName}</b>
          </h4>
          <hr />
          <h5
            style={{
              backgroundColor: reportsTaken ? "green" : "red",
              color: "white",
              padding: "10px",
              textAlign: "center",
            }}
          >
            {reportsTaken
              ? "Blood sample collected"
              : "Pending blood sample collection"}
          </h5>
          {!reportsTaken && (
            <>
              <button
                className="btn btn-primary w-100 mt-3"
                onClick={handleSendOTP}
              >
                Send OTP
              </button>
              {otpMessage && <p className="text-center mt-2">{otpMessage}</p>}
              <div className="mt-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter the OTP"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                />
              </div>
              <div className="mt-3">
                <p>
                  Type in the below box, for any important notes to be
                  considered for the blood sample
                </p>
                <input
                  type="text"
                  className="form-control mb-4"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
              </div>
            </>
          )}
          {reportsTaken && (
            <p className="mt-3">Blood sample already collected</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </button>
          {!reportsTaken && (
            <button className="btn btn-primary" onClick={handleVerifyOTP}>
              Mark as collected
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default SampleCollection;
