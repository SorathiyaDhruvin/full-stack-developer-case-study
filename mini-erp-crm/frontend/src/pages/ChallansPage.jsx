import { useEffect, useMemo, useState } from "react";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Modal from "../components/common/Modal";
import Select from "../components/common/Select";
import Table from "../components/common/Table";
import { toast } from "../components/common/toastHelpers";
import { useAuth } from "../context/auth";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";
import { createChallan, getChallans, updateChallanStatus } from "../services/challanService";

const initialForm = {
  customer_id: "",
  status: "Draft",
  items: [{ product_id: "", quantity: "1" }],
};

const statusOptions = [
  { value: "Draft", label: "Draft" },
  { value: "Confirmed", label: "Confirmed" },
];

const statusVariant = {
  Draft: "info",
  Confirmed: "success",
  Cancelled: "danger",
};

const ChallansPage = () => {
  const { hasAnyRole } = useAuth();
  const canManage = hasAnyRole(["Admin", "Sales"]);
  const [challans, setChallans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [challanData, customerData, productData] = await Promise.all([getChallans(), getCustomers(), getProducts()]);
      setChallans(challanData.challans || []);
      setCustomers(customerData.customers || []);
      setProducts(productData.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load challans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const customerOptions = customers.map((customer) => ({ value: String(customer.id), label: customer.customer_name }));
  const productOptions = products.map((product) => ({ value: String(product.id), label: `${product.product_name} (${product.sku}) - ${product.current_stock} available` }));

  const totalQuantity = useMemo(
    () => formData.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [formData.items]
  );

  const resetAndOpen = () => {
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleRootChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [name]: value } : item)),
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, { product_id: "", quantity: "1" }] }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createChallan({
        customer_id: Number(formData.customer_id),
        status: formData.status,
        items: formData.items.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),
      });
      toast.success("Challan created");
      setModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to create challan");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (challan, status) => {
    setSaving(true);
    try {
      await updateChallanStatus(challan.id, status);
      toast.success(status === "Confirmed" ? "Challan confirmed" : "Challan cancelled");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update challan");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "challan_number", label: "Challan" },
    { key: "customer_name", label: "Customer" },
    { key: "total_quantity", label: "Qty" },
    { key: "status", label: "Status", render: (row) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge> },
    { key: "created_by_name", label: "Created By" },
    { key: "created_at", label: "Date", render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        canManage && row.status === "Draft" ? (
          <div className="row-actions">
            <Button size="sm" variant="secondary" onClick={() => changeStatus(row, "Confirmed")} disabled={saving}>Confirm</Button>
            <Button size="sm" variant="danger" onClick={() => changeStatus(row, "Cancelled")} disabled={saving}>Cancel</Button>
          </div>
        ) : "-"
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading challans..." />;

  return (
    <div className="page-stack">
      <section className="page-toolbar align-end">
        <div>
          <p className="eyebrow">Delivery documents</p>
          <h2>Challans</h2>
        </div>
        {canManage && <Button onClick={resetAndOpen}>Create challan</Button>}
      </section>

      {error && <ErrorMessage message={error} />}

      {challans.length > 0 ? <Table columns={columns} data={challans} /> : <EmptyState title="No challans" message="Create a challan when goods are ready to move." />}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Challan" size="lg">
        <form className="form-grid" onSubmit={handleSubmit}>
          <Select label="Customer" name="customer_id" value={formData.customer_id} onChange={handleRootChange} options={customerOptions} required />
          <Select label="Status" name="status" value={formData.status} onChange={handleRootChange} options={statusOptions} required />

          <div className="form-span-2 item-editor">
            <div className="item-editor-header">
              <h3>Items</h3>
              <Badge variant="info">Total qty: {totalQuantity}</Badge>
            </div>
            {formData.items.map((item, index) => (
              <div className="item-row" key={`${index}-${item.product_id}`}>
                <Select name="product_id" value={item.product_id} onChange={(event) => handleItemChange(index, event)} options={productOptions} placeholder="Select product" required />
                <Input type="number" min="1" name="quantity" value={item.quantity} onChange={(event) => handleItemChange(index, event)} required />
                <Button type="button" variant="ghost" onClick={() => removeItem(index)} disabled={formData.items.length === 1}>Remove</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addItem}>Add item</Button>
          </div>

          <div className="form-actions form-span-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>Create challan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChallansPage;
