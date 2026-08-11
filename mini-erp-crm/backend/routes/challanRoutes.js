const express = require("express");

const {
    addChallan,
    getChallans,
    getChallan,
    changeChallanStatus
} = require("../controllers/challanController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create challan
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Admin", "Sales"),
    addChallan
);

// Get all challans
router.get(
    "/",
    authMiddleware,
    roleMiddleware("Admin", "Sales", "Accounts"),
    getChallans
);

// Get challan by ID
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin", "Sales", "Accounts"),
    getChallan
);

// Update challan status
router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware("Admin", "Sales"),
    changeChallanStatus
);

module.exports = router;