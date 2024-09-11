/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// userSide\src\components\UserDetailsPageComponents\UserDetails.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api_url } from "../../../apiLink";

const UserDetails = ({
  phoneNumber,
  userData,
  packages,
  city,
  companyName,
}) => {
  const [employeeId, setEmployeeId] = useState("");
  const [isValidEmployee, setIsValidEmployee] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [patientName, setPatientName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [selectedSubPackage, setSelectedSubPackage] = useState("");
  const [subPackages, setSubPackages] = useState([]);
  const [bookingId, setBookingId] = useState("");
  const navigate = useNavigate();


  const handleConfirmClick = async () => {
    try {
      const response = await axios.get(
        `${api_url}/api/verify-employee?employeeId=${employeeId}`
      );

      if (response.data.isValid) {
        const userResponse = await axios.get(
          `${api_url}/api/get-user-by-employee-id?employeeId=${employeeId}`
        );

        if (userResponse.data) {
          const userData = userResponse.data;
          setPatientName(userData.patientName);
          setEmail(userData.email);
          setAge(userData.age);
          setSelectedGender(userData.gender);
          setSelectedPackage(userData.package);
          if (userData.package) {
            try {
              const subPackageResponse = await axios.get(
                `${api_url}/api/subpackages/${userData.package}`
              );
              setSubPackages(subPackageResponse.data);
              setSelectedSubPackage(userData.subPackage);
            } catch (error) {
              console.error("Error fetching subpackages:", error);
            }
          }
          setIsValidEmployee(true);
          handlePackageChange(userData.package);
        } else {
          setIsValidEmployee(true);
          setPatientName(response.data.name);
        }
      } else {
        setModalMessage(
          "Dear Employee, you are not eligible for the camp. Please contact your HR for further information."
        );
        const myModal = new window.bootstrap.Modal(
          document.getElementById("myModal")
        );
        myModal.show();
      }
    } catch (error) {
      console.error("Error validating employee ID:", error);
    }
  };

  const getPackageAndSubPackageName = async (packageId, subPackageId) => {
    try {
      const packageResponse = await axios.get(
        `${api_url}/api/packages/find/${packageId}`
      );
      const subPackageResponse = await axios.get(
        `${api_url}/api/subpackages/find/${subPackageId}`
      );

      const packageName = packageResponse.data.packageName;
      const subPackageName = subPackageResponse.data.subPackageName;

      return { packageName, subPackageName };
    } catch (error) {
      console.error("Error fetching package/subpackage names:", error);
      return { packageName: "", subPackageName: "" };
    }
  };
  const handleNextClick = async () => {
    if (
      patientName.trim() === "" ||
      employeeId.trim() === "" ||
      email.trim() === "" ||
      age.toString().trim() === "" ||
      selectedGender.trim() === "" ||
      selectedPackage.trim() === "" ||
      selectedSubPackage.trim() === ""
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (!isValidEmployee) {
      alert("Invalid Employee ID. Please enter a valid Employee ID.");
      return;
    }

    const timestamp = Date.now();
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear().toString().slice(-2);
    const newBookingId = `${employeeId}${day.toString().padStart(2, "0")}${month
      .toString()
      .padStart(2, "0")}${year}`;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (isNaN(age) || parseInt(age) <= 0) {
      alert("Please enter a valid age.");
      return;
    }

    const { packageName, subPackageName } = await getPackageAndSubPackageName(
      selectedPackage,
      selectedSubPackage
    );

    const dataToSend = {
      phoneNumber,
      patientName,
      employeeId,
      email,
      age,
      gender: selectedGender,
      package: selectedPackage,
      subPackage: selectedSubPackage,
      bookingId: newBookingId,
      city,
      companyName,
    };
    try {
      const response = await axios.post(
        `${api_url}/api/user/update`,
        dataToSend
      );

      const updatedUserData = response.data;
      navigate("/reports", {
        state: {
          userId: updatedUserData.userId,
          patientName,
          phoneNumber,
          bookingId: newBookingId,
          selectedPackage: packageName,
          selectedSubPackage: subPackageName,
        },
      });
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handlePackageChange = async (packageId) => {
    setSelectedPackage(packageId);  
    if (packageId) {
      try {
        const response = await axios.get(
          `${api_url}/api/subpackages/${packageId}`
        );
        setSubPackages(response.data);
      } catch (error) {
        console.error("Error fetching subpackages:", error);
      }
    } else {
      setSubPackages([]);
    }
  };

  const handleSubPackageChange = (subPackageId) => {
    setSelectedSubPackage(subPackageId);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form style={{ padding: "40px", width: "400px" }}>
        <div className="form-group">
          <label
            htmlFor="formGroupExampleInput"
            style={{
              fontWeight: "700",
              position: "absolute",
              marginLeft: "15px",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              transition: "all 0.3s ease",
            }}
          >
            YOUR DETAILS
          </label>
          <input
            type="number"
            className="form-control"
            id="formGroupExampleInput"
            placeholder={phoneNumber}
            readOnly
          />
        </div>
        <div className="form-group" style={{ marginTop: "30px" }}>
          <label
            htmlFor="formGroupExampleInput2"
            style={{ marginBottom: "20px", fontWeight: "600" }}
          >
            EMPLOYEE INFORMATION
          </label>
          <br />
          <span style={{ color: "#1B9DF5" }}>
            Employee ID<span style={{ color: "red" }}>*</span> :
          </span>
          <input
            type="number"
            className="form-control"
            id="formGroupExampleInput2"
            style={{
              marginTop: "10px",
              marginBottom: "15px",
              borderWidth: "3px",
            }}
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{
              width: "100%",
              marginTop: "10px",
              backgroundColor: "#1B9DF5",
              borderColor: "#1B9DF5",
            }}
            onClick={handleConfirmClick}
          >
            Confirm
          </button>
        </div>
        {isValidEmployee && (
          <>
            <div className="form-group" style={{ marginTop: "30px" }}>
              <label
                htmlFor="formGroupExampleInput2"
                style={{ marginBottom: "20px", fontWeight: "600" }}
              >
                EMPLOYEE DETAILS
              </label>
              <br />
              <span style={{ color: "#1B9DF5" }}>
                Name<span style={{ color: "red" }}>*</span> :
              </span>
              <input
                type="text"
                className="form-control"
                id="formGroupExampleInput2"
                style={{
                  marginTop: "10px",
                  marginBottom: "15px",
                  borderWidth: "3px",
                }}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
              <span style={{ color: "#1B9DF5" }}>
                Email<span style={{ color: "red" }}>*</span> :
              </span>
              <input
                type="email"
                className="form-control"
                id="formGroupExampleInput2"
                style={{
                  marginTop: "10px",
                  marginBottom: "15px",
                  borderWidth: "3px",
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span style={{ color: "#1B9DF5" }}>
                Age<span style={{ color: "red" }}>*</span> :
              </span>
              <input
                type="number"
                className="form-control"
                id="formGroupExampleInput2"
                style={{
                  marginTop: "10px",
                  marginBottom: "15px",
                  borderWidth: "3px",
                }}
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <span style={{ color: "#1B9DF5" }}>
                Gender<span style={{ color: "red" }}>*</span> :
              </span>
              <select
                className="form-control"
                style={{
                  marginTop: "10px",
                  marginBottom: "15px",
                  borderWidth: "3px",
                }}
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <span style={{ color: "#1B9DF5" }}>
                Package<span style={{ color: "red" }}>*</span> :
              </span>
              <select
                className="form-control"
                style={{
                  marginTop: "10px",
                  marginBottom: "15px",
                  borderWidth: "3px",
                }}
                value={selectedPackage}
                onChange={(e) => handlePackageChange(e.target.value)}
              >
                <option value="">Select Package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.packageName}
                  </option>
                ))}
              </select>
              <span style={{ color: "#1B9DF5" }}>
                Sub Package<span style={{ color: "red" }}>*</span> :
              </span>
              <select
                className="form-control"
                style={{
                  marginTop: "10px",
                  marginBottom: "15px",
                  borderWidth: "3px",
                }}
                value={selectedSubPackage}
                onChange={(e) => handleSubPackageChange(e.target.value)}
                disabled={!selectedPackage}
              >
                <option value="">Select Sub Package</option>
                {subPackages.map((subPkg) => (
                  <option key={subPkg.id} value={subPkg.id}>
                    {subPkg.subPackageName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{
                width: "100%",
                marginTop: "30px",
                backgroundColor: "#1B9DF5",
                borderColor: "#1B9DF5",
              }}
              onClick={handleNextClick}
            >
              Next
            </button>
          </>
        )}

        <div
          className="modal fade"
          id="myModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Alert
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">{modalMessage}</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserDetails;
