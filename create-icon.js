/**
 * MediCore ICO Icon Generator
 * Creates a proper Windows ICO file from scratch using pure Node.js (no dependencies)
 * ICO format: Header + Directory Entries + BMP image data
 */
const fs = require('fs');
const path = require('path');

// We'll create a 256x256 32-bit ARGB BMP image
const SIZE = 256;

function createMedicoreBMP(size) {
    const pixels = new Uint8Array(size * size * 4); // BGRA format

    const cx = size / 2;
    const cy = size / 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const idx = (y * size + x) * 4;
            const dx = x - cx;
            const dy = y - cy;

            // Modern Rounded Square (Squircle-ish)
            const margin = size * 0.02; // Reduced margin to make it look larger
            const innerSize = size - (margin * 2);
            const cornerRadius = size * 0.15;

            const localX = x - margin;
            const localY = y - margin;

            let alpha = 0;
            if (x >= margin && x <= size - margin && y >= margin && y <= size - margin) {
                // Check corners for rounding
                let inCorner = false;
                if (localX < cornerRadius && localY < cornerRadius) { // Top Left
                    if (Math.sqrt((localX - cornerRadius) ** 2 + (localY - cornerRadius) ** 2) > cornerRadius) inCorner = true;
                } else if (localX > innerSize - cornerRadius && localY < cornerRadius) { // Top Right
                    if (Math.sqrt((localX - (innerSize - cornerRadius)) ** 2 + (localY - cornerRadius) ** 2) > cornerRadius) inCorner = true;
                } else if (localX < cornerRadius && localY > innerSize - cornerRadius) { // Bottom Left
                    if (Math.sqrt((localX - cornerRadius) ** 2 + (localY - (innerSize - cornerRadius)) ** 2) > cornerRadius) inCorner = true;
                } else if (localX > innerSize - cornerRadius && localY > innerSize - cornerRadius) { // Bottom Right
                    if (Math.sqrt((localX - (innerSize - cornerRadius)) ** 2 + (localY - (innerSize - cornerRadius)) ** 2) > cornerRadius) inCorner = true;
                }

                if (!inCorner) alpha = 255;
            }

            if (alpha > 0) {
                // Premium Gradient: Royal Blue (#4F46E5) to Deep Purple (#7C3AED)
                const gradPos = (x + y) / (size * 2);
                const r = Math.round(79 + gradPos * (124 - 79));
                const g = Math.round(70 + gradPos * (58 - 70));
                const b = Math.round(229 + gradPos * (237 - 229));

                pixels[idx + 0] = b; // B
                pixels[idx + 1] = g; // G
                pixels[idx + 2] = r; // R
                pixels[idx + 3] = 255;

                // Subtle Top Gloss/Shine
                if (y < size * 0.4) {
                    const shine = Math.max(0, 30 - (y / (size * 0.4)) * 30);
                    pixels[idx + 0] = Math.min(255, pixels[idx + 0] + shine);
                    pixels[idx + 1] = Math.min(255, pixels[idx + 1] + shine);
                    pixels[idx + 2] = Math.min(255, pixels[idx + 2] + shine);
                }

                // --- Draw Stylized White Medical Cross ---
                const crossInSize = size * 0.45;
                const crossThickness = size * 0.12;
                const isH = Math.abs(dy) < crossThickness / 2 && Math.abs(dx) < crossInSize / 2;
                const isV = Math.abs(dx) < crossThickness / 2 && Math.abs(dy) < crossInSize / 2;

                if (isH || isV) {
                    pixels[idx + 0] = 255;
                    pixels[idx + 1] = 255;
                    pixels[idx + 2] = 255;
                    pixels[idx + 3] = 255;
                }

                // Add a small "Pulse" dot in the corner for style
                const dotDist = Math.sqrt((x - size * 0.75) ** 2 + (y - size * 0.75) ** 2);
                if (dotDist < size * 0.04) {
                    pixels[idx + 0] = 150; // Cyan-ish dot
                    pixels[idx + 1] = 255;
                    pixels[idx + 2] = 100;
                    pixels[idx + 3] = 255;
                }
            } else {
                pixels[idx + 0] = 0;
                pixels[idx + 1] = 0;
                pixels[idx + 2] = 0;
                pixels[idx + 3] = 0;
            }
        }
    }
    return pixels;
}

function createBMPData(pixels, size) {
    // DIB header for ICO (BITMAPINFOHEADER) - 40 bytes
    // BMP inside ICO has height doubled (XOR + AND masks)
    const dibSize = 40;
    const pixelDataSize = size * size * 4; // 32-bit BGRA
    const andMaskSize = size * Math.ceil(size / 8); // 1-bit AND mask, padded to DWORD
    const totalSize = dibSize + pixelDataSize + andMaskSize;
    const buf = Buffer.alloc(totalSize, 0);

    // BITMAPINFOHEADER
    buf.writeUInt32LE(dibSize, 0);      // biSize
    buf.writeInt32LE(size, 4);           // biWidth
    buf.writeInt32LE(size * 2, 8);       // biHeight (doubled for XOR+AND)
    buf.writeUInt16LE(1, 12);            // biPlanes
    buf.writeUInt16LE(32, 14);           // biBitCount (32-bit ARGB)
    buf.writeUInt32LE(0, 16);            // biCompression (BI_RGB)
    buf.writeUInt32LE(pixelDataSize, 20);// biSizeImage
    buf.writeInt32LE(0, 24);             // biXPelsPerMeter
    buf.writeInt32LE(0, 28);             // biYPelsPerMeter
    buf.writeUInt32LE(0, 32);            // biClrUsed
    buf.writeUInt32LE(0, 36);            // biClrImportant

    // Pixel data (bottom-up in BMP)
    let offset = dibSize;
    for (let y = size - 1; y >= 0; y--) {
        for (let x = 0; x < size; x++) {
            const srcIdx = (y * size + x) * 4;
            buf[offset++] = pixels[srcIdx + 0]; // B
            buf[offset++] = pixels[srcIdx + 1]; // G
            buf[offset++] = pixels[srcIdx + 2]; // R
            buf[offset++] = pixels[srcIdx + 3]; // A
        }
    }

    // AND mask (all zeros since we use alpha channel)
    // Already zeroed by Buffer.alloc

    return buf;
}

function createICO(sizes) {
    const images = sizes.map(size => {
        const pixels = createMedicoreBMP(size);
        return { size, bmpData: createBMPData(pixels, size) };
    });

    // ICO Header: 6 bytes
    const headerSize = 6;
    const dirEntrySize = 16;
    const dirSize = images.length * dirEntrySize;
    const totalHeaderSize = headerSize + dirSize;

    // Calculate offsets
    let dataOffset = totalHeaderSize;
    const entries = images.map(img => {
        const entry = { bmpData: img.bmpData, size: img.size, offset: dataOffset };
        dataOffset += img.bmpData.length;
        return entry;
    });

    const totalSize = dataOffset;
    const ico = Buffer.alloc(totalSize);

    // ICO Header
    ico.writeUInt16LE(0, 0);              // Reserved
    ico.writeUInt16LE(1, 2);              // Type (1 = ICO)
    ico.writeUInt16LE(images.length, 4);  // Count

    // Directory entries
    let dirOffset = headerSize;
    entries.forEach(entry => {
        const s = entry.size >= 256 ? 0 : entry.size; // 256 is stored as 0
        ico.writeUInt8(s, dirOffset);         // Width
        ico.writeUInt8(s, dirOffset + 1);     // Height
        ico.writeUInt8(0, dirOffset + 2);     // ColorCount
        ico.writeUInt8(0, dirOffset + 3);     // Reserved
        ico.writeUInt16LE(1, dirOffset + 4);  // Planes
        ico.writeUInt16LE(32, dirOffset + 6); // BitCount
        ico.writeUInt32LE(entry.bmpData.length, dirOffset + 8); // BytesInRes
        ico.writeUInt32LE(entry.offset, dirOffset + 12);         // ImageOffset
        dirOffset += dirEntrySize;
    });

    // Image data
    entries.forEach(entry => {
        entry.bmpData.copy(ico, entry.offset);
    });

    return ico;
}

// Generate ICO with multiple sizes
console.log('🎨 Generating MediCore icon...');
const icoData = createICO([16, 32, 48, 64, 128, 256]);
const outputPath = path.join(__dirname, 'client', 'public', 'medicore_icon.ico');
fs.writeFileSync(outputPath, icoData);
console.log(`✅ Icon created: ${outputPath} (${(icoData.length / 1024).toFixed(1)} KB)`);
console.log('You can now use "public/medicore_icon.ico" in package.json');
