/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import GetUsers from "./Reports/GetUsers";
import GetPackages from "./Reports/GetPackages";
import GetPhlebos from "./Reports/GetPhlebos";
import GetVendors from "./Reports/GetVendors";
import GetHrs from "./Reports/GetHrs";

const GetReports = () => {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className="container mt-3">
      <div className="main-title mb-3">
        <h3>REPORTS</h3>
      </div>
      <div className="d-flex flex-wrap mb-3">
        <button
          className={`btn ${
            activeTab === "user" ? "btn-secondary" : "btn-outline-dark"
          } mb-2 me-2`}
          onClick={() => setActiveTab("user")}
        >
          User Reports
        </button>
        <button
          className={`btn ${
            activeTab === "qr" ? "btn-secondary" : "btn-outline-dark"
          } mb-2 me-2`}
          onClick={() => setActiveTab("qr")}
        >
          QR/ Packages Reports
        </button>
        <button
          className={`btn ${
            activeTab === "flabos" ? "btn-secondary" : "btn-outline-dark"
          } mb-2 me-2`}
          onClick={() => setActiveTab("flabos")}
        >
          Flabo Reports
        </button>
        <button
          className={`btn ${
            activeTab === "vendors" ? "btn-secondary" : "btn-outline-dark"
          } mb-2 me-2`}
          onClick={() => setActiveTab("vendors")}
        >
          Vendor Reports
        </button>
        <button
          className={`btn ${
            activeTab === "hr" ? "btn-secondary" : "btn-outline-dark"
          } mb-2 me-2`}
          onClick={() => setActiveTab("hr")}
        >
          HR Reports
        </button>
      </div>
      {activeTab === "user" && <GetUsers />}
      {activeTab === "qr" && <GetPackages />}
      {activeTab === "flabos" && <GetPhlebos />}
      {activeTab === "vendors" && <GetVendors />}
      {activeTab === "hr" && <GetHrs />}
    </div>
  );
};

export default GetReports;
