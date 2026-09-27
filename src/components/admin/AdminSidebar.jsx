import React from 'react';
import { colors, fontFamily, fontFamilyDisplay } from './adminStyles';
import ThemeToggle from '../ThemeToggle';

const AdminSidebar = ({ activeMenu, setActiveMenu, handleLogout }) => {
  const menuItems = [
    { name: 'Overview', icon: '⊞' },
    { name: 'Students', icon: '☰' },
    { name: 'Activities', icon: '▶' },
    { name: 'Words', icon: '≡' },
    { name: 'Leaderboards', icon: '⚑' },
  ];

  return (
    <>
      <style>{`
        .admin-menu-item {
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }
        .admin-menu-item:hover {
          background: ${colors.accentSoft} !important;
          border-color: ${colors.accent}40 !important;
        }
      `}</style>

      <div style={{
        width: '260px',
        height: '100vh',
        background: colors.surface,
        color: colors.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        fontFamily,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        overflowY: 'auto',
        borderRight: `1.5px solid ${colors.border}`,
      }}>
        {/* Brand */}
        <div style={{
          padding: '24px 24px',
          fontSize: '20px',
          fontWeight: '800',
          borderBottom: `1.5px solid ${colors.border}`,
          letterSpacing: '-0.3px',
          color: colors.textPrimary,
          fontFamily: fontFamilyDisplay,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/image/logo.png"
              alt="VocaboPlay"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
                flexShrink: 0,
                border: `1.5px solid ${colors.border}`,
              }}
            />
            <span>Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {menuItems.map((item) => {
            const active = activeMenu === item.name;
            return (
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
                  fontWeight: active ? 800 : 700,
                  color: active ? colors.accent : colors.textSecondary,
                  fontFamily: active ? fontFamilyDisplay : fontFamily,
                  background: active ? colors.accentSoft : 'transparent',
                  borderRadius: '10px',
                  border: `1.5px solid ${active ? `${colors.accent}40` : 'transparent'}`,
                  boxShadow: active ? `0 2px 0 ${colors.accent}30` : 'none',
                }}
              >
                <span style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div style={{
          borderTop: `1.5px solid ${colors.border}`,
          padding: '12px 0',
          background: colors.surfaceSoft,
        }}>
          <div className="theme-toggle-wrap">
            <ThemeToggle colors={colors} fontFamily={fontFamily} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;