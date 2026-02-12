const installer = require('electron-installer-windows');
const path = require('path');

const options = {
  src: 'dist_final/PharmaCloud-Final-win32-x64',
  dest: 'dist_installer_new',
};

async function main() {
  console.log('Creating installer...');
  try {
    await installer(options);
    console.log('Successfully created installer at ' + options.dest);
  } catch (err) {
    console.error('Error creating installer:', err.stack || err);
    process.exit(1);
  }
}

main();
