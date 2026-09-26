// src/components/admin/ConfirmDialog.jsx
//
// Replaces window.confirm() for destructive admin actions with an in-app
// modal that matches the Clean-Minimalist design system and is theme-aware.

import React from 'react';
import { colors, fontFamily } from './adminStyles';

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
        background: 'rgba(15, 23, 42, 0.45)',
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
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '380px',
          width: '100%',
          fontFamily,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: colors.textPrimary, margin: '0 0 8px 0', fontFamily }}>
          {title}
        </h3>
        <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 22px 0', lineHeight: 1.5, fontFamily }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 16px',
              background: colors.surface,
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily,
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 16px',
              background: danger ? colors.danger : colors.accent,
              color: '#fff',
              border: `1px solid ${danger ? colors.danger : colors.accent}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily,
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
