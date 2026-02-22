const electronInstaller = require('electron-winstaller');
const path = require('path');

async function createInstaller() {
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: path.join(__dirname, 'dist_electron/win-unpacked'),
      outputDirectory: path.join(__dirname, 'dist_installer'),
      authors: 'MediCore Team',
      exe: 'MediCore PMS.exe',
      setupExe: 'MediCore-PMS-Setup.exe',
      noMsi: true,
    });
    console.log('Installer created successfully!');
  } catch (e) {
    console.log(`Error creating installer: ${e.message}`);
  }
}

createInstaller();
