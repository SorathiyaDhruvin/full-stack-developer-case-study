import { useAuth } from "../context/auth";
import "../App.css";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="page-stack">
      <div className="page-hero">
        <div>
          <p className="eyebrow">User Profile</p>
          <h2>My Profile</h2>
        </div>
      </div>

      <div className="two-column content-grid">
        <div className="panel profile-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
          <div className="profile-avatar-large" style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'var(--primary-soft)', color: 'var(--primary-dark)', fontSize: '32px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{user?.name || "Unknown User"}</h3>
          <p className="muted" style={{ margin: 0, fontSize: '14px' }}>{user?.role || "No Role"}</p>
        </div>

        <div className="panel unpadded-panel">
          <div className="padded-header" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Account Information</h3>
          </div>
          <div className="panel-body" style={{ padding: '20px' }}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Name</label>
              <div className="form-input" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-soft)', border: '1px solid transparent' }}>
                {user?.name || "Unknown User"}
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Email</label>
              <div className="form-input" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-soft)', border: '1px solid transparent' }}>
                {user?.email || "user@example.com"}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="form-input" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-soft)', border: '1px solid transparent' }}>
                {user?.role || "No Role"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
