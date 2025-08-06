import React, { Component, ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error('Error caught by boundary:', error, errorInfo);
		this.setState({ error, errorInfo });
	}

	render(): ReactNode {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center bg-gray-50">
					<div className="text-center max-w-md mx-auto p-6">
						<div className="mb-4">
							<svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
						<p className="text-gray-600 mb-6">
							An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
						</p>
						<button
							onClick={() => window.location.reload()}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							Refresh Page
						</button>
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className="mt-4 text-left">
								<summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
									Error Details (Development)
								</summary>
								<pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
									{this.state.error.toString()}
									{this.state.errorInfo && `\n\n${this.state.errorInfo.componentStack}`}
								</pre>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary; 