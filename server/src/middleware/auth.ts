import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'pms_default_secret_fallback';

export const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
        if (err) {
            console.error("JWT Verification Error:", err.message);
            return res.status(403).json({ error: 'Invalid token' });
        }

        try {
            const userExists = await prisma.user.findUnique({
                where: { id: decoded.id },
                include: { pharmacy: true }
            });

            if (!userExists || (userExists.role !== 'SUPER_ADMIN' && !userExists.pharmacy)) {
                return res.status(401).json({ error: 'Account has been removed' });
            }

            if (decoded.tokenVersion !== userExists.tokenVersion) {
                return res.status(401).json({ error: 'Session expired. Credentials changed.' });
            }

            req.user = decoded;
            next();
        } catch (dbErr) {
            return res.status(500).json({ error: 'System check failed' });
        }
    });
};
