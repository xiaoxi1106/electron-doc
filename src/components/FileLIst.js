import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import useKeyPress from "../hooks/useKeyPress";
import useContextMenu from '../hooks/useContextMenu'
import { getParentNode } from '../utils/helper'

const { remote } = window.require("electron");
const {Menu, MenuItem}=remote

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const [editStatus, setEditStatus] = useState(false);
  const [value, setValue] = useState("");
  let node = useRef(null);
  const entPress = useKeyPress(13);
  const escPress = useKeyPress(27);

  const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if(parentElement){
          onFileClick(parentElement.dataset.id)
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          const { id, title } = parentElement.dataset
          setEditStatus(id)
          setValue(title)
        }
      }
    },
    {
      label: '删除',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileDelete(parentElement.dataset.id)
        }
      }
    },
  ], '.file-list', [files])

  const closeSearch = (item) => {
    setEditStatus(false);
    setValue("");
    if(item.isNew){
        onFileDelete(item.id)
    }
  };

  useEffect(() => {
    const item = files.find((file) => file.id === editStatus);
    if (entPress && editStatus && value.trim()!=='') {
      onSaveEdit(item.id, value, item.isNew);
      setEditStatus(false);
      setValue("");
    }
    if (escPress && editStatus) {
      closeSearch();
    }
  });

  useEffect(()=>{
    const newFile=files.find(file=>file.isNew)
    if(newFile){
        setValue(newFile.title)
        setEditStatus(newFile.id)
    }
  }, [files])

  useEffect(() => {
    if (editStatus) {
      node.current.focus();
    }
  }, [editStatus]);

  return (
    <ul className="list-group list-group-flush file-list">
      {files.map((file) => (
        <li
          className="list-group-item bg-light row d-flex align-items-center file-item mx-0"
          key={file.id}
          data-id={file.id}
          data-title={file.title}
        >
          {(file.id !== editStatus && !file.isNew) ? (
            <>
              <span className="col-2">
                <FontAwesomeIcon size="lg" icon={faMarkdown} />
              </span>
              <span
                className="col-6 c-link"
                onClick={() => {
                  onFileClick(file.id);
                }}
              >
                {file.title}
              </span>
              <button
                type="button"
                className="icon-button col-2"
                onClick={() => {
                  setEditStatus(file.id);
                  setValue(file.title);
                }}
              >
                <FontAwesomeIcon title="编辑" size="lg" icon={faEdit} />
              </button>
              <button
                type="button"
                className="icon-button col-2"
                onClick={() => {
                  onFileDelete(file.id);
                }}
              >
                <FontAwesomeIcon title="删除" size="lg" icon={faTrash} />
              </button>
            </>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center">
                <input
                  className="form-control"
                  value={value}
                  ref={node}
                  placeholder='请输入文件名称'
                  onChange={(e) => setValue(e.target.value)}
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={()=>closeSearch(file)}
                >
                  <FontAwesomeIcon title="关闭" size="lg" icon={faTimes} />
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func,
};

export default FileList;
