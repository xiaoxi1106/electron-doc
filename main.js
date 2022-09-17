const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const template = require("./src/menuTemplate");
const AppWindow = require("./src/AppWindow");

let mainWindow, settingsWindow;

app.on("ready", () => {
  // mainWindow = new BrowserWindow({
  //   width: 1024,
  //   height: 680,
  //   webPreferences: {
  //     nodeIntegration: true,
  //     // preload: path.join(__dirname, 'preload.js'),
  //     // webSecurity: false
  //   },
  // });
  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.on("error", (error) => {
    dialog.showErrorBox("Error", error === null ? "unknown" : error.stack);
  });
  autoUpdater.on(
    "update-available",
    () => {
      dialog.showMessageBox({
        type: "info",
        title: "应用有新版本",
        message: "发现新版本，是否现在更新？",
        buttons: ["是", "否"],
      });
    },
    (buttonIndex) => {
      if (buttonIndex == 0) {
        autoUpdater.downloadUpdate();
      }
    }
  );

  const mainWindowConfig = {
    width: 1024,
    height: 680,
  };
  // const ipcRenderer = window.ipcRenderer
  // ipcRenderer.on('message', (event, data) => {
  // console.log('message', data.msg)
  // })
  const urlLocation = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, ".build/index.html")}`;

  mainWindow = new AppWindow(mainWindowConfig, urlLocation);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on("open-settings-window", () => {
    const settingsWindowComfig = {
      width: 500,
      height: 400,
      parent: mainWindow,
    };

    const settingsLocation = `file://${path.join(
      __dirname,
      "./settings/settings.html"
    )}`;

    settingsWindow = new AppWindow(settingsWindowComfig, settingsLocation);

    settingsWindow.on("closed", () => {
      settingsWindow = null;
    });
  });

  const menuTempalte = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menuTempalte);

  // mainWindow.loadURL(urlLocation);
});
