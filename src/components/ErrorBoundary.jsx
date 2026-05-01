import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-main p-4">
          <div className="card-neo max-w-md w-full text-center p-8 bg-white">
            <div className="text-danger mb-4">
              <i className="fa-solid fa-triangle-exclamation text-6xl"></i>
            </div>
            <h1 className="text-2xl font-black mb-2 uppercase italic text-text-dark">
              Waduh, Error!
            </h1>
            <p className="text-text-muted mb-6 font-bold text-sm">
              Terjadi kesalahan tak terduga. Jangan panik, ini bukan salahmu (mungkin).
            </p>
            <div className="bg-danger/5 border-2 border-dashed border-danger p-3 rounded-xl mb-6 text-left overflow-auto max-h-32">
               <code className="text-[0.6rem] text-danger font-bold">
                 {this.state.error?.toString()}
               </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn-neo"
            >
              MUAT ULANG HALAMAN
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
