// src/components/admin/ModalWrapper.jsx

import React from 'react';

const ModalWrapper = ({ children, onClose }) => {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000, 
        backdropFilter: 'blur(4px)' 
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          background: '#fff', 
          borderRadius: '24px', 
          padding: '32px', 
          maxWidth: '480px', 
          width: '90%', 
          maxHeight: '85vh', 
          overflowY: 'auto', 
          boxShadow: 'none', 
          fontFamily: "'Poppins', sans-serif" 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;