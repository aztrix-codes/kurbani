'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(`/auth/${path}`);
  };

  // Handle responsive design after component mounts
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial value
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const styles = {
    mainContainer: {
      display: 'flex',
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      flexDirection: isMobile ? 'column-reverse' : 'row-reverse'
    },
    leftPanel: {
      width: isMobile ? '100%' : '50%',
      height: isMobile ? '30%' : '100%',
      backgroundColor: '#046307',
      display: isMobile ? 'none' : 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    },
    rightPanel: {
      width: isMobile ? '100%' : '50%',
      height: isMobile ? '70%' : '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    },
    backgroundCircle1: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      top: '10%',
      left: '10%'
    },
    backgroundCircle2: {
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      bottom: '10%',
      right: '5%'
    },
    leftPanelContent: {
      color: 'white',
      textAlign: 'center',
      maxWidth: '80%',
      zIndex: 1
    },
    brandTitle: {
      fontSize: '42px',
      fontWeight: 'bold',
      marginBottom: '20px'
    },
    brandSubtitle: {
      fontSize: '20px',
      opacity: 0.9,
      lineHeight: 1.6
    },
    formContainer: {
      width: isMobile ? '85%' : '70%',
      maxWidth: '450px',
      padding: isMobile ? '30px' : '40px',
      borderRadius: '10px',
      backgroundColor: 'white',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
    },
    formTitle: {
      fontSize: '28px',
      color: '#333',
      marginBottom: '30px',
      textAlign: 'center',
      fontWeight: 'bold'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    button: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#046307',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
    },
    buttonHovered: {
      backgroundColor: '#034d05',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
    }
  };

  return (
    <div style={styles.mainContainer}>
      {/* Right Panel - Login Selection */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Select Login Type</h2>
          
          <div style={styles.buttonContainer}>
            <button
              style={hoveredButton === "admin" ? {...styles.button, ...styles.buttonHovered} : styles.button}
              onMouseEnter={() => setHoveredButton("admin")}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation("admin")}
            >
              Admin Login
            </button>
            
            <button
              style={hoveredButton === "user" ? {...styles.button, ...styles.buttonHovered} : styles.button}
              onMouseEnter={() => setHoveredButton("user")}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation("user")}
            >
              User Login
            </button>
          </div>
        </div>
      </div>

      {/* Left Panel - Branding */}
      <div style={styles.leftPanel}>
        <div style={styles.backgroundCircle1}></div>
        <div style={styles.backgroundCircle2}></div>
        <div style={styles.leftPanelContent}>
          <h1 style={styles.brandTitle}>Welcome</h1>
          <p style={styles.brandSubtitle}>
            Select your login type to access your account and continue your journey with us.
          </p>
        </div>
      </div>
    </div>
  );
}