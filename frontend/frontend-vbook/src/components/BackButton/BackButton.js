import React from "react";
import { IoArrowBack } from "react-icons/io5";

function BackButton() {
  const handleBack = () => {
    window.history.back();
  };
  return (
    <div className="back-button">
      <button onClick={handleBack}>
        <IoArrowBack />
      </button>
    </div>
  );
}

export default BackButton;
