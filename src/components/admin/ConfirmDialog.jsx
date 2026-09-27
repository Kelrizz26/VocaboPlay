// src/components/admin/ConfirmDialog.jsx
//
// Replaces window.confirm() for destructive admin actions with an in-app
// modal that matches the muted game design system (Avatar Shop / Dashboard).

import React from 'react';
import { colors, fontFamily, fontFamilyDisplay } from './adminStyles';

const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(42, 40, 69, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: colors.surface,
          border: `1.5px solid ${colors.border}`,
          borderTop: `6px solid ${danger ? colors.danger : colors.accent}`,
          borderRadius: '20px',
          padding: '26px',
          maxWidth: '400px',
          width: '100%',
          fontFamily,
          boxShadow: `0 2px 0 ${colors.border}, 0 20px 50px rgba(42, 40, 69, 0.3)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: colors.textPrimary,
            margin: '0 0 8px 0',
            fontFamily: fontFamilyDisplay,
            letterSpacing: '-0.2px',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: '0 0 22px 0',
            lineHeight: 1.55,
            fontFamily,
            fontWeight: 600,
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 18px',
              background: colors.white,
              color: colors.textSecondary,
              border: `1.5px solid ${colors.border}`,
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: fontFamilyDisplay,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: `0 3px 0 ${colors.border}`,
              transition: 'transform 0.12s ease, box-shadow 0.12s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(3px)';
              e.currentTarget.style.boxShadow = `0 0 0 ${colors.border}`;
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 3px 0 ${colors.border}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 3px 0 ${colors.border}`;
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 18px',
              background: danger ? colors.danger : colors.accent,
              color: colors.white,
              border: 'none',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: fontFamilyDisplay,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: `0 3px 0 ${danger ? colors.dangerHover : colors.accentHover}`,
              transition: 'transform 0.12s ease, box-shadow 0.12s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(3px)';
              e.currentTarget.style.boxShadow = `0 0 0 ${danger ? colors.dangerHover : colors.accentHover}`;
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 3px 0 ${danger ? colors.dangerHover : colors.accentHover}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 3px 0 ${danger ? colors.dangerHover : colors.accentHover}`;
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;