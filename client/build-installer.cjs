const electronInstaller = require('electron-winstaller');
const path = require('path');

async function createInstaller() {
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: path.join(__dirname, 'dist_final/PharmaCloud-Final-win32-x64'),
      outputDirectory: path.join(__dirname, 'dist_installer'),
      authors: 'PharmaCloud Team',
      exe: 'PharmaCloud-Final.exe',
      setupExe: 'PharmaCloud-Setup.exe',
      noMsi: true,
    });
    console.log('Installer created successfully!');
  } catch (e) {
    console.log(`Error creating installer: ${e.message}`);
  }
}

createInstaller();
