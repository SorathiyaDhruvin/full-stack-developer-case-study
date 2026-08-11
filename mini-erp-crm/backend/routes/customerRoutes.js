const express = require("express");

const {
    addCustomer,
    getCustomers,
    getCustomer,
    editCustomer,
    removeCustomer,
    searchCustomerList
} = require("../controllers/customerController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create customer
router.post("/", authMiddleware, addCustomer);

// Get all customers
router.get("/", authMiddleware, getCustomers);

router.get("/search",authMiddleware,searchCustomerList);

// Get customer by ID
router.get("/:id", authMiddleware, getCustomer);

// Update customer
router.put("/:id", authMiddleware, editCustomer);

// Delete customer
router.delete("/:id", authMiddleware, removeCustomer);

module.exports = router;