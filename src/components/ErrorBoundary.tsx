import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      info: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '40px 20px',
          background: '#09090b',
          color: '#fafafa',
          zIndex: 99999,
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#f43f5e' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 24px 0' }}>
              A runtime rendering error occurred. You can clear your wizard cache and reload to try again.
            </p>
            
            <div style={{
              background: '#09090b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '24px',
              maxHeight: '200px'
            }}>
              <pre style={{ margin: 0, color: '#f43f5e', fontSize: '12px', fontWeight: 'bold' }}>
                {this.state.error?.toString()}
              </pre>
              <pre style={{ margin: '8px 0 0 0', color: '#a1a1aa', fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                {this.state.info?.componentStack}
              </pre>
            </div>

            <button 
              onClick={() => {
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(to right, #f97316, #ea580c)',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(234, 88, 12, 0.3)',
                transition: 'all 0.2s',
                fontSize: '14px'
              }}
            >
              Clear Session & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
