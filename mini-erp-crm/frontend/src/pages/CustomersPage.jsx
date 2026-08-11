import { useEffect, useMemo, useState } from "react";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Modal from "../components/common/Modal";
import Select from "../components/common/Select";
import Table from "../components/common/Table";
import { toast } from "../components/common/toastHelpers";
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from "../services/customerService";

const emptyForm = {
  customer_name: "",
  mobile: "",
  email: "",
  business_name: "",
  gst_number: "",
  customer_type: "Retail",
  address: "",
  status: "Lead",
  follow_up_date: "",
  notes: "",
};

const customerTypeOptions = [
  { value: "Retail", label: "Retail" },
  { value: "Wholesale", label: "Wholesale" },
  { value: "Distributor", label: "Distributor" },
];

const statusOptions = [
  { value: "Lead", label: "Lead" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const statusVariant = {
  Lead: "info",
  Active: "success",
  Inactive: "default",
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCustomers();
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return customers;
    return customers.filter((customer) =>
      [customer.customer_name, customer.mobile, customer.email, customer.business_name]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    );
  }, [customers, query]);

  const openCreate = () => {
    setEditingCustomer(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      ...emptyForm,
      ...customer,
      follow_up_date: customer.follow_up_date ? String(customer.follow_up_date).slice(0, 10) : "",
    });
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, follow_up_date: formData.follow_up_date || null };
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, payload);
        toast.success("Customer updated");
      } else {
        await createCustomer(payload);
        toast.success("Customer created");
      }
      setModalOpen(false);
      await loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save customer");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success("Customer deleted");
      setDeleteTarget(null);
      await loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete customer");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "customer_name", label: "Customer" },
    { key: "mobile", label: "Mobile" },
    { key: "customer_type", label: "Type" },
    { key: "status", label: "Status", render: (row) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge> },
    { key: "follow_up_date", label: "Follow Up", render: (row) => row.follow_up_date ? String(row.follow_up_date).slice(0, 10) : "-" },
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

  if (loading) return <LoadingSpinner message="Loading customers..." />;

  return (
    <div className="page-stack">
      <section className="page-toolbar">
        <Input name="customer-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers" />
        <Button onClick={openCreate}>Add customer</Button>
      </section>

      {error && <ErrorMessage message={error} />}

      {filteredCustomers.length > 0 ? (
        <Table columns={columns} data={filteredCustomers} />
      ) : (
        <EmptyState title="No customers" message="Create your first customer to start tracking CRM activity." />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCustomer ? "Edit Customer" : "Add Customer"} size="lg">
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input label="Customer name" name="customer_name" value={formData.customer_name} onChange={handleChange} required />
          <Input label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} required />
          <Input label="Email" type="email" name="email" value={formData.email || ""} onChange={handleChange} />
          <Input label="Business name" name="business_name" value={formData.business_name || ""} onChange={handleChange} />
          <Input label="GST number" name="gst_number" value={formData.gst_number || ""} onChange={handleChange} />
          <Select label="Customer type" name="customer_type" value={formData.customer_type} onChange={handleChange} options={customerTypeOptions} required />
          <Select label="Status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} required />
          <Input label="Follow up date" type="date" name="follow_up_date" value={formData.follow_up_date || ""} onChange={handleChange} />
          <div className="form-group form-span-2">
            <label className="form-label" htmlFor="address">Address</label>
            <textarea id="address" name="address" className="form-input" value={formData.address || ""} onChange={handleChange} rows="3" />
          </div>
          <div className="form-group form-span-2">
            <label className="form-label" htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" className="form-input" value={formData.notes || ""} onChange={handleChange} rows="3" />
          </div>
          <div className="form-actions form-span-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingCustomer ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Delete ${deleteTarget?.customer_name || "this customer"}?`}
        loading={saving}
      />
    </div>
  );
};

export default CustomersPage;
