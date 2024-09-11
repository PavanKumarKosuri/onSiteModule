/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// userSide\src\pages\UserDetailsPage.jsx

import { api_url } from "../../apiLink.js";
import React, { useEffect, useState } from "react";
import UserDetails from "../components/UserDetailsPageComponents/UserDetails.jsx";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/shared/Header.jsx";

const UserDetailsPage = ({ phoneNumber, userData }) => {
  const { city, companyName } = useParams();
  const [generateqrId, setGenerateqrId] = useState(null);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchGenerateqrId = async () => {
      try {
        const response = await axios.get(`${api_url}/api/generateqr`, {
          params: { city, companyName },
        });
        if (response.data.length > 0) {
          setGenerateqrId(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching generateqrId:", error);
      }
    };

    fetchGenerateqrId();
  }, [city, companyName]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        if (generateqrId) {
          const response = await axios.get(
            `${api_url}/api/packages/${generateqrId}`
          );
          setPackages(response.data);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };

    fetchPackages();
  }, [generateqrId]);
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
        <UserDetails
          phoneNumber={phoneNumber}
          userData={userData}
          packages={packages}
          city={city}
          companyName={companyName}
        />
      </div>
    </div>
  );
};

export default UserDetailsPage;
