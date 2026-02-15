res.json({
    totalItems,
    totalStockValue,
    lowStockCount,
    nearExpiryCount,
    expiredCount,
    categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]: any) => ({
        category,
        count: data.count,
        value: data.value
    }))
});
    } catch (error: any) {
    res.status(500).json({ error: error.message });
}
});

// Update medicine details
router.put("/medicines/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { name, category, genericName, manufacturer, price, salePrice, reorderLevel, rackNo } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const medicine = await prisma.medicine.update({
            where: { id: Number(id), pharmacyId },
            data: {
                name,
                category,
                genericName,
                manufacturer,
                price: parseFloat(price.toString()),
                salePrice: parseFloat(salePrice.toString()),
                reorderLevel: parseInt(reorderLevel.toString()),
                rackNo
            }
        });

        res.json(medicine);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete medicine
router.delete("/medicines/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const pharmacyId = req.user.pharmacyId;

        await prisma.medicine.delete({
            where: { id: Number(id), pharmacyId }
        });

        res.json({ message: "Medicine deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
