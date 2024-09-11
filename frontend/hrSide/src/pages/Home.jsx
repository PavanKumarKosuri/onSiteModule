// hrSide\src\pages\Home.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { saveAs } from "file-saver";
import QRCode from "react-qr-code";
import checkMedLogo from "../assets/checkmed_newlogo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../components/Header.jsx";
import { api_url } from "../../apiLink.js";
import {qrCodeLink} from "../../qrCodeLink.js"

const Home = () => {
  const { companyName, city, uniqueKey } = useParams();
  const navigate = useNavigate();
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({ field1: "", field2: "" });
  const [file, setFile] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isQRReady, setIsQRReady] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [validHR, setValidHR] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const validateHR = async () => {
      try {
        const response = await axios.get(
          `${api_url}/api/validate-hr/${city}/${companyName}/${uniqueKey}`
        );
        if (response.status === 200) {
          setValidHR(true);
        }
      } catch (error) {
        navigate("/404");
      }
    };

    validateHR();
  }, [city, companyName, uniqueKey, navigate]);

  if (!validHR) {
    return null;
  }

  const handleProceed = () => {
    if (acceptedTerms) {
      setIsFormVisible(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Please accept the terms and conditions to proceed.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFormErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFormErrorMessage(
        "Please upload the employee's list in an excel file to proceed."
      );
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("formData", JSON.stringify(formData));

    try {
      setUploading(true);

      const response = await axios.post(
        `${api_url}/api/eligibleEmployees/upload`,
        data
      );
      if (response.status === 200) {
        setIsQRReady(true);
        setIsFormVisible(false);
        setFormErrorMessage("");
      } else {
        setFormErrorMessage("Error uploading file.");
      }
      setUploading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
      setFormErrorMessage("Error uploading file.");
    }
  };

   const qrCodeValue = `${qrCodeLink}/${encodeURIComponent(
    city
  )}/${encodeURIComponent(companyName)}/${encodeURIComponent(uniqueKey)}/`;

 const downloadQR = () => {
  const qrCodeContainer = document.querySelector(".qr-code-container");
  const svg = qrCodeContainer.querySelector("svg");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 400;
  canvas.height = 500;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  img.src = checkMedLogo;

  img.onload = () => {
    const logoWidth = canvas.width * 0.4;
    const aspectRatio = img.width / img.height;
    const logoHeight = logoWidth / aspectRatio;

    ctx.drawImage(
      img,
      (canvas.width - logoWidth) / 2,
      20,
      logoWidth,
      logoHeight
    );

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(`${companyName}, ${city}`, canvas.width / 2, 110);

    ctx.font = "16px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(
      "Please scan the below QR code to register/login",
      canvas.width / 2,
      150
    );

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img2 = new Image();

    img2.onload = () => {
      ctx.drawImage(img2, (canvas.width - 200) / 2, 180, 200, 200);
      URL.revokeObjectURL(url);

      ctx.font = "10px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      
      // text wrapping
      const text = `${qrCodeValue}`;
      const maxWidth = 380;
      const lineHeight = 12;
      let y = 410;
      const words = text.split("/");
      let line = "";

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + "/";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[n] + "/";
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);

      canvas.toBlob((blob) => {
        saveAs(blob, "qr_code.png");
      });
    };
    img2.src = url;
  };
};

  const handleBack = () => {
    setIsQRReady(false);
    setIsFormVisible(true);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center">
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <Header city={city} companyName={companyName} />
        <div className="mt-5">
          {!isFormVisible && !isQRReady && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">HR Registration</h5>
                <p className="card-text">Company Location: {city}</p>
                <p className="card-text">Company Name: {companyName}</p>
                <p className="card-text">
                  Please view the terms and conditions / consent to proceed{" "}
                  <a
                    style={{
                      color: "blue",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => setTermsModalVisible(true)}
                  >
                    T & C
                  </a>
                </p>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="acceptTerms"
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="acceptTerms">
                    I agree to the terms and conditions
                  </label>
                </div>
                <button className="btn btn-primary mt-3" onClick={handleProceed}>
                  Proceed
                </button>
                {errorMessage && (
                  <div className="alert alert-danger mt-3">{errorMessage}</div>
                )}
              </div>
            </div>
          )}

          {termsModalVisible && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Terms and Conditions</h5>
                  </div>
                  <div className="modal-body">
                    <ul style={{ marginTop: "10px", fontSize: "14px", lineHeight: "1.6" }}>
                        <li>Only employees listed by HR are eligible to participate in the medical camp.</li>
                        <li>All medical records and personal information collected during the camp will be kept confidential and used solely for medical purposes.</li>
                        <li>By registering for the camp, employees consent to the collection and use of their medical data for the purposes of the camp.</li>
                        <li>The camp includes various medical procedures such as blood collection, health screenings, and other diagnostic tests.</li>
                        <li>The medical camp is conducted following all applicable health and safety regulations.</li>
                        <li>In the event of a medical emergency, the camp's medical team will provide immediate care.</li>
                        <li>The company and medical staff are not liable for any adverse reactions or complications arising from the medical procedures performed during the camp.</li>
                        <li>The company reserves the right to cancel or reschedule the camp due to unforeseen circumstances.</li>
                        <li>Participants are encouraged to provide feedback on the medical camp.</li>
                        <li>The camp will be conducted in compliance with all relevant local, state, and federal laws.</li>
                    </ul>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setTermsModalVisible(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isFormVisible && (
  <div className="container mt-5 mb-5">
    <h2>HR Import</h2>
    <form onSubmit={handleSubmit}>
      {/* 
      <div className="mb-3">
        <label htmlFor="field1" className="form-label">
          Field 1
        </label>
        <input
          type="text"
          className="form-control"
          id="field1"
          name="field1"
          value={formData.field1}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="field2" className="form-label">
          Field 2
        </label>
        <input
          type="text"
          className="form-control"
          id="field2"
          name="field2"
          value={formData.field2}
          onChange={handleChange}
        />
      </div>
      */}
      <div className="mb-3">
        <label htmlFor="file" className="form-label">
          Upload Excel Sheet
        </label>
        <input
          type="file"
          className="form-control"
          id="file"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
      {uploading ? (
        <div className="alert alert-info mt-3">
          Uploading, please wait...
        </div>
      ) : (
        <>
          {formErrorMessage && (
            <div className="alert alert-danger mt-3">
              {formErrorMessage}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading}
          >
            Submit
          </button>
          <button
            type="button"
            className="btn btn-secondary mx-2"
            onClick={() => setIsFormVisible(false)}
          >
            Back
          </button>
        </>
      )}
    </form>
  </div>
)}
          {isQRReady && (
            <div>
              <div className="container mt-5 text-center">
                <h2>Generated QR Code</h2>
                <div className="qr-code-container my-4">
                  <QRCode
                    value={qrCodeValue}
                    size={200}
                    style={{ marginBottom: "13px" }}
                  />
                  <br />
                 <a
                  href={qrCodeValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1"
                  style={{
                    color: "black",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    display: "inline-block",
                    maxWidth: "100%",
                  }}
                >
                  {qrCodeValue}
                </a>
                </div>
                <div className="my-3">
                  <button className="btn btn-primary mx-2" onClick={downloadQR}>
                    Download QR Code
                  </button>
                  <button className="btn btn-secondary mx-2" onClick={handleBack}>
                    Back
                  </button>
                </div>
              </div>
              <ul style={{ marginTop: "60px", fontSize: "15px" }}>
                Note:
                <li>Please share this QR code or link with the employees for registration.</li>
                <li>It is recommended to take a note/screenshot of the QR code or link.</li>
                <li>Ensure the QR code is shared only with eligible employees to maintain confidentiality.</li>
                <li>Employees will use this QR code to register for the medical camp. They need to present it at the camp for verification.</li>
                <li>Make sure employees have access to the QR code/link and can easily retrieve it when needed.</li>
                <li>Employees should ensure they have successfully registered using the QR code before the camp date.</li>
                <li>For any queries/complaints, please reach out to the helpline center available at the top of this page.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
