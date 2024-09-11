/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { BsGrid1X2Fill, BsPeopleFill, BsFillGearFill } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { RiAiGenerate } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";
import { LuPanelLeftClose } from "react-icons/lu";
import checkMedLogo from "../../assets/checkmed_newlogo.png";
import { NavLink } from "react-router-dom";

const AdminDashboardSidebar = ({
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
          onClick={() => handleMenuClick("Dashboard")}
        >
          <NavLink to="/admin-dashboard">
            <BsGrid1X2Fill className="icon" /> Dashboard
          </NavLink>
        </li>
        <li
          className="sidebar-list-item"
          onClick={() => handleMenuClick("GenerateQR")}
        >
          <NavLink to="/admin-dashboard/generateqr">
            <RiAiGenerate className="icon" /> Set Packages
          </NavLink>
        </li>
        <li
          className="sidebar-list-item"
          onClick={() => handleMenuClick("Reports")}
        >
          <NavLink to="/admin-dashboard/reports">
            <TbReportAnalytics className="icon" /> Reports
          </NavLink>
        </li>
        <li
          className="sidebar-list-item"
          onClick={() => handleMenuClick("Registrations")}
        >
          <NavLink to="/admin-dashboard/registrations">
            <BsPeopleFill className="icon"  style={{marginTop:"-1px"}} /> Registrations
          </NavLink>
        </li>
        <li className="sidebar-list-item" onClick={handleLogout}>
          <div>
            <MdLogout className="icon" style={{marginTop:"-2px"}} /> LogOut
          </div>
        </li>
        <li
          className="sidebar-list-item"
          onClick={() => handleMenuClick("Settings")}
        >
          <NavLink to="/admin-dashboard/Settings">
            <BsFillGearFill className="icon" /> Settings
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default AdminDashboardSidebar;
