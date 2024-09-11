/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { api_url } from "../../../../apiLink";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
} from "react-icons/bs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    samplesCollected: 0,
    samplesPending: 0,
  });

  const [filters, setFilters] = useState({
    city: "",
    companyName: "",
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [companyNameOptions, setCompanyNameOptions] = useState([]);
  const [showCityOptions, setShowCityOptions] = useState(false);
  const [showCompanyNameOptions, setShowCompanyNameOptions] = useState(false);

  const cityInputRef = useRef(null);
  const companyInputRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "city") {
      fetchCityOptions(value);
      setShowCityOptions(true);
    } else if (name === "companyName") {
      fetchCompanyNameOptions(value);
      setShowCompanyNameOptions(true);
    }
  };

  const handleFilter = () => {
    fetchDashboardData(filters.city, filters.companyName);
  };

  const handleClear = () => {
    setFilters({
      city: "",
      companyName: "",
    });
    fetchDashboardData();
  };

  const fetchDashboardData = (city, companyName) => {
    axios
      .get(`${api_url}/api/users/dashboard-data`, {
        params: { city, companyName },
      })
      .then((response) => {
        setDashboardData(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the dashboard data!", error);
      });
  };

  const fetchCityOptions = (query) => {
    axios
      .get(`${api_url}/api/users/city-options`, {
        params: { query },
      })
      .then((response) => {
        setCityOptions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching city options:", error);
      });
  };

  const fetchCompanyNameOptions = (query) => {
    axios
      .get(`${api_url}/api/users/company-name-options`, {
        params: { query },
      })
      .then((response) => {
        setCompanyNameOptions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching company name options:", error);
      });
  };

  const handleCityOptionClick = (name) => {
    setFilters((prev) => ({ ...prev, city: name }));
    setShowCityOptions(false);
  };

  const handleCompanyNameOptionClick = (name) => {
    setFilters((prev) => ({ ...prev, companyName: name }));
    setShowCompanyNameOptions(false);
  };

  const handleClickOutside = (e) => {
    if (
      cityInputRef.current &&
      !cityInputRef.current.contains(e.target) &&
      showCityOptions
    ) {
      setShowCityOptions(false);
    }
    if (
      companyInputRef.current &&
      !companyInputRef.current.contains(e.target) &&
      showCompanyNameOptions
    ) {
      setShowCompanyNameOptions(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCityOptions, showCompanyNameOptions]);

  const handleCityInputFocus = () => {
    fetchCityOptions(filters.city);
    setShowCityOptions(true);
  };

  const handleCompanyNameInputFocus = () => {
    fetchCompanyNameOptions(filters.companyName);
    setShowCompanyNameOptions(true);
  };

  const data = [
    {
      name: "Samples",
      Collected: dashboardData.samplesCollected,
      Pending: dashboardData.samplesPending,
    },
  ];

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>DASHBOARD</h3>
      </div>
      <div className="row mb-3">
        <div className="col-12 col-md-5 mx-0 mb-1 position-relative">
          <input
            ref={cityInputRef}
            type="text"
            className="form-control"
            placeholder="City"
            name="city"
            value={filters.city}
            onChange={handleInputChange}
            onFocus={handleCityInputFocus}
          />
          {showCityOptions && cityOptions.length > 0 && (
            <ul className="list-group position-absolute w-100 autocomplete-options">
              {cityOptions.map((option) => (
                <li
                  key={option.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleCityOptionClick(option.name)}
                >
                  {option.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-12 col-md-5 mx-0 position-relative">
          <input
            ref={companyInputRef}
            type="text"
            className="form-control"
            placeholder="Company Name"
            name="companyName"
            value={filters.companyName}
            onChange={handleInputChange}
            onFocus={handleCompanyNameInputFocus}
          />
          {showCompanyNameOptions && companyNameOptions.length > 0 && (
            <ul className="list-group position-absolute w-100 autocomplete-options">
              {companyNameOptions.map((option) => (
                <li
                  key={option.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleCompanyNameOptionClick(option.name)}
                >
                  {option.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-5 mx-0 mb-1">
          <button className="btn btn-outline-dark w-100" onClick={handleFilter}>
            Search
          </button>
        </div>
        <div className="col-12 col-md-5 mx-0">
          <button className="btn btn-outline-dark w-100" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>
      <div className="main-cards">
        <div className="card ">
          <div className="card-inner">
            <h4>Total Users</h4>
            <BsFillArchiveFill className="card_icon" />
          </div>
          <h1>{dashboardData.totalUsers}</h1>
        </div>
        <div className="card">
          <div className="card-inner">
            <h4>Samples Collected</h4>
            <BsFillGrid3X3GapFill className="card_icon" />
          </div>
          <h1>{dashboardData.samplesCollected}</h1>
        </div>
        <div className="card">
          <div className="card-inner">
            <h4>Samples Pending</h4>
            <BsPeopleFill className="card_icon" />
          </div>
          <h1>{dashboardData.samplesPending}</h1>
        </div>
      </div>

      <div className="charts">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Collected" fill="#82ca9d" />
            <Bar dataKey="Pending" fill="#FFBFA9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
};

export default Dashboard;
