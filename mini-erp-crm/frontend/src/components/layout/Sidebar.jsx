import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "DB", roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { path: "/customers", label: "Customers", icon: "CU", roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { path: "/products", label: "Products", icon: "PR", roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { path: "/stock", label: "Stock", icon: "ST", roles: ["Admin", "Warehouse", "Accounts"] },
  { path: "/challans", label: "Challans", icon: "CH", roles: ["Admin", "Sales", "Accounts"] },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout, hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleItems = navItems.filter((item) => hasAnyRole(item.roles));

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">M</span>
            <span className="sidebar-logo-text">Mini ERP CRM</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
              onClick={() => {
                if (window.innerWidth < 1024) onToggle();
              }}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || "User"}</span>
              <span className="sidebar-user-role">{user?.role || "-"}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout" aria-label="Logout">
            Exit
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
