import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";

const Header = ({ title, onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-left">
        {!isSidebarOpen && (
          <button className="header-menu-btn-desktop" onClick={onMenuToggle} aria-label="Open navigation">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        )}
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        <div className="header-user">
          <span className="header-user-name">{user?.name}</span>
          <span className="header-user-role">{user?.role}</span>
        </div>
        <button className="header-logout-btn" onClick={handleLogout} title="Logout">
          Logout
        </button>
        <button className="header-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu" style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
          {isSidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
