import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const styles = {
    navbarContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #E2E8F0',
      zIndex: 1000,
      transition: 'all 0.3s ease',
    },
    navbarContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '70px',
    },
    logoWrapper: {
      display: 'flex',
      alignItems: 'center',
    },
    logo: {
      color: '#1E293B',
      padding: '8px 0',
      fontWeight: '700',
      fontSize: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      transition: 'opacity 0.15s ease',
      position: 'relative',
      fontFamily: "'Poppins', sans-serif",
    },
    logoText: {
      fontFamily: "'Poppins', sans-serif",
      letterSpacing: '-0.02em',
    },
    navActions: {
      display: 'flex',
      alignItems: 'center',
    },
    btnSignup: {
      background: '#5C6AC4',
      color: 'white',
      border: '1px solid #5C6AC4',
      padding: '10px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background 0.15s ease',
      position: 'relative',
      fontFamily: "'Poppins', sans-serif",
    },
  };

  const [logoHover, setLogoHover] = React.useState(false);
  const [btnHover, setBtnHover] = React.useState(false);

  return (
    <>
      <style>
        {`
          body {
            padding-top: 70px;
          }

          .navbar-logo:hover {
            opacity: 0.8;
          }

          .navbar-btn:hover {
            background: #4E5AB0 !important;
          }
          
          @media (max-width: 768px) {
            .navbar-content-responsive {
              padding: 0 20px !important;
              height: 65px !important;
            }
            .navbar-logo-responsive {
              padding: 10px 20px !important;
              font-size: 18px !important;
            }
            .navbar-btn-responsive {
              padding: 10px 20px !important;
              font-size: 14px !important;
            }
          }
          
          @media (max-width: 480px) {
            .navbar-content-responsive {
              padding: 0 15px !important;
              height: 60px !important;
            }
            .navbar-logo-responsive {
              padding: 8px 16px !important;
              font-size: 16px !important;
            }
            .navbar-btn-responsive {
              padding: 8px 16px !important;
              font-size: 13px !important;
            }
          }
        `}
      </style>

      <nav style={styles.navbarContainer}>
        <div 
          style={styles.navbarContent}
          className="navbar-content-responsive"
        >
          {/* Logo Section */}
          <div style={styles.logoWrapper}>
            <div 
              style={styles.logo}
              className="navbar-logo navbar-logo-responsive"
              onClick={() => navigate('/')}
              onMouseEnter={() => setLogoHover(true)}
              onMouseLeave={() => setLogoHover(false)}
            >
              <img src="src/image/logo.png" alt="VocaboPlay" style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'block', marginRight: '10px' }} />
              <span style={styles.logoText}>VocaboPlay</span>
            </div>
          </div>

          {/* Sign Up Button Only */}
          <div style={styles.navActions}>
            <button 
              style={styles.btnSignup}
              className="navbar-btn navbar-btn-responsive"
              onClick={() => navigate('/signup')}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
            >
              <span>Sign up</span>
              <span 
                style={{ 
                  fontSize: '10px',
                  transition: 'transform 0.3s ease',
                  transform: btnHover ? 'translateX(5px)' : 'translateX(0)'
                }}
              ></span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;