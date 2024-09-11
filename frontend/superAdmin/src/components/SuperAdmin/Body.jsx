/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import Dashboard from "./Options/Dashboard";
import GenerateQR from "./Options/GenerateQR";
import GetReports from "./Options/GetReports";
import Settings from "./Options/Settings";
import Registrations from "./Options/Registrations";
const AdminDashboardHome = ({
  onCityChange,
  onCompanyNameChange,
  selectedOption,
}) => {
  const renderComponent = () => {
    switch (selectedOption) {
      case "Dashboard":
        return <Dashboard />;
      case "GenerateQR":
        return (
          <GenerateQR
            onCityChange={onCityChange}
            onCompanyNameChange={onCompanyNameChange}
          />
        );
      case "Reports":
        return <GetReports />;
      case "Settings":
        return <Settings />;
      case "Registrations":
        return <Registrations />;
      default:
        return <Dashboard />;
    }
  };

  return <>{renderComponent()}</>;
};

export default AdminDashboardHome;
