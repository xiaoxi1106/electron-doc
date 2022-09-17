const { remote } = require("electron");
const Store = require("electron-store");

const settingStore = new Store({ name: "Settings" });

const $ = (id) => {
  return document.getElementById(id);
};

document.addEventListener("DOMContentLoaded", () => {
  let saveLocation = settingStore.get("savedFileLocation");
  if (saveLocation) {
    $("savedFileLocation").value = saveLocation;
  }
  $("select-new-location").addEventListener("click", () => {
    remote.dialog.showOpenDialog(
      {
        properties: ["openDirectory"],
        message: "请选择文件的存储路径",
      },
      (path) => {
        if (Array.isArray(path)) {
          $("savedFileLocation").value = path[0];
          saveLocation=path[0]
        }
      }
    );
  });
  $("settings-form").addEventListener("submit", () => {
    settingStore.set("savedFileLocation", saveLocation);
    remote.getCurrentWindow().close();
  });
});
