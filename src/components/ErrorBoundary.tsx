import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-800 p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
            <p className="mb-2">We're sorry, but an unexpected error occurred.</p>
            {this.state.error && (
              <p className="font-mono text-sm bg-red-200 p-2 rounded-md break-all">
                Error: {this.state.error.message}
              </p>
            )}
            {this.state.errorInfo && (
              <details className="mt-4 text-left text-xs">
                <summary>Error Details</summary>
                <pre className="whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            {this.props.fallback || (
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reload Page
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;