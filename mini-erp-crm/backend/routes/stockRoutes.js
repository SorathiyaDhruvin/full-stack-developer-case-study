const express = require("express");

const {
    addStockMovement,
    getStockMovements,
    getProductStockMovements
} = require("../controllers/stockController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create stock movement
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Admin", "Warehouse"),
    addStockMovement
);

// Get all stock movements
router.get(
    "/",
    authMiddleware,
    roleMiddleware("Admin", "Warehouse", "Accounts"),
    getStockMovements
);

// Get stock movements for a product
router.get(
    "/product/:productId",
    authMiddleware,
    roleMiddleware("Admin", "Warehouse", "Accounts"),
    getProductStockMovements
);

module.exports = router;