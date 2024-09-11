/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import labImage from "../../assets/bodyImage.png";
import { useNavigate } from "react-router-dom";

const Body = ({ phoneNumber, setPhoneNumber, onPhoneNumberSubmit, city, companyName, uniqueKey }) => {
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOTP] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const [errorMessage, setErrorMessage] = useState("");
  const otpInputs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  const api_key = "34042a44-c38b-11eb-8089-0200cd936042";
  const otp_template_name = "OTP Confirmation";

  const handleNextClick = () => {
    if (phoneNumber.length === 10) {
      setShowOTPInput(true);
      setTimer(30);
      setErrorMessage("");
      let url = `https://2factor.in/API/V1/${api_key}/SMS/${phoneNumber}/AUTOGEN/${otp_template_name}`;
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (data["Status"] == "Success") {
            setErrorMessage("OTP sent successfully");
          } else {
            setErrorMessage("Failed to send OTP. Please try again.");
          }
        })
        .catch((err) => {
          setErrorMessage("Error: " + err.message);
        });
    } else {
      setPhoneNumber("");
      setErrorMessage("Please enter a valid 10-digit phone number");
    }
  };

  const handleOTPChange = (e, index) => {
    const updatedOTP = [...otp];
    updatedOTP[index] = e.target.value;
    setOTP(updatedOTP);
    if (e.target.value !== "" && otpInputs.current[index + 1]) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace") {
      const updatedOTP = [...otp];
      if (index > 0 && updatedOTP[index] === "") {
        otpInputs.current[index - 1].focus();
      }
      updatedOTP[index] = "";
      setOTP(updatedOTP);
    }
  };

  const handleVerifyOTP = () => {
    const enteredOTP = otp.join("");
    let url = `https://2factor.in/API/V1/${api_key}/SMS/VERIFY3/${phoneNumber}/${enteredOTP}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data["Details"] == "OTP Matched") {
          onPhoneNumberSubmit(phoneNumber);
          navigate(`/user-details/${city}/${companyName}/${uniqueKey}`);
        } else {
          setErrorMessage("Invalid OTP. Please try again.");
          setOTP(new Array(6).fill(""));
          otpInputs.current[0].focus();
        }
      });
  };

  const handleResendOTP = () => {
    setTimer(30);
    setOTP(new Array(6).fill(""));
    otpInputs.current[0].focus();
    handleNextClick();
  };

  const formatTime = (time) => `00:${time.toString().padStart(2, "0")}`;

  return (
    <>
      <div className="card" style={{ width: "25rem", alignContent: "center" }}>
        <img src={labImage} alt="Lab" />
      </div>
      <div>
        <h2
          style={{
            width: "18rem",
            marginBottom: "20px",
            marginTop: "40px",
            marginLeft: "50px",
            color: "#1B9DF5",
          }}
        >
          Your first step to take charge of your health!
        </h2>
        <div className="input-container" style={{ marginLeft: "70px" }}>
          <span className="prefix" style={{ marginRight: "5px" }}>
            +91
          </span>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="XXXXXXXXXX"
            style={{ width: "10rem", borderRadius: "3px" }}
          />
        </div>
        <div style={{ marginLeft: "70px", color: "red" }}>{errorMessage}</div>
        <br />
        {!showOTPInput ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNextClick}
            style={{ marginLeft: "140px" }}
          >
            Next
          </button>
        ) : (
          <>
            <p style={{ marginLeft: "70px", color: "grey" }}>
              Enter OTP below:
            </p>
            <div className="otp-container" style={{ marginLeft: "60px" }}>
              {otp.map((value, index) => (
                <input
                  key={index}
                  type="number"
                  value={value}
                  maxLength={1}
                  onChange={(e) => handleOTPChange(e, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  ref={(input) => (otpInputs.current[index] = input)}
                  style={{
                    width: "2rem",
                    marginRight: "5px",
                    textAlign: "center",
                  }}
                />
              ))}
            </div>
            <br />
            {timer > 0 ? (
              <div style={{ marginLeft: "180px" }}>
                <p>Resend OTP in {formatTime(timer)}</p>
              </div>
            ) : (
              <div style={{ marginLeft: "180px" }}>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={handleResendOTP}
                >
                  Resend OTP
                </button>
              </div>
            )}
            <button
              to="/user-details"
              type="button"
              className="btn btn-primary"
              onClick={handleVerifyOTP}
              style={{ marginLeft: "120px" }}
            >
              Verify OTP
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Body;
