/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// phlebo\src\components\shared\Header2.jsx
import React, { useEffect } from "react";
import { BsJustify } from "react-icons/bs";
import { MdOutlineMailOutline } from "react-icons/md";
import { IoIosCall } from "react-icons/io";

const LtHeader = ({ OpenSidebar }) => {
  useEffect(() => {
    const popoverTriggerList = document.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );
    popoverTriggerList.forEach((popoverTriggerEl) => {
      new window.bootstrap.Popover(popoverTriggerEl);
    });
  }, []);
  return (
    <header className="header">
      <div className="menu-icon">
        <BsJustify className="icon" onClick={OpenSidebar} />
      </div>
      <div
        className="header-right"
        style={{ color: "#6A8CB3", marginLeft: "10px", width: "450px" }}
      >
        <span style={{ fontSize: "12px" }}>
          <MdOutlineMailOutline style={{ marginRight: "5px" }} />
          support@checkmed.in
        </span>
        <br />
        <span
          style={{
            fontSize: "12px",
          }}
        >
          <IoIosCall style={{ marginRight: "5px" }} />
          +91 9914256267
        </span>
      </div>
    </header>
  );
};

export default LtHeader;
