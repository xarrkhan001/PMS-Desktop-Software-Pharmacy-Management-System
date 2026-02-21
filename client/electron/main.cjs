const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const isDev = !app.isPackaged;
let backendProcess = null;

function startServer() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'pms_database.sqlite');
  const logPath = path.join(userDataPath, 'backend.log');

  // Logs for debugging
  const log = (msg) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    console.log(msg);
  };

  log(`--- Starting MediCore Backend (isDev: ${isDev}) ---`);

  // Ensure database exists in AppData
  if (!fs.existsSync(dbPath)) {
    const seedDbPath = isDev
      ? path.join(__dirname, '../../server/prisma/dev.db')
      : path.join(process.resourcesPath, 'server', 'prisma', 'dev.db');

    if (fs.existsSync(seedDbPath)) {
      log(`Copying seed database from ${seedDbPath} to ${dbPath}`);
      fs.copyFileSync(seedDbPath, dbPath);
    } else {
      log(`WARNING: Seed database not found at ${seedDbPath}`);
    }
  }

  const databaseUrl = `file:${dbPath}`;

  let serverPath;
  let serverDir;

  if (isDev) {
    log('Running in Development: Skipping auto-start.');
    return;
  } else {
    // Production path logic
    serverDir = path.join(process.resourcesPath, 'server');
    serverPath = path.join(serverDir, 'dist', 'src', 'server.bundle.js');

    if (!fs.existsSync(serverPath)) {
      serverPath = path.join(serverDir, 'dist', 'src', 'server.js');
    }
  }

  if (fs.existsSync(serverPath)) {
    try {
      log(`Spawning server at: ${serverPath}`);
      log(`Server working directory: ${serverDir}`);

      // The key: Launch Electron as a Node process with explicit NODE_PATH
      const nodeModulesPath = path.join(serverDir, 'node_modules');
      const prismaEnginePath = path.join(nodeModulesPath, '.prisma', 'client', 'query_engine-windows.dll.node');
      log(`NODE_PATH: ${nodeModulesPath}`);
      log(`Prisma engine: ${prismaEnginePath} (exists: ${fs.existsSync(prismaEnginePath)})`);

      backendProcess = spawn(process.execPath, [serverPath], {
        env: {
          ...process.env,
          ELECTRON_RUN_AS_NODE: '1',
          NODE_PATH: nodeModulesPath,
          DATABASE_URL: databaseUrl,
          NODE_ENV: 'production',
          PORT: '5000',
          JWT_SECRET: 'medicore_secure_production_secret_2026',
          PRISMA_QUERY_ENGINE_LIBRARY: prismaEnginePath,
          PRISMA_CLI_QUERY_ENGINE_TYPE: 'library',
          PRISMA_CLIENT_ENGINE_TYPE: 'library'
        },
        cwd: serverDir,
        stdio: 'pipe'
      });

      const logStream = fs.createWriteStream(logPath, { flags: 'a' });
      backendProcess.stdout.pipe(logStream);
      backendProcess.stderr.pipe(logStream);

      backendProcess.on('error', (err) => {
        log(`CRITICAL PROCESS ERROR: ${err.message}`);
      });

      backendProcess.on('exit', (code) => {
        log(`Backend process exited with code ${code}`);
      });

      log('Backend spawned successfully using ELECTRON_RUN_AS_NODE');

    } catch (err) {
      log(`FAILED TO SPAWN: ${err.message}`);
    }
  } else {
    log(`CRITICAL: Server entry file not found at ${serverPath}`);
  }
}

function createWindow() {
  const iconPath = isDev
    ? path.join(__dirname, '../public/medicore_icon.ico')
    : path.join(__dirname, '../dist/medicore_icon.ico');

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined,
    title: 'MediCore PMS - Pharmacy Management System',
  });

  startServer();

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    win.loadFile(indexPath).catch(err => {
      console.error('UI Load Error:', err);
    });
  }

  win.setMenu(null);
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.medicore.pms');
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
