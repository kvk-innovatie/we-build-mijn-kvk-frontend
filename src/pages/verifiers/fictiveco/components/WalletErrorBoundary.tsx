import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class WalletErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WalletErrorBoundary caught an error:', error, errorInfo);

    if (error.message?.includes('recentlyCreatedOwnerStacks')) {
      console.log('This is the known wallet-connect-button-react compatibility issue with React 18.3.1');
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-center">
            <h4 className="font-medium text-orange-900 mb-2">Wallet Connection Temporarily Unavailable</h4>
            <p className="text-sm text-orange-700 mb-3">
              There's a compatibility issue with the wallet component. You can still proceed with manual document upload.
            </p>
            <div className="space-y-2">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                Try Again
              </Button>
              <p className="text-xs text-orange-600">
                This issue has been reported to the wallet component maintainer.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WalletErrorBoundary;
