const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const clientDir = path.join(rootDir, 'client');
const serverDir = path.join(rootDir, 'server');

function runCommand(command, cwd) {
    console.log(`\n🚀 Running: ${command} in ${cwd}...`);
    try {
        execSync(command, { cwd, stdio: 'inherit' });
    } catch (error) {
        console.error(`❌ Error executing command: ${command}`);
        process.exit(1);
    }
}

async function build() {
    process.env.CSC_SKIP_SIGNING = 'true';
    process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';

    console.log('--- MEDICORE PMS PRODUCTION BUILD SYSTEM ---');

    // 0. Cleanup old builds
    console.log('\n🧹 Step 0: Cleaning old build files...');
    const foldersToClean = [
        path.join(clientDir, 'dist'),
        path.join(clientDir, 'dist_electron')
    ];

    foldersToClean.forEach(folder => {
        if (fs.existsSync(folder)) {
            try {
                console.log(`   Removing: ${folder}`);
                fs.rmSync(folder, { recursive: true, force: true });
            } catch (e) {
                console.warn(`⚠️ Warning: Could not remove ${folder}. It might be locked by another process (like a running app). Please close any open MediCore windows or tasks.`);
            }
        }
    });

    // 1. Build Server
    console.log('\n📦 Step 1: Building Backend (Server)...');
    runCommand('npm install', serverDir);
    runCommand('npm run build', serverDir);
    runCommand('npx prisma generate', serverDir);
    runCommand('npx prisma db push --accept-data-loss', serverDir);

    // 🧹 IMPORTANT: Clean dev/test data from db before packaging
    // This ensures fresh installs don't come pre-loaded with development data
    console.log('\n🧹 Cleaning dev data from database (keeping only Super Admin)...');
    runCommand('node clean-db-for-build.js', serverDir);

    // Bundle backend for production with esbuild (single file)
    console.log('🔨 Bundling Backend into single file...');
    runCommand('npx esbuild src/server.ts --bundle --platform=node --target=node20 --outfile=dist/src/server.bundle.js --external:@prisma/client', serverDir);

    // 1.1 Cleanup Server node_modules to reduce size
    console.log('🧹 Optimizing Backend size...');
    runCommand('npm prune --production', serverDir);
    // Remove unwanted heavy folders if they exist
    const heavyFolders = ['node_modules/.cache', 'node_modules/typescript', 'node_modules/ts-node'];
    heavyFolders.forEach(folder => {
        const p = path.join(serverDir, folder);
        if (fs.existsSync(p)) {
            console.log(`   Removing ${folder}...`);
            fs.rmSync(p, { recursive: true, force: true });
        }
    });

    // 2. Build Client (Frontend)
    console.log('\n📦 Step 2: Building Frontend (Vite)...');
    runCommand('npm install', clientDir);
    runCommand('npm run build', clientDir);

    // 3. Package Electron App
    console.log('\n📦 Step 3: Packaging Desktop Application (Electron)...');
    runCommand('npm run electron:build', clientDir);

    console.log('\n✅ BUILD SUCCESSFUL!');
    console.log(`Look for your installer in: ${path.join(clientDir, 'dist_electron')}`);
}

build();
