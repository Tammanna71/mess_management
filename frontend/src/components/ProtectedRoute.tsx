import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRouteProps } from '../types';
import { hasRequiredRole, hasPermission } from '../utils/helpers';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredRoles = [],
	requiredPermissions = []
}) => {
	const { user, loading, isAuthenticated } = useAuth();

	// Show loading spinner while checking authentication
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Redirect to home if not authenticated
	if (!isAuthenticated || !user) {
		return <Navigate to="/" replace />;
	}

	// Check role requirements
	if (requiredRoles.length > 0 && !hasRequiredRole(user, requiredRoles)) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center max-w-md mx-auto p-6">
					<div className="mb-4">
						<svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
					<p className="text-gray-600 mb-6">
						You don't have the required permissions to access this section of the mess management system.
					</p>
					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Go Back
					</button>
				</div>
			</div>
		);
	}

	// Check permission requirements
	if (requiredPermissions.length > 0) {
		const hasAllRequiredPermissions = requiredPermissions.every(permission =>
			hasPermission(user, permission)
		);

		if (!hasAllRequiredPermissions) {
			return (
				<div className="min-h-screen flex items-center justify-center bg-gray-50">
					<div className="text-center max-w-md mx-auto p-6">
						<div className="mb-4">
							<svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
						<p className="text-gray-600 mb-6">
							You don't have the required permissions to access this section of the mess management system.
						</p>
						<button
							onClick={() => window.history.back()}
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							<svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
							Go Back
						</button>
					</div>
				</div>
			);
		}
	}

	// User is authenticated and has required roles/permissions
	return <>{children}</>;
};

export default ProtectedRoute; 