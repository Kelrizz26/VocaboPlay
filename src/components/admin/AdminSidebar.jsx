import React from 'react';
import logo from '../../image/logo.png';
import { colors, fontFamily } from './adminStyles';
import ThemeToggle from '../ThemeToggle';

const AdminSidebar = ({ activeMenu, setActiveMenu, handleLogout }) => {
  const menuItems = [
    { name: 'Overview', icon: '⊞' },
    { name: 'Students', icon: '☰' },
    { name: 'Games', icon: '▶' },
    { name: 'Words', icon: '≡' },
    { name: 'Leaderboards', icon: '⚑' },
  ];

  return (
    <>
      <style>{`
        .admin-menu-item:hover { background: rgba(255,255,255,0.12) !important; }

        /* ✅ Para klaro/makita ang "Light Mode" text ng ThemeToggle sa loob ng violet sidebar.
           Naka-scope lang ito sa .theme-toggle-wrap kaya walang ibang bahagi ng app ang maaapektuhan. */
        .theme-toggle-wrap, .theme-toggle-wrap span, .theme-toggle-wrap p, .theme-toggle-wrap label {
          color: #ffffff !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* ✅ position: fixed (dati walang position, kaya kasama sa normal scroll flow ang sidebar).
          Ngayon permanenteng naka-stick sa left kahit mag-scroll ang page — kaparehas ng Dashboard sidebar. */}
      <div style={{
        width: '260px',
        height: '100vh',
        background: '#6C5CE7', // 🎨 VIOLET — kaparehas ng Dashboard sidebar
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        fontFamily,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        overflowY: 'auto',
      }}>
        <div style={{
          padding: '24px 24px',
          fontSize: '20px',
          fontWeight: '700',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          letterSpacing: '-0.3px',
          color: '#ffffff',
          fontFamily,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logo} alt="VocaboPlay" style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit:"cover", display:"block", flexShrink:0 }} />
            <span>Admin Panel</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {menuItems.map((item) => (
            <div
              key={item.name}
              className="admin-menu-item"
              onClick={() => setActiveMenu(item.name)}
              style={{
                padding: '11px 24px',
                margin: '2px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeMenu === item.name ? '600' : '500',
                color: '#ffffff',
                fontFamily,
                background: activeMenu === item.name ? 'rgba(255,255,255,0.18)' : 'transparent',
                borderRadius: '8px',
                transition: 'background 0.15s ease, color 0.15s ease',
                borderLeft: activeMenu === item.name ? '3px solid #ffffff' : '3px solid transparent',
                paddingLeft: activeMenu === item.name ? '21px' : '24px',
              }}
            >
              <span style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '12px 0' }}>
          <div className="theme-toggle-wrap">
            <ThemeToggle colors={colors} fontFamily={fontFamily} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;