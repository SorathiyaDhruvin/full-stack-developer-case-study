import { useEffect, useMemo, useState } from "react";
import Badge from "../components/common/Badge";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";
import { getStockMovements } from "../services/stockService";
import { getChallans } from "../services/challanService";
import { useAuth } from "../context/auth";

const DashboardPage = () => {
  const { user, hasAnyRole } = useAuth();
  const [data, setData] = useState({ customers: [], products: [], movements: [], challans: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      const requests = [
        getCustomers(),
        getProducts(),
        hasAnyRole(["Admin", "Warehouse", "Accounts"]) ? getStockMovements() : Promise.resolve({ movements: [] }),
        hasAnyRole(["Admin", "Sales", "Accounts"]) ? getChallans() : Promise.resolve({ challans: [] }),
      ];

      const [customers, products, movements, challans] = await Promise.allSettled(requests);

      setData({
        customers: customers.status === "fulfilled" ? customers.value.customers || [] : [],
        products: products.status === "fulfilled" ? products.value.products || [] : [],
        movements: movements.status === "fulfilled" ? movements.value.movements || [] : [],
        challans: challans.status === "fulfilled" ? challans.value.challans || [] : [],
      });

      if ([customers, products, movements, challans].some((result) => result.status === "rejected")) {
        setError("Some dashboard data could not be loaded.");
      }

      setLoading(false);
    };

    loadDashboard();
  }, [hasAnyRole]);

  const stats = useMemo(() => {
    const lowStock = data.products.filter((product) => Number(product.current_stock) <= Number(product.minimum_stock)).length;
    const activeCustomers = data.customers.filter((customer) => customer.status === "Active").length;
    const openChallans = data.challans.filter((challan) => challan.status !== "Confirmed" && challan.status !== "Cancelled").length;

    return [
      { label: "Customers", value: data.customers.length, detail: `${activeCustomers} active` },
      { label: "Products", value: data.products.length, detail: `${lowStock} low stock` },
      { label: "Stock Movements", value: data.movements.length, detail: "Latest activity" },
      { label: "Open Challans", value: openChallans, detail: `${data.challans.length} total` },
    ];
  }, [data]);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="page-stack">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Signed in as {user?.role}</p>
          <h2>Welcome, {user?.name || "User"}</h2>
        </div>
        <Badge variant="info">ERP workspace</Badge>
      </section>

      {error && <ErrorMessage message={error} />}

      <section className="stat-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className="stat-label">{stat.label}</span>
            <strong>{stat.value}</strong>
            <span className="stat-detail">{stat.detail}</span>
          </article>
        ))}
      </section>

      <section className="content-grid two-column">
        <div className="panel">
          <div className="panel-header">
            <h3>Low Stock</h3>
          </div>
          <div className="activity-list">
            {data.products.filter((product) => Number(product.current_stock) <= Number(product.minimum_stock)).slice(0, 6).map((product) => (
              <div className="activity-item" key={product.id}>
                <div>
                  <strong>{product.product_name}</strong>
                  <span>{product.sku}</span>
                </div>
                <Badge variant="warning">{product.current_stock} left</Badge>
              </div>
            ))}
            {data.products.length === 0 && <p className="muted">No product data yet.</p>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Recent Stock Activity</h3>
          </div>
          <div className="activity-list">
            {data.movements.slice(0, 6).map((movement) => (
              <div className="activity-item" key={movement.id}>
                <div>
                  <strong>{movement.product_name}</strong>
                  <span>{movement.reason}</span>
                </div>
                <Badge variant={movement.movement_type === "IN" ? "success" : "danger"}>
                  {movement.movement_type} {movement.quantity}
                </Badge>
              </div>
            ))}
            {data.movements.length === 0 && <p className="muted">No stock movements yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
