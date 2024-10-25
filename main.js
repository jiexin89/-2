const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WindowManager = require('node-window-manager');
const robot = require('robotjs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Window management
let syncedWindows = [];
let isSync = false;

ipcMain.on('start-sync', () => {
  isSync = true;
  startWindowSync();
});

ipcMain.on('stop-sync', () => {
  isSync = false;
});

ipcMain.on('get-windows', () => {
  const windowManager = new WindowManager();
  const windows = windowManager.getWindows();
  mainWindow.webContents.send('window-list', windows.map(w => ({
    id: w.id,
    title: w.getTitle(),
    bounds: w.getBounds()
  })));
});

function startWindowSync() {
  if (!isSync) return;

  syncedWindows.forEach(window => {
    const sourceWindow = syncedWindows[0];
    if (window.id !== sourceWindow.id) {
      // Sync mouse position
      const mousePos = robot.getMousePos();
      robot.moveMouse(mousePos.x, mousePos.y);
      
      // Sync keyboard events
      robot.keyTap('a');
    }
  });

  setTimeout(startWindowSync, 16); // ~60fps
}