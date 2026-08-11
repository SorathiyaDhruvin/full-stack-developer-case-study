const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");
const challanRoutes = require("./routes/challanRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());

// ================= ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/challans", challanRoutes);

// ================= HOME =================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Mini ERP CRM API is running"
    });
});

// ================= ERROR HANDLER =================

app.use(errorMiddleware);

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    await testConnection();
});