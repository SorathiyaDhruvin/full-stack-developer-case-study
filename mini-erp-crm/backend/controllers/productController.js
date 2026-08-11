const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../models/productModel");

// Create product
const addProduct = async (req, res, next) => {
    try {
        const {
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse_location
        } = req.body;

        if (!product_name || !sku || !category || unit_price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product name, SKU, category and unit price are required"
            });
        }

        if (Number(unit_price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Unit price cannot be negative"
            });
        }

        if (current_stock !== undefined && Number(current_stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Current stock cannot be negative"
            });
        }

        if (minimum_stock !== undefined && Number(minimum_stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Minimum stock cannot be negative"
            });
        }

        const result = await createProduct({
            product_name,
            sku,
            category,
            unit_price,
            current_stock: current_stock || 0,
            minimum_stock: minimum_stock || 0,
            warehouse_location
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            productId: result.insertId
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "SKU already exists"
            });
        }

        next(error);
    }
};

// Get all products
const getProducts = async (req, res, next) => {
    try {
        const products = await getAllProducts();

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        next(error);
    }
};

// Get product by ID
const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await getProductById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        next(error);
    }
};

// Update product
const editProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingProduct = await getProductById(id);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const {
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse_location
        } = req.body;

        if (!product_name || !sku || !category || unit_price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product name, SKU, category and unit price are required"
            });
        }

        if (Number(unit_price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Unit price cannot be negative"
            });
        }

        if (Number(current_stock) < 0 || Number(minimum_stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock values cannot be negative"
            });
        }

        await updateProduct(id, {
            product_name,
            sku,
            category,
            unit_price,
            current_stock,
            minimum_stock,
            warehouse_location
        });

        res.status(200).json({
            success: true,
            message: "Product updated successfully"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "SKU already exists"
            });
        }

        next(error);
    }
};

// Delete product
const removeProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingProduct = await getProductById(id);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await deleteProduct(id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    addProduct,
    getProducts,
    getProduct,
    editProduct,
    removeProduct
};