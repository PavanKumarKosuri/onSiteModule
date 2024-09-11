/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// phlebo\src\components\Login\Option.jsx
import React from "react";
import SampleCollection from "./Options/SampleCollection";
import Settings from "./Options/Settings";
const Option = ({ selectedOption }) => {
  const renderComponent = () => {
    switch (selectedOption) {
      case "SampleCollection":
        return <SampleCollection />;
      case "Settings":
        return <Settings />;
      default:
        return <SampleCollection />;
    }
  };

  return <>{renderComponent()}</>;
};

export default Option;
