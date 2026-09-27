// src/components/admin/ModalWrapper.jsx

import React from 'react';
import { colors, fontFamily } from './adminStyles';

const ModalWrapper = ({ children, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(42, 40, 69, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.surface,
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          border: `1.5px solid ${colors.border}`,
          boxShadow: `0 2px 0 ${colors.border}, 0 20px 50px rgba(42, 40, 69, 0.3)`,
          fontFamily,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;