// src/components/admin/AdminTopbar.jsx

import React, { useState } from 'react';
import { colors, fontFamily, fontFamilyDisplay } from './adminStyles';

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
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: `1.5px solid ${colors.border}`,
          cursor: 'pointer',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          fontFamily,
          boxShadow: `0 2px 0 ${colors.border}`,
        }}
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        onMouseOver={e => {
          e.currentTarget.style.borderColor = colors.accent;
          e.currentTarget.style.boxShadow = `0 2px 0 ${colors.accentHover}`;
        }}
        onMouseOut={e => {
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.boxShadow = `0 2px 0 ${colors.border}`;
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
          border: `1.5px solid ${colors.accent}40`,
        }}>
          <span style={{ fontSize: '15px' }}>👨‍🏫</span>
        </div>
        <span style={{
          fontSize: '13px',
          fontWeight: 800,
          color: colors.textPrimary,
          fontFamily: fontFamilyDisplay,
          letterSpacing: '0.02em',
        }}>
          Admin
        </span>
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
            borderRadius: '14px',
            zIndex: 1000,
            minWidth: '200px',
            overflow: 'hidden',
            border: `1.5px solid ${colors.border}`,
            boxShadow: `0 2px 0 ${colors.border}, 0 12px 32px rgba(42, 40, 69, 0.15)`,
            fontFamily,
          }}>
            <div style={{
              padding: '12px 14px',
              fontSize: '11px',
              color: colors.textMuted,
              borderBottom: `1.5px solid ${colors.borderSoft}`,
              background: colors.surfaceSoft,
              fontWeight: 800,
              fontFamily: fontFamilyDisplay,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Logged in as
            </div>
            <div style={{
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: 800,
              color: colors.textPrimary,
              borderBottom: `1.5px solid ${colors.borderSoft}`,
              background: colors.surface,
              fontFamily: fontFamilyDisplay,
            }}>
              Admin
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: 'none',
                background: 'none',
                fontSize: '13px',
                fontWeight: 800,
                color: colors.danger,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: fontFamilyDisplay,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
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