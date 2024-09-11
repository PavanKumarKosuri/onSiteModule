/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// labby-labs\frontEnd\src\components\ReportsPageComponents\Reports.jsx
import { api_url } from "../../../apiLink";
import React, { useState, useEffect } from "react";
import axios from "axios";

const Reports = ({
  userData,
  patientName,
  bookingId,
  selectedPackage,
  selectedSubPackage,
}) => {
  const [userId, setUserId] = useState(userData?.id || "");
  const [reportsTaken, setReportsTaken] = useState(false);
  const [timer, setTimer] = useState(30);
  const [timeSlot, setTimeSlot] = useState("");

  useEffect(() => {
    if (userData) {
      setUserId(userData.id || "");
      setReportsTaken(
        userData.reportsTaken === 1 ||
          userData.reportsTaken === true ||
          userData.reportsTaken === "1"
      );
      assignTimeSlot(userData.id);
    }
  }, [userData]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    axios
      .get(`${api_url}/api/users`)
      .then((response) => {
        // Handle the response here if needed
      })
      .catch((error) => {
        console.error("There was an error fetching the dashboard data!", error);
      });
  }, []);

  const formatTime = (time) => `00:${time.toString().padStart(2, "0")}`;

  const assignTimeSlot = async (userId) => {
    try {
      const response = await axios.put(
        `${api_url}/api/users/timeslot/${userId}`
      );
      setTimeSlot(response.data.timeSlot);
    } catch (error) {
      console.error("Error assigning time slot:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px",
      }}
    >
      <h4>
        Patient Name: <b>{patientName}</b>
      </h4>
      <hr />
      <h5
        style={{
          backgroundColor: reportsTaken ? "green" : "red",
          color: "white",
          width: "100%",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {reportsTaken
          ? "Blood sample collected"
          : "Pending blood sample collection"}
      </h5>
      <br />
      <h5
        style={{
          color: "purple",
          marginLeft: "00px",
          marginTop: "100px",
          fontSize: "15px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginRight: "20px",
            alignItems: "center",
          }}
        >
          <span style={{ color: "black" }}> Package selected : </span>
          {selectedPackage}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ color: "black" }}>SubPackage selected : </span>
          {selectedSubPackage}
        </div>
      </h5>
      <hr />
      <h4 style={{ color: "#ff2c2c", marginTop: "0px", fontSize: "30px" }}>
        Booking ID: {bookingId}
      </h4>
      <span style={{ color: "purple", marginTop: "0px", fontSize: "20px" }}>
        Your Time slot: {timeSlot}
      </span>

      {reportsTaken ? (
        <h5>Click below to view the progress of the test report</h5>
      ) : (
        ""
      )}

<ul style={{ marginTop: "80px", fontSize: "15px" }}>
  Note:
  <li>Show this booking ID to the lab technician available at the camp during your test in the time slot allocated to you.</li>
  <li>Please do not share this booking ID with anyone else to ensure your privacy and security.</li>
  <li>Arrive at the camp center on time for your allocated time slot to avoid delays.</li>
  <li>It is recommended to take a note or screenshot of the booking ID for your records.</li>
  <li>Bring a valid ID proof along with the booking ID for verification purposes.</li>
  <li>If you cannot attend the camp at the allocated time, please inform the helpline center as soon as possible to reschedule.</li>
  <li>Follow all safety and health guidelines provided at the camp for your protection and the protection of others.</li>
  <li>For any queries or complaints, please reach out to the helpline center using the contact information provided at the top of this page.</li>
</ul>
    </div>
  );
};

export default Reports;
