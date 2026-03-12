import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Search, Utensils, Briefcase, FileText, TrendingUp, 
  Users, Layers, Settings, LogOut, ChevronDown, MoreHorizontal, Info
} from "lucide-react";
import "../styles/dashboard.css";

export default function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role") || "admin";
  const userEmail = localStorage.getItem("user_email") || "olivia@untitledui.com";
  const userName = localStorage.getItem("user_name") || "Olivia Rhye";

  if (!token) return <Navigate to="/login" replace />;

  const menuItems = [
    { path: "/home/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/home/admin/orders", label: "Orders", icon: FileText },
    { path: "/home/owner/menu", label: "Menu Management", icon: Utensils },
    { path: "/home/admin/qr", label: "QR Management", icon: Briefcase },
    { path: "/home/admin/invoices", label: "Invoices", icon: FileText },
    { path: "/home/admin/marketing", label: "Marketing", icon: TrendingUp },
    { path: "/home/admin/users", label: "User Roles", icon: Users },
    { path: "/home/admin/content", label: "Content", icon: Layers },
    { path: "/home/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="modern-layout">
      {/* ── SIDEBAR CONTAINER ── */}
      <aside className="modern-sidebar" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        height: '100vh',
        padding: '24px 16px' 
      }}>
        
        {/* TOP GROUP: Logo, Search, Navigation */}
        <div className="sidebar-top-group">
          <div className="sidebar-brand-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 8px' }}>
            <h1 className="brand-title" style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Rest. Admin</h1>
            <button className="sidebar-toggle-btn" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="sidebar-search-container" style={{ position: 'relative', marginBottom: '24px', padding: '0 8px' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search" 
              className="sidebar-search-input" 
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #f1f5f9', background: '#fff', fontSize: '14px' }}
            />
          </div>

          <nav className="sidebar-nav-links" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#1e293b' : '#64748b',
                  background: isActive ? '#f8fafc' : 'transparent',
                  fontWeight: '600',
                  fontSize: '14px'
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                <ChevronDown size={14} style={{ opacity: 0.5 }} />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* BOTTOM GROUP: Upgrade Card & Profile */}
        <div className="sidebar-footer-group" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 8px' }}>
          
          {/* Upgrade Card matched to image_b53397.jpg */}
          <div className="upgrade-card" style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#1e293b' }}>Manage Subscription plan</p>
              <Info size={14} style={{ color: '#94a3b8' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.4' }}>
              You’ve used 80% of your 5 GB storage. Upgrade for more space & features.
            </p>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ width: '80%', height: '100%', background: '#6366f1' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: '700', color: '#64748b', cursor: 'pointer', padding: 0 }}>Dismiss</button>
              <button style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: '700', color: '#6366f1', cursor: 'pointer', padding: 0 }}>Upgrade plan</button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="user-profile-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src={`https://ui-avatars.com/api/?name=${userName}&background=f97316&color=fff`} 
                alt="Avatar" 
                style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
              />
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', margin: 0, color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{userName}</p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{userEmail}</p>
              </div>
            </div>
            <button 
              onClick={() => { localStorage.clear(); navigate("/login"); }} 
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area" style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
        <Outlet />
      </main>
    </div>
  );
}