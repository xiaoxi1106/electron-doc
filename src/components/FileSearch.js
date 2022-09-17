import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import useKeyPress from "../hooks/useKeyPress";
import useIpcRenderer from "../hooks/useIpcRenderer";

const FileSearch = ({ title, onFileSearch }) => {
  const [inputActive, setInputActive] = useState(false);
  const [value, setValue] = useState("");
  const entPress = useKeyPress(13);
  const escPress = useKeyPress(27);
  let node = useRef(null);

  const closeSearch = (e) => {
    e.preventDefault();
    setInputActive(false);
    setValue("");
    onFileSearch("");
  };

  useEffect(() => {
    if (entPress && inputActive) {
      onFileSearch(value);
    }
    if (escPress && inputActive) {
      closeSearch();
    }
  });

  useEffect(() => {
    if (inputActive) {
      node.current.focus();
    }
  }, [inputActive]);
  useIpcRenderer({
    "search-file": () => {
      setInputActive(true);
    },
  });

  return (
    <div className="alert alert-primary mb-0">
      {!inputActive ? (
        <div className="d-flex justify-content-between align-items-center">
          <span>{title}</span>
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              setInputActive(true);
            }}
          >
            <FontAwesomeIcon title="搜索" size="lg" icon={faSearch} />
          </button>
        </div>
      ) : (
        <div className="d-flex justify-content-between align-items-center">
          <input
            className="form-control"
            value={value}
            ref={node}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="button" className="icon-button" onClick={closeSearch}>
            <FontAwesomeIcon title="关闭" size="lg" icon={faTimes} />
          </button>
        </div>
      )}
    </div>
  );
};

FileSearch.propTypes = {
  title: PropTypes.string,
  onFileSearch: PropTypes.func.isRequired,
};

FileSearch.defaultProps = {
  title: "我的云文档",
};

export default FileSearch;
