/* eslint-disable react/prop-types */
// phlebo\src\components\shared\Header1.jsx
import checkMedLogo from "../../assets/checkmed_newlogo.png";
import { MdOutlineMailOutline } from "react-icons/md";
import { IoIosCall } from "react-icons/io";
const Header = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body">
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div className="container-fluid">
            <a
              className="navbar-brand"
              style={{
                color: "red",
                fontWeight: "900",
                fontFamily: "TimesNewRoman",
              }}
            >
              <img
                src={checkMedLogo}
                alt="checkMedLogo"
                style={{ width: "130px", cursor: "pointer" }}
              />
            </a>
          </div>
          <div
            className="container-fluid"
            style={{ color: "#6A8CB3", marginLeft: "50px", width: "450px" }}
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
        </div>
      </nav>
    </>
  );
};

export default Header;
