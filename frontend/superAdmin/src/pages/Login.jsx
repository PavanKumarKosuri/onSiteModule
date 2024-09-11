// labby-labs\frontEnd\src\components\AdminPage.jsx
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import Header from "../components/shared/Header.jsx";
import Login from "../components/Login/Login.jsx";

const AdminPage = ({ onAdminLogin }) => {
  return (
    <div
      className="container"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Header />
      <div
        className="body-container"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Login onAdminLogin={onAdminLogin} />
      </div>
    </div>
  );
};

export default AdminPage;
