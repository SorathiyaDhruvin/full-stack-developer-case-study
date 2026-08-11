import { useEffect, useState } from "react";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Select from "../components/common/Select";
import Table from "../components/common/Table";
import { toast } from "../components/common/toastHelpers";
import { useAuth } from "../context/auth";
import { getProducts } from "../services/productService";
import { createStockMovement, getStockMovements } from "../services/stockService";

const initialForm = {
  product_id: "",
  quantity: "",
  movement_type: "IN",
  reason: "",
};

const movementOptions = [
  { value: "IN", label: "Stock In" },
  { value: "OUT", label: "Stock Out" },
];

const StockPage = () => {
  const { hasAnyRole } = useAuth();
  const canCreate = hasAnyRole(["Admin", "Warehouse"]);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productData, movementData] = await Promise.all([getProducts(), getStockMovements()]);
      setProducts(productData.products || []);
      setMovements(movementData.movements || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load stock data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const productOptions = products.map((product) => ({
    value: String(product.id),
    label: `${product.product_name} (${product.sku}) - ${product.current_stock} in stock`,
  }));

  const selectedProduct = products.find((product) => String(product.id) === String(formData.product_id));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createStockMovement({
        product_id: Number(formData.product_id),
        quantity: Number(formData.quantity),
        movement_type: formData.movement_type,
        reason: formData.reason,
      });
      toast.success("Stock movement recorded");
      setFormData(initialForm);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to record stock movement");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "created_at", label: "Date", render: (row) => row.created_at ? new Date(row.created_at).toLocaleString() : "-" },
    { key: "product_name", label: "Product" },
    { key: "sku", label: "SKU" },
    { key: "movement_type", label: "Type", render: (row) => <Badge variant={row.movement_type === "IN" ? "success" : "danger"}>{row.movement_type}</Badge> },
    { key: "quantity", label: "Qty" },
    { key: "reason", label: "Reason" },
    { key: "created_by_name", label: "By" },
  ];

  if (loading) return <LoadingSpinner message="Loading stock..." />;

  return (
    <div className="page-stack">
      {error && <ErrorMessage message={error} />}

      {canCreate && (
        <section className="panel">
          <div className="panel-header">
            <h3>Record Movement</h3>
            {selectedProduct && <Badge variant="info">Current stock: {selectedProduct.current_stock}</Badge>}
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <Select label="Product" name="product_id" value={formData.product_id} onChange={handleChange} options={productOptions} required />
            <Select label="Movement" name="movement_type" value={formData.movement_type} onChange={handleChange} options={movementOptions} required />
            <Input label="Quantity" type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} required />
            <Input label="Reason" name="reason" value={formData.reason} onChange={handleChange} required />
            <div className="form-actions form-span-2">
              <Button type="submit" loading={saving}>Record movement</Button>
            </div>
          </form>
        </section>
      )}

      <section className="panel unpadded-panel">
        <div className="panel-header padded-header">
          <h3>Movement History</h3>
        </div>
        {movements.length > 0 ? <Table columns={columns} data={movements} /> : <EmptyState title="No stock movements" message="Inventory adjustments will appear here." />}
      </section>
    </div>
  );
};

export default StockPage;
