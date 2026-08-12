import { useAuth } from "../context/auth";
import Badge from "../components/common/Badge";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="page-stack">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Your Account</p>
          <h2>Profile</h2>
        </div>
      </section>
      
      <section className="panel" style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border)' }}>
          <div className="sidebar-avatar" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{user.name}</h3>
            <Badge variant="info">{user.role}</Badge>
          </div>
        </div>
        
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>Name</div>
            <div style={{ fontSize: '15px' }}>{user.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>Email</div>
            <div style={{ fontSize: '15px' }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>Role</div>
            <div style={{ fontSize: '15px' }}>{user.role}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
