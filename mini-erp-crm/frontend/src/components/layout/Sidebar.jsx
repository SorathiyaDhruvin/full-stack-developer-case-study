import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "DB", roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { path: "/customers", label: "Customers", icon: "CU", roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { path: "/products", label: "Products", icon: "PR", roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { path: "/stock", label: "Stock", icon: "ST", roles: ["Admin", "Warehouse", "Accounts"] },
  { path: "/challans", label: "Challans", icon: "CH", roles: ["Admin", "Sales", "Accounts"] },
  { path: "/profile", label: "Profile", icon: "PF", roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
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
          <button className="sidebar-logout" onClick={handleLogout} title="Logout" aria-label="Logout" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', cursor: 'pointer', padding: '8px 12px', borderRadius: '6px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
