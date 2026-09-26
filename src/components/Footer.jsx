import React from 'react';

const Footer = () => {
  const linkStyle = {
    color: '#64748B',
    textDecoration: 'none',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    transition: 'color 0.15s ease',
  };

  return (
    <footer style={{ borderTop: '1px solid #E2E8F0', background: '#FFFFFF' }}>
      <div style={{
        padding: '48px 20px 24px',
        color: '#1E293B',
        fontFamily: "'Poppins', sans-serif"
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '40px',
          marginBottom: '32px',
          textAlign: 'center'
        }}>

          {/* Support Column */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1E293B', fontFamily: "'Poppins', sans-serif" }}>Support</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <a href="#" style={linkStyle}>Help Center</a>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <a href="#" style={linkStyle}>FAQ</a>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <a href="#" style={linkStyle}>Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1E293B', fontFamily: "'Poppins', sans-serif" }}>Legal</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <a href="#" style={linkStyle}>Privacy Policy</a>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <a href="#" style={linkStyle}>Terms of Service</a>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <a href="#" style={linkStyle}>Cookie Settings</a>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1E293B', fontFamily: "'Poppins', sans-serif" }}>Connect</h3>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center' }}>
              {/* Facebook */}
              <a href="#" style={{ color: '#64748B', transition: 'color 0.15s ease', display: 'flex' }}
                onMouseOver={e => e.currentTarget.style.color = '#5C6AC4'}
                onMouseOut={e => e.currentTarget.style.color = '#64748B'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a href="#" style={{ color: '#64748B', transition: 'color 0.15s ease', display: 'flex' }}
                onMouseOver={e => e.currentTarget.style.color = '#5C6AC4'}
                onMouseOut={e => e.currentTarget.style.color = '#64748B'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Twitter/X */}
              <a href="#" style={{ color: '#64748B', transition: 'color 0.15s ease', display: 'flex' }}
                onMouseOver={e => e.currentTarget.style.color = '#5C6AC4'}
                onMouseOut={e => e.currentTarget.style.color = '#64748B'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

            </div>
          </div>
        </div>
        {/* Copyright */}
        <div style={{
          borderTop: '1px solid #E2E8F0',
          paddingTop: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '400', color: '#94A3B8', fontFamily: "'Poppins', sans-serif" }}>
            © 2026 VocaboPlay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
