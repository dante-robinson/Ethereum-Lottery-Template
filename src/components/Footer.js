import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <div className="row-start-5 col-start-3 relative justify-self-end">
      <p>
        <a href="https://github.com/dante-robinson/Crypto-Lottery">
          Check out the source code on Github
        </a>
        <FontAwesomeIcon icon={faGithub} />
      </p>
    </div>
  );
};

export default Footer;
