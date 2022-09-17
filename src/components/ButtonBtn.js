import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ButtonBtn = ({ text, colorClass, icon, onBtnClick }) => {
  return (
    <button
      type="button"
      className={`btn btn-block no-border ${colorClass} w-btn`}
      onClick={onBtnClick}
    >
      <FontAwesomeIcon className="icon-r" size="lg" icon={icon} />
      {text}
    </button>
  );
};

ButtonBtn.propTypes = {
  text: PropTypes.string,
  colorClass: PropTypes.string,
  icon: PropTypes.object.isRequired,
  onBtnClick: PropTypes.func,
};

ButtonBtn.defaultProps = {
  text: "新建",
};

export default ButtonBtn;
