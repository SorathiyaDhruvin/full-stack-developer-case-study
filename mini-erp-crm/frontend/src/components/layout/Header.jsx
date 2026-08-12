import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";

const Header = ({ title, onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          Menu
        </button>
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
      </div>
    </header>
  );
};

export default Header;
