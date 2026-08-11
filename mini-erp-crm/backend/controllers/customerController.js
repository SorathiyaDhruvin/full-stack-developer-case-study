const {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    searchCustomers
} = require("../models/customerModel");

// Create customer
const addCustomer = async (req, res, next) => {
    try {
        const {
            customer_name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes
        } = req.body;

        if (!customer_name || !mobile || !customer_type) {
            return res.status(400).json({
                success: false,
                message: "Customer name, mobile and customer type are required"
            });
        }

        const allowedTypes = [
            "Retail",
            "Wholesale",
            "Distributor"
        ];

        if (!allowedTypes.includes(customer_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer type"
            });
        }

        const allowedStatuses = [
            "Lead",
            "Active",
            "Inactive"
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer status"
            });
        }

        const result = await createCustomer({
            customer_name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status: status || "Lead",
            follow_up_date,
            notes
        });

        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            customerId: result.insertId
        });

    } catch (error) {
        next(error);
    }
};

// Get all customers
const getCustomers = async (req, res, next) => {
    try {
        const customers = await getAllCustomers();

        res.status(200).json({
            success: true,
            count: customers.length,
            customers
        });

    } catch (error) {
        next(error);
    }
};

// Get customer by ID
const getCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;

        const customer = await getCustomerById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        res.status(200).json({
            success: true,
            customer
        });

    } catch (error) {
        next(error);
    }
};

// Update customer
const editCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingCustomer = await getCustomerById(id);

        if (!existingCustomer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const {
            customer_name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status,
            follow_up_date,
            notes
        } = req.body;

        if (!customer_name || !mobile || !customer_type) {
            return res.status(400).json({
                success: false,
                message: "Customer name, mobile and customer type are required"
            });
        }

        const allowedTypes = [
            "Retail",
            "Wholesale",
            "Distributor"
        ];

        if (!allowedTypes.includes(customer_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer type"
            });
        }

        const allowedStatuses = [
            "Lead",
            "Active",
            "Inactive"
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer status"
            });
        }

        await updateCustomer(id, {
            customer_name,
            mobile,
            email,
            business_name,
            gst_number,
            customer_type,
            address,
            status: status || "Lead",
            follow_up_date,
            notes
        });

        res.status(200).json({
            success: true,
            message: "Customer updated successfully"
        });

    } catch (error) {
        next(error);
    }
};

// Delete customer
const removeCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingCustomer = await getCustomerById(id);

        if (!existingCustomer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        await deleteCustomer(id);

        res.status(200).json({
            success: true,
            message: "Customer deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};

const searchCustomerList = async (req, res, next) => {
    try {
        const { search } = req.query;

        if (!search || !search.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search value is required"
            });
        }

        const customers = await searchCustomers(search.trim());

        res.status(200).json({
            success: true,
            count: customers.length,
            customers
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    addCustomer,
    getCustomers,
    getCustomer,
    editCustomer,
    removeCustomer,
    searchCustomerList
};