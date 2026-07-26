// src/components/admin/AdminTopbar.jsx

import React, { useState } from 'react';
import { colors, fontFamily } from './adminStyles';

const AdminTopBar = ({ handleLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'flex-end', 
      marginBottom: '28px', 
      position: 'relative' 
    }}>
      <div 
        style={{ 
          background: colors.surface, 
          padding: '6px 14px 6px 8px', 
          borderRadius: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          border: `1px solid ${colors.border}`,
          cursor: 'pointer', 
          transition: 'border-color 0.15s ease',
          fontFamily,
        }}
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        onMouseOver={e => { 
          e.currentTarget.style.borderColor = colors.accent;
        }}
        onMouseOut={e => { 
          e.currentTarget.style.borderColor = colors.border;
        }}
      >
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          background: colors.accentSoft, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <span style={{ fontSize: '15px', color: colors.accent }}>👨‍🏫</span>
        </div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textPrimary }}>Admin</span>
        <span style={{ fontSize: '10px', color: colors.textMuted }}>▼</span>
      </div>

      {showProfileMenu && (
        <>
          <div
            onClick={() => setShowProfileMenu(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          />
          <div style={{ 
          position: 'absolute', 
          top: '50px', 
          right: 0, 
          background: colors.surface, 
          borderRadius: '10px', 
          zIndex: 1000, 
          minWidth: '200px', 
          overflow: 'hidden', 
          border: `1px solid ${colors.border}`,
          fontFamily,
        }}>
          <div style={{ 
            padding: '12px 14px', 
            fontSize: '11px', 
            color: colors.textMuted, 
            borderBottom: `1px solid ${colors.border}`,
            background: colors.bg,
          }}>
            Logged in as
          </div>
          <div style={{ 
            padding: '12px 14px', 
            fontSize: '13px', 
            fontWeight: '600', 
            color: colors.textPrimary, 
            borderBottom: `1px solid ${colors.border}`, 
            background: colors.bg,
          }}>
            Admin
          </div>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', 
              padding: '10px 14px', 
              border: 'none', 
              background: 'none', 
              fontSize: '13px', 
              fontWeight: '500', 
              color: colors.danger, 
              cursor: 'pointer', 
              textAlign: 'left', 
              fontFamily,
              transition: 'background 0.15s ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = colors.dangerSoft;
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'none';
            }}
          >
            Logout
          </button>
        </div>
        </>
      )}
    </div>
  );
};

export default AdminTopBar;
