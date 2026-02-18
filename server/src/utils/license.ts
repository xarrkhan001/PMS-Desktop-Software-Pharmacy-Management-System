import crypto from 'crypto';
import os from 'os';

// Use a secret key for encryption. In production, this should be in .env
const SECRET_KEY = process.env.LICENSE_SECRET || 'pms-offline-secure-key-2024';
const ALGORITHM = 'aes-256-cbc';

/**
 * Get a unique identifier for the machine.
 * This is a simple version using network interfaces and CPU info.
 */
export const getMachineId = (): string => {
    const interfaces = os.networkInterfaces();
    const macs = Object.values(interfaces)
        .flat()
        .filter((iface) => iface && !iface.internal && iface.mac !== '00:00:00:00:00:00')
        .map((iface) => iface!.mac);

    const cpuInfo = os.cpus()[0]?.model || 'unknown-cpu';
    const combined = `${macs.join('-')}-${cpuInfo}`;

    return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16).toUpperCase();
};

interface LicensePayload {
    pharmacyId: number;
    expiresAt: string;
    machineId: string;
}

/**
 * Generate an encrypted license key
 */
export const generateLicenseKey = (pharmacyId: number, expiryDate: Date, machineId: string): string => {
    const payload: LicensePayload = {
        pharmacyId,
        expiresAt: expiryDate.toISOString(),
        machineId
    };

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, crypto.scryptSync(SECRET_KEY, 'salt', 32), iv);

    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return key in format: IV:ENCRYPTED_DATA
    return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Verify and decode a license key
 * Returns null if machine ID doesn't match or key is malformed.
 * Does NOT check expiry — expiry is checked separately.
 */
export const verifyLicenseKey = (licenseKey: string, currentMachineId: string): LicensePayload | null => {
    try {
        const trimmedKey = licenseKey.trim();
        const colonIndex = trimmedKey.indexOf(':');
        if (colonIndex === -1) return null;

        const ivHex = trimmedKey.substring(0, colonIndex);
        const encrypted = trimmedKey.substring(colonIndex + 1);

        if (!ivHex || !encrypted) return null;

        // Hex strings must be even length
        if (ivHex.length % 2 !== 0 || encrypted.length % 2 !== 0) {
            console.error('Invalid license format: Hex length must be even.');
            return null;
        }

        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, crypto.scryptSync(SECRET_KEY, 'salt', 32), iv);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        const payload: LicensePayload = JSON.parse(decrypted);

        // Check if machine ID matches (Allow 'OPEN' for first-time activation)
        if (payload.machineId !== 'OPEN' && payload.machineId !== currentMachineId) {
            console.error(`License Machine ID Mismatch. Key has: ${payload.machineId}, Current: ${currentMachineId}`);
            return null;
        }

        return payload;
    } catch (error) {
        console.error('License Verification Failed:', error);
        return null;
    }
};
