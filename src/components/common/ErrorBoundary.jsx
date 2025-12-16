import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-main-bg text-main-text p-4 text-center">
          <div className="bg-red-50 p-6 rounded-full mb-6 animate-bounce">
            <AlertTriangle size={64} className="text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">عذراً، حدث خطأ غير متوقع!</h1>
          <p className="text-second-text/70 mb-8 max-w-md text-lg">
            لم نتمكن من عرض هذه الصفحة. قد يكون السبب انقطاع في الاتصال أو خطأ برمجي بسيط.
          </p>

          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 bg-main-accent text-main-text px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
          >
            <RefreshCw size={20} />
            تحديث الصفحة
          </button>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-10 p-4 bg-gray-100 rounded-lg text-left text-xs font-mono text-red-600 w-full max-w-2xl overflow-auto dir-ltr">
              {this.state.error && this.state.error.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;