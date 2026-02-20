const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
  const iconPath = path.join(__dirname, '../public/medicore_icon.svg');

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: nativeImage.createFromPath(iconPath),
    title: 'MediCore PMS - Pharmacy Management System',
  });

  // Load the app
  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  win.loadURL(startURL);

  if (isDev) {
    win.webContents.openDevTools();
  }

  // Remove default menu
  win.setMenu(null);
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
