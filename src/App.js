import React, { useState, useEffect } from "react";
import "./App.css";
import { faPlus, faFileImport } from "@fortawesome/free-solid-svg-icons";
import uuidv4 from "uuid/v4";
import SimpleMDE from "react-simplemde-editor";
import "bootstrap/dist/css/bootstrap.min.css";
import "easymde/dist/easymde.min.css";

import { flattenArr, objToArr } from "./utils/helper";
import fileHelper from "./utils/fileHelper";
import FileSearch from "./components/FileSearch";
import FileList from "./components/FileLIst";
import defaultFiles from "./utils/list";
import ButtonBtn from "./components/ButtonBtn";
import TabList from "./components/TabList";
import useIpcRenderer from "./hooks/useIpcRenderer";

const path = window.require("path");
const { remote, ipcRenderer } = window.require("electron");
const Store = window.require("electron-store");

const settingStore = new Store({ name: "Settings" });

const fileStore = new Store({ name: "Files Data" });

const saveToStore = (files) => {
  const storeObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createAt } = file;
    result[id] = {
      id,
      path,
      title,
      createAt,
    };
    return result;
  }, {});
  fileStore.set("files", storeObj);
};

function App() {
  // const ipcRenderer = window.ipcRenderer
  // ipcRenderer.on('message', (event, data) => {
  //   console.log('message', data.msg)
  // })
  const [files, setFiles] = useState(fileStore.get("files") || {});
  const [activeFileId, setActiveFileId] = useState("");
  const [opendFileIds, setOpendFileIds] = useState([]);
  const [unSaveFileIds, setUnSaveFileIds] = useState([]);
  const [searchedFiles, setSearchedFiles] = useState([]);
  const opendFiles = opendFileIds.map((id) => {
    return files[id];
  });
  const activeFiles = files[activeFileId];
  const fileBack = objToArr(files);
  const fileArr = searchedFiles.length > 0 ? searchedFiles : fileBack;
  const saveLocation = settingStore.get("savedFileLocation") || remote.app.getPath("documents");

  const fileClick = (fileId) => {
    setActiveFileId(fileId);
    const crrentFile = files[fileId];
    if (!crrentFile.isLoaded) {
      fileHelper.readFile(crrentFile.path).then((value) => {
        const newFile = { ...files[fileId], body: value, isLoaded: true };
        setFiles({ ...files, [fileId]: newFile });
      });
    }
    if (!opendFileIds.includes(fileId)) {
      setOpendFileIds([...opendFileIds, fileId]);
    }
  };

  const tabClick = (fileId) => {
    setActiveFileId(fileId);
  };

  const deleteId = (id) => {
    if (files[id].isNew) {
      const { [id]: value, ...afterFiles } = files;
      setFiles(afterFiles);
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        const { [id]: value, ...afterFiles } = files;
        setFiles(afterFiles);
        saveToStore(afterFiles);
        tabClose(id);
      });
    }
  };

  const tabClose = (id) => {
    const withoutIds = opendFileIds.filter((item) => item !== id);
    setOpendFileIds(withoutIds);
    if (opendFileIds.length > 1) {
      setActiveFileId(opendFileIds[0]);
    } else {
      setActiveFileId('');
    }
  };

  const fileChange = (id, value) => {
    if(value!==files[id].body){
      const newFiles = { ...files[id], body: value };
    setFiles({ ...files, [id]: newFiles });
    if (!unSaveFileIds.includes(id)) {
      setUnSaveFileIds([...unSaveFileIds, id]);
    }
    }
  };

  const upDateFileName = (id, title, isNew) => {
    const filePath = isNew
      ? path.join(saveLocation, `${title}.md`)
      : path.join(path.dirname(files[id].path), `${title}.md`);
    const modifidFile = { ...files[id], title, isNew: false, path: filePath };
    const newFiles = { ...files, [id]: modifidFile };

    if (isNew) {
      fileHelper.writeFile(filePath, files[id].body).then(() => {
        setFiles(newFiles);
        saveToStore(newFiles);
      });
    } else {
      const oldPath = files[id].path

      fileHelper.renameFile(oldPath, filePath).then(() => {
        setFiles(newFiles);
        saveToStore(newFiles);
      });
    }
  };

  const newSearch = (keyword) => {
    const newFile = fileBack.filter((file) => file.title.includes(keyword));
    setSearchedFiles(newFile);
  };

  const createFile = () => {
    const newId = uuidv4();
    const newFiles = {
      id: newId,
      title: "",
      body: "## 请输入MarkDown",
      createAt: new Date().getTime(),
      isNew: true,
    };
    setFiles({ ...files, [newId]: newFiles });
  };

  const currentFile = () => {
    fileHelper.writeFile(activeFiles.path, activeFiles.body).then(() => {
      console.log("ddddddd");
      setUnSaveFileIds(unSaveFileIds.filter((id) => id !== activeFiles.id));
    });
  };

  const importFiles = () => {
    remote.dialog.showOpenDialog(
      {
        title: "选择导入的 Markdown 文件",
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Markdown files", extensions: ["md"] }],
      },
      (paths) => {
        if (Array.isArray(paths)) {
          const fidPath = paths.filter((item) => {
            const alreadyFile = Object.values(files).find((file) => {
              return file.path === item;
            });
            return !alreadyFile;
          });
          const importArr = fidPath.map((pa) => {
            return {
              id: uuidv4(),
              title: path.basename(pa, path.extname(pa)),
              path: pa,
            };
          });
          const newFile = { ...files, ...flattenArr(importArr) };
          setFiles(newFile);
          saveToStore(newFile);
          if (importArr.length > 0) {
            remote.dialog.showMessageBox({
              type: "info",
              title: `导入成功`,
              message: `成功导入了${importArr.length}个文件`,
            });
          }
        }
      }
    );
  };

  useIpcRenderer({
    'create-new-file': createFile,
    'import-file': importFiles,
    'save-edit-file': currentFile,
    // 'file-downloaded': activeFileDownloaded,
    // 'files-uploaded': filesUploaded,
    // 'loading-status': (message, status) => { setLoading(status) }
  })

  return (
    <div className="App container-fluid px-0">
      <div className="row nos">
        <div className="col-4 nos bg-light left-panel">
          <FileSearch title="我的云文档" onFileSearch={newSearch} />
          <FileList
            files={fileArr}
            onFileClick={(id) => {
              fileClick(id);
            }}
            onFileDelete={deleteId}
            onSaveEdit={(id, newValue, isNew) => {
              upDateFileName(id, newValue, isNew);
            }}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <ButtonBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
                onBtnClick={createFile}
              />
            </div>
            <div className="col">
              <ButtonBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
                onBtnClick={importFiles}
              />
            </div>
          </div>
        </div>
        <div className="col-8 nos right-penel">
          {!activeFiles ? (
            <div className="start-page">请选择或者创建新的MarkDown文档</div>
          ) : (
            <>
              <TabList
                activeId={activeFileId}
                files={opendFiles}
                onTabClick={(id) => {
                  tabClick(id);
                }}
                unsaveIds={unSaveFileIds}
                onCloseTab={(id) => {
                  tabClose(id);
                }}
              />
              <SimpleMDE
                key={activeFiles && activeFiles.id}
                value={activeFiles && activeFiles.body}
                onChange={(value) => {
                  fileChange(activeFiles.id, value);
                }}
                options={{
                  minHeight: "515px",
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
