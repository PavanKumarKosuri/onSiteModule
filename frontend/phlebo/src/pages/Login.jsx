/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import Header1 from "../components/shared/Header1.jsx";
import { api_url } from "../../apiLink.js";
import { BiLogIn } from "react-icons/bi";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineLockOpen } from "react-icons/md";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ onltLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${api_url}/api/lt/login`, {
        username,
        password,
      });

      if (response.status === 200) {
        onltLogin(true);
        localStorage.setItem("accessToken", response.data.accessToken);
        navigate("/lt");
      } else {
        displayMessage("Login failed. Please check your credentials.", "error");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      displayMessage("Login failed. Please try again later.", "error");
    }
  };

  const displayMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000); // Hide message after 5 seconds
  };

  return (
    <div
      className="container"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Header1 />
      <div
        className="body-container"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="form-signin px-5 py-5">
          <form>
            <div className="d-flex mx-3">
              <h1 className="h3 mb-2">Phlebo Login</h1>
              <BiLogIn
                className="mb-3"
                style={{ fontSize: "30px", marginTop: "5px" }}
              />
            </div>

            {message && (
              <div
                className={`alert ${
                  messageType === "success" ? "alert-success" : "alert-danger"
                } w-100 mb-3`}
                role="alert"
              >
                {message}
              </div>
            )}

            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="floatingInput"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor="floatingInput">
                <FaRegUser className="mx-2 mb-1" />
                <span>Username</span>
              </label>
            </div>
            <div className="form-floating mt-2">
              <input
                type="password"
                className="form-control"
                id="floatingPassword"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="floatingPassword">
                <MdOutlineLockOpen
                  className="mx-2 mb-1"
                  style={{ fontSize: "18px" }}
                />
                <span>Password</span>
              </label>
            </div>

            <button
              className="btn btn-outline-dark w-100 py-2 mt-3"
              type="button"
              onClick={handleLogin}
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
