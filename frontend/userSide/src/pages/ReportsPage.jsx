/* eslint-disable react/prop-types */

import Header from "../components/shared/Header.jsx";
import Reports from "../components/ReportsPageComponents/Reports";
import ErrorBoundary from "../components/ReportsPageComponents/ErrorBoundary";
import { useLocation } from "react-router-dom";
const ReportsPage = ({ userData }) => {
  const location = useLocation();
  const {
    phoneNumber,
    userId,
    patientName,
    bookingId,
    selectedPackage,
    selectedSubPackage,
  } = location.state || {};
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
        <ErrorBoundary>
          <Reports
            phoneNumber={phoneNumber}
            userData={userData}
            userId={userId}
            patientName={patientName}
            bookingId={bookingId}
            selectedPackage={selectedPackage}
            selectedSubPackage={selectedSubPackage}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default ReportsPage;
