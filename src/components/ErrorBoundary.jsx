import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.state = {
      hasError: true,
      error,
      errorInfo
    };
    this.forceUpdate();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          maxWidth: '800px', 
          margin: '0 auto',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ color: '#dc2626', marginBottom: '20px' }}>⚠️ Something went wrong</h1>
          <div style={{ 
            backgroundColor: '#fee2e2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Error Details:</h2>
            <pre style={{ 
              backgroundColor: '#fff',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '14px'
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
            
            {this.state.errorInfo && (
              <details style={{ marginTop: '15px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Stack Trace
                </summary>
                <pre style={{ 
                  backgroundColor: '#fff',
                  padding: '15px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  marginTop: '10px'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
          
          <p style={{ marginTop: '20px', color: '#6b7280' }}>
            Check the browser console (F12) for more details.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

