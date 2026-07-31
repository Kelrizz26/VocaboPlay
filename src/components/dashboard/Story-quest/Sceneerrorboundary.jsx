import React from 'react';

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('⚠️ 3D scene crashed, falling back to safe background:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw', height: '100vh',
          background: 'radial-gradient(circle at 50% 30%, #2d1b4e 0%, #0a0a1a 70%)'
        }} />
      );
    }
    return this.props.children;
  }
}

export default SceneErrorBoundary;