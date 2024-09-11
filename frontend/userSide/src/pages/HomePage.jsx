/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Body from "../components/HomePageComponents/Body.jsx";
import Header from "../components/shared/Header.jsx";
import axios from "axios";
import { api_url } from "../../apiLink.js";

const HomePage = ({ onPhoneNumberSubmit }) => {
  const { city, companyName, uniqueKey } = useParams();
  const [phoneNumber, setPhoneNumber] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const validateUrl = async () => {
      try {
        const response = await axios.get(
          `${api_url}/api/validate-hr/${city}/${companyName}/${uniqueKey}`
        );
        if (response.status !== 200) {
          navigate("/404");
        }
      } catch (error) {
        console.error("Error validating URL:", error);
        navigate("/404");
      }
    };
    validateUrl();
  }, [city, companyName, uniqueKey, navigate]);

  return (
    <div
      className="container"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Header city={city} companyName={companyName} uniqueKey={uniqueKey} />
      <div
        className="body-container"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Body
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          onPhoneNumberSubmit={onPhoneNumberSubmit}
          city={city}
          companyName={companyName}
          uniqueKey={uniqueKey}
        />
      </div>
    </div>
  );
};

export default HomePage;
