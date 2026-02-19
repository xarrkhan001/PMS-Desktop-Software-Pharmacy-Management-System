import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LogOptions {
    type: "sale" | "purchase" | "inventory" | "customer" | "finance" | "system";
    action: string;
    detail: string;
    amount?: number;
    status?: "success" | "warning" | "error" | "info";
    userId?: number;
    pharmacyId: number;
}

/**
 * Persistently logs an activity to the database for audit and tracking.
 */
export const logActivity = async (options: LogOptions) => {
    try {
        await prisma.auditLog.create({
            data: {
                type: options.type,
                action: options.action,
                detail: options.detail,
                amount: options.amount,
                status: options.status || "info",
                userId: options.userId,
                pharmacyId: options.pharmacyId,
            }
        });
    } catch (error) {
        console.error("Failed to record activity log:", error);
    }
};
