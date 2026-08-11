import { useEffect, useMemo, useState } from "react";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Modal from "../components/common/Modal";
import Table from "../components/common/Table";
import { toast } from "../components/common/toastHelpers";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../services/productService";

const emptyForm = {
  product_name: "",
  sku: "",
  category: "",
  unit_price: "",
  current_stock: "0",
  minimum_stock: "0",
  warehouse_location: "",
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return products;
    return products.filter((product) =>
      [product.product_name, product.sku, product.category, product.warehouse_location]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    );
  }, [products, query]);

  const openCreate = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({ ...emptyForm, ...product });
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => ({
    product_name: formData.product_name,
    sku: formData.sku,
    category: formData.category,
    unit_price: Number(formData.unit_price),
    current_stock: Number(formData.current_stock || 0),
    minimum_stock: Number(formData.minimum_stock || 0),
    warehouse_location: formData.warehouse_location,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, buildPayload());
        toast.success("Product updated");
      } else {
        await createProduct(buildPayload());
        toast.success("Product created");
      }
      setModalOpen(false);
      await loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      await loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete product");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "product_name", label: "Product" },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Category" },
    { key: "unit_price", label: "Unit Price", render: (row) => formatCurrency(row.unit_price) },
    {
      key: "current_stock",
      label: "Stock",
      render: (row) => {
        const isLow = Number(row.current_stock) <= Number(row.minimum_stock);
        return <Badge variant={isLow ? "warning" : "success"}>{row.current_stock}</Badge>;
      },
    },
    { key: "warehouse_location", label: "Location", render: (row) => row.warehouse_location || "-" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="row-actions">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading products..." />;

  return (
    <div className="page-stack">
      <section className="page-toolbar">
        <Input name="product-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" />
        <Button onClick={openCreate}>Add product</Button>
      </section>

      {error && <ErrorMessage message={error} />}

      {filteredProducts.length > 0 ? (
        <Table columns={columns} data={filteredProducts} />
      ) : (
        <EmptyState title="No products" message="Add inventory items before recording stock or challans." />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? "Edit Product" : "Add Product"} size="lg">
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input label="Product name" name="product_name" value={formData.product_name} onChange={handleChange} required />
          <Input label="SKU" name="sku" value={formData.sku} onChange={handleChange} required />
          <Input label="Category" name="category" value={formData.category} onChange={handleChange} required />
          <Input label="Unit price" type="number" min="0" step="0.01" name="unit_price" value={formData.unit_price} onChange={handleChange} required />
          <Input label="Current stock" type="number" min="0" name="current_stock" value={formData.current_stock} onChange={handleChange} required />
          <Input label="Minimum stock" type="number" min="0" name="minimum_stock" value={formData.minimum_stock} onChange={handleChange} required />
          <Input label="Warehouse location" name="warehouse_location" value={formData.warehouse_location || ""} onChange={handleChange} className="form-span-2" />
          <div className="form-actions form-span-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingProduct ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Delete ${deleteTarget?.product_name || "this product"}?`}
        loading={saving}
      />
    </div>
  );
};

export default ProductsPage;
