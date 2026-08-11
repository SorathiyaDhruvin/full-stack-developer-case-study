const express = require("express");

const {
    addProduct,
    getProducts,
    getProduct,
    editProduct,
    removeProduct
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create product
router.post("/", authMiddleware, addProduct);

// Get all products
router.get("/", authMiddleware, getProducts);

// Get product by ID
router.get("/:id", authMiddleware, getProduct);

// Update product
router.put("/:id", authMiddleware, editProduct);

// Delete product
router.delete("/:id", authMiddleware, removeProduct);

module.exports = router;