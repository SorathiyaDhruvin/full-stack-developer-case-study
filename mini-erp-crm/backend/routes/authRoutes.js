const express = require("express");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    register,
    login
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "You can access this protected route",
        user: req.user
    });
});

router.get(
    "/admin-test",
    authMiddleware,
    roleMiddleware("Admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Admin access granted"
        });
    }
);

router.get(
    "/sales-test",
    authMiddleware,
    roleMiddleware("Sales"),
    (req, res) => {
        res.json({
            success: true,
            message: "Sales access granted"
        });
    }
);

module.exports = router;