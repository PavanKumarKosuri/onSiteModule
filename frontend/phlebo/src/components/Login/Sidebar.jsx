/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// phlebo\src\components\Login\Sidebar.jsx
import React from "react";
import {  BsFillGearFill } from "react-icons/bs";
import { PiEyedropperSampleFill } from "react-icons/pi";
import { MdLogout } from "react-icons/md";
import { LuPanelLeftClose } from "react-icons/lu";
import checkMedLogo from "../../assets/checkmed_newlogo.png";
import { NavLink } from "react-router-dom";

const LtSidebar = ({
  openSidebarToggle,
  OpenSidebar,
  handleMenuClick,
  handleLogout,
}) => {
  return (
    <aside
      id="sidebar"
      className={openSidebarToggle ? "sidebar-responsive" : ""}
    >
      <div className="sidebar-title">
        <div className="sidebar-brand">
          <img src={checkMedLogo} style={{ width: "140px" }} alt="" />
        </div>
        <span className="icon close_icon" onClick={OpenSidebar}>
          <LuPanelLeftClose />
        </span>
      </div>

      <ul className="sidebar-list">
        <li
          className="sidebar-list-item"
          onClick={() => handleMenuClick("SampleCollection")}
        >
          <NavLink to="/lt">
            <PiEyedropperSampleFill className="icon" /> Sample Collection
          </NavLink>
        </li>
        <li className="sidebar-list-item" onClick={handleLogout}>
          <div>
            <MdLogout className="icon" style={{ marginTop: "-2px" }} /> LogOut
          </div>
        </li>
        <li
          className="sidebar-list-item"
          onClick={() => handleMenuClick("Settings")}
        >
          <NavLink to="/lt/Settings">
            <BsFillGearFill className="icon" /> Settings
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default LtSidebar;
