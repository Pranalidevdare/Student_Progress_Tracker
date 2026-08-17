import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled render error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full card p-8 bg-white border border-gray-200 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-sm">
              <ShieldAlert size={28} />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900">Something went wrong</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                An unexpected interface error occurred. Please try refreshing the page or navigating back to the home screen.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="btn-primary w-full sm:w-auto text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Refresh Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 w-full sm:w-auto text-xs flex items-center justify-center gap-1.5"
              >
                <Home size={14} />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
