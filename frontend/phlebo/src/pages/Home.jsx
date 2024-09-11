/* eslint-disable no-unused-vars */
// phlebo\src\pages\Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import checkMedLogo from "../assets/checkmed_newlogo.png";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  return (
    <div className="container text-center mt-5">
      <div className="row justify-content-center">
        <div className="col-md-3">
          <div
            className="card shadow"
            style={{ borderRadius: "0.5rem", border: "none" }}
          >
            <div className="card-body" style={{ padding: "2rem" }}>
              <img
                src={checkMedLogo}
                alt="checkMedLogo"
                style={{ width: "130px", cursor: "pointer" }}
              />
              <p
                className="card-text mb-4"
                style={{ fontSize: "1rem", color: "#6c757d", marginTop:"20px" }}
              >
                Please login or register to continue
              </p>
              <div className="d-grid">
                <Link to="/login" className="btn btn-outline-dark btn-lg mb-3">
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline-dark btn-lg">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
