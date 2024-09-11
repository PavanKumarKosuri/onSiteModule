/* eslint-disable no-unused-vars */
import { api_url } from "../../../../apiLink";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { TiDeleteOutline } from "react-icons/ti";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const GenerateQR = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [, setIsQRReady] = useState(false);
  const [city, setCity] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [packages, setPackages] = useState([
    { id: 1, value: "", subPackages: [{ id: 1, value: "" }] },
  ]);
  const [successMessage, setSuccessMessage] = useState("");
  const inputRef = useRef(null);
  const suggestionBoxRef = useRef(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCompanyNameChange = (event) => {
    setCompanyName(event.target.value);
  };

  const handleCityChange = async (event) => {
    const input = event.target.value;
    setCity(input);
    if (input.length > 2) {
      const apiKey = "e2458fe98d2c4bd1a8193ca60f0bb01d";
      try {
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json`,
          {
            params: {
              q: input,
              key: apiKey,
              countrycode: "IN",
              limit: 10,
            },
          }
        );
        const results = response.data.results;
        const filteredSuggestions = results
          .map((result) => {
            const cityComponent =
              result.components.city ||
              result.components.town ||
              result.components.village ||
              result.formatted;
            return cityComponent;
          })
          .filter((value, index, self) => self.indexOf(value) === index);
        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
    setSuggestions([]);
  };

  const handleNextClick = async () => {
    const filledPackages = packages.filter((pkg) => pkg.value !== "");

    if (city && companyName && filledPackages.length >= 2) {
      try {
        const response = await axios.post(`${api_url}/api/generateqr`, {
          city,
          companyName,
          packages: JSON.stringify(packages),
        });

        if (response.status === 200) {
          setIsQRReady(true);
          setSuccessMessage("Data uploaded successfully!");
          clearForm();
        }
      } catch (error) {
        console.error(
          "Error inserting data:",
          error.response || error.message || error
        );
        setFormError("An error occurred while inserting data.");
      }
    } else {
      setFormError(
        "Please fill in all required fields and provide at least two package names."
      );
    }
  };

  const clearForm = () => {
    setCity("");
    setCompanyName("");
    setPackages([{ id: 1, value: "", subPackages: [{ id: 1, value: "" }] }]);
    setTimeout(() => setSuccessMessage(""), 5000); // Clear the success message after 5 seconds
  };

  const handlePackageChange = (id, value) => {
    setPackages((prevPackages) => {
      return prevPackages.map((pkg) =>
        pkg.id === id ? { ...pkg, value: value } : pkg
      );
    });
  };

  const handleSubPackageChange = (packageId, subPackageId, value) => {
    setPackages((prevPackages) => {
      return prevPackages.map((pkg) => {
        if (pkg.id === packageId) {
          const updatedSubPackages = pkg.subPackages.map((subPkg) =>
            subPkg.id === subPackageId ? { ...subPkg, value: value } : subPkg
          );
          return { ...pkg, subPackages: updatedSubPackages };
        }
        return pkg;
      });
    });
  };

  const addPackageInput = () => {
    const newPackageId = packages.length + 1;
    if (newPackageId <= 4) {
      setPackages((prevPackages) => [
        ...prevPackages,
        { id: newPackageId, value: "", subPackages: [{ id: 1, value: "" }] },
      ]);
    }
  };

  const addSubPackageInput = (packageId) => {
    setPackages((prevPackages) => {
      return prevPackages.map((pkg) => {
        if (pkg.id === packageId && pkg.subPackages.length < 8) {
          const newSubPackageId = pkg.subPackages.length + 1;
          return {
            ...pkg,
            subPackages: [
              ...pkg.subPackages,
              { id: newSubPackageId, value: "" },
            ],
          };
        }
        return pkg;
      });
    });
  };

  const removePackageInput = (id) => {
    if (packages.length > 1) {
      setPackages((prevPackages) =>
        prevPackages.filter((pkg) => pkg.id !== id)
      );
    }
  };

  const removeSubPackageInput = (packageId, subPackageId) => {
    setPackages((prevPackages) => {
      return prevPackages.map((pkg) => {
        if (pkg.id === packageId && pkg.subPackages.length > 1) {
          const updatedSubPackages = pkg.subPackages.filter(
            (subPkg) => subPkg.id !== subPackageId
          );
          return { ...pkg, subPackages: updatedSubPackages };
        }
        return pkg;
      });
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length > 1) {
          const [header, ...rows] = json;
          const cityIndex = header.indexOf("City");
          const companyNameIndex = header.indexOf("CompanyName");
          const packageIndexes = [1, 2, 3, 4].map((i) =>
            header.indexOf(`Package${i}`)
          );
          const subPackageIndexes = [];
          for (let i = 1; i <= 4; i++) {
            for (let j = 1; j <= 8; j++) {
              subPackageIndexes.push(header.indexOf(`Package${i}Sub${j}`));
            }
          }

          const newCity = rows[0][cityIndex] || "";
          const newCompanyName = rows[0][companyNameIndex] || "";
          const newPackages = packageIndexes.map((pkgIndex, i) => {
            const pkgValue = rows[0][pkgIndex] || "";
            const subPackages = subPackageIndexes
              .slice(i * 8, (i + 1) * 8)
              .map((subPkgIndex) => ({
                id: (subPkgIndex % 8) + 1,
                value: rows[0][subPkgIndex] || "",
              }))
              .filter((subPkg) => subPkg.value !== "");
            return { id: i + 1, value: pkgValue, subPackages };
          });

          setCity(newCity);
          setCompanyName(newCompanyName);
          setPackages(newPackages.filter((pkg) => pkg.value !== ""));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const downloadTemplate = () => {
    const wsData = [
      ["City", "CompanyName", "Package1", "Package2", "Package3", "Package4"],
      ["", "", "", "", "", ""],
    ];
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 8; j++) {
        wsData[0].push(`Package${i}Sub${j}`);
        wsData[1].push("");
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "template.xlsx"
    );
  };

  return (
    <div className="app">
      <div className="container mt-3">
        <div className="main-title">
          <h3>CREATE PACKAGES</h3>
        </div>
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}
        <form className="form">
          <div className="form-group mt-2">
            <label htmlFor="city" style={{ marginBottom: "10px" }}>
              City
            </label>
            <input
              type="text"
              className="form-control"
              id="city"
              value={city}
              onChange={handleCityChange}
              placeholder="Enter city"
              required
            />
            {suggestions.length > 0 && (
              <ul ref={suggestionBoxRef} className="list-group">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="list-group-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group mt-2">
            <label htmlFor="companyName" style={{ marginBottom: "10px" }}>
              Company Name
            </label>
            <input
              type="text"
              className="form-control"
              id="companyName"
              value={companyName}
              onChange={handleCompanyNameChange}
              placeholder="Enter company name"
              required
            />
          </div>
          <div className="form-group mt-3">
            <label>Packages</label>
            <div className="d-flex flex-wrap">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="package-input-container mr-3 mb-3 mt-2"
                  style={{ marginRight: "20px" }}
                >
                  <input
                    type="text"
                    className="form-control"
                    value={pkg.value}
                    onChange={(e) =>
                      handlePackageChange(pkg.id, e.target.value)
                    }
                    placeholder={`Package ${pkg.id}`}
                    required
                  />
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: "15px" }}
                    onClick={() => removePackageInput(pkg.id)}
                  >
                    <TiDeleteOutline />
                  </button>
                  {pkg.subPackages.map((subPkg) => (
                    <div
                      key={subPkg.id}
                      className="sub-package-input-container"
                    >
                      <input
                        type="text"
                        className="form-control"
                        value={subPkg.value}
                        onChange={(e) =>
                          handleSubPackageChange(
                            pkg.id,
                            subPkg.id,
                            e.target.value
                          )
                        }
                        placeholder={`Package ${pkg.id} Sub ${subPkg.id}`}
                        required
                      />
                      <button
                        type="button"
                        className="btn"
                        style={{ fontSize: "15px" }}
                        onClick={() => removeSubPackageInput(pkg.id, subPkg.id)}
                      >
                        <TiDeleteOutline />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn"
                    onClick={() => addSubPackageInput(pkg.id)}
                  >
                    <FaPlus /> Add Sub Package
                  </button>
                </div>
              ))}
              <div className="package-input-container">
                <button
                  type="button"
                  className="btn"
                  style={{ marginTop: "10px" }}
                  onClick={addPackageInput}
                >
                  <FaPlus /> Add Package
                </button>
              </div>
            </div>
          </div>
          {formError && <div className="alert alert-danger">{formError}</div>}
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={handleNextClick}
          >
            Next
          </button>
        </form>
        <button className="btn btn-outline-dark" onClick={downloadTemplate}>
          Download Excel Template
        </button>
        <input
          type="file"
          className="form-control-file mt-5 mx-2"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};

export default GenerateQR;
