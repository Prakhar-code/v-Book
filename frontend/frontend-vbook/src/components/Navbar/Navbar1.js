import React, { useState } from "react";
import "../../assets/styles/Navbar.css";
import vbook from "../../assets/images/Book 1.png";
import userIcon from "../../assets/icons/user_white.png";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // const handleDropdownItemClick = () => {
  //   // Handle dropdown item click
  //   setDropdownOpen(false);
  // };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <img src={vbook} alt="Logo" />
      </div>
    </nav>
  );
}

export default Navbar;
