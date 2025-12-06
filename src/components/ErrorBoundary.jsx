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
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', height: '100vh', overflow: 'auto' }}>
                    <h1 style={{ color: '#d32f2f' }}>Something went wrong.</h1>
                    <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '1rem', background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
                        <summary>Click for error details</summary>
                        <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '2rem', padding: '0.8rem 1.5rem', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
