import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PATRI Component Render Error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-4xl mx-auto my-8">
          <div className="bg-white/95 border border-red-200 rounded-2xl p-6 md:p-8 shadow-warm-md text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">
                {this.props.fallbackTitle || 'Unable to display this view'}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                A rendering issue occurred while loading this view. The rest of the PATRI portal remains operational.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl text-left max-w-lg mx-auto font-mono text-[11px] text-stone-700 overflow-x-auto">
                <span className="font-bold text-red-700 block mb-1">Error Trace:</span>
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF5E4] hover:bg-[#F5EFE4] border border-[#E7E0D2] text-[#82653D] rounded-xl text-xs font-semibold transition-all shadow-warm-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry View</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all shadow-warm-xs cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reload Portal</span>
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
