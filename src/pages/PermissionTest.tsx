import React, { useState } from 'react';
import { apiService } from '../services/api';

interface TestResult {
	success: boolean;
	data?: any;
	error?: string;
}

interface Endpoint {
	path: string;
	name: string;
}

const PermissionTest: React.FC = () => {
	const [results, setResults] = useState<Record<string, TestResult>>({});
	const [loading, setLoading] = useState<Record<string, boolean>>({});

	const testEndpoint = async (endpoint: string, name: string): Promise<void> => {
		setLoading(prev => ({ ...prev, [name]: true }));
		try {
			const response = await apiService.get(endpoint);
			setResults(prev => ({ ...prev, [name]: { success: true, data: response } }));
		} catch (err: any) {
			setResults(prev => ({
				...prev,
				[name]: {
					success: false,
					error: err.response?.data || err.message
				}
			}));
		} finally {
			setLoading(prev => ({ ...prev, [name]: false }));
		}
	};

	const endpoints: Endpoint[] = [
		{ path: '/decorator/info', name: 'Decorator Info' },
		{ path: '/decorator/admin-dashboard', name: 'Admin Dashboard (Decorator)' },
		{ path: '/decorator/staff-dashboard', name: 'Staff Dashboard (Decorator)' },
		{ path: '/decorator/student-portal', name: 'Student Portal (Decorator)' },
		{ path: '/decorator/user-list', name: 'User List (Decorator)' },
		{ path: '/decorator/user-management', name: 'User Management (Decorator)' },
		{ path: '/decorator/flexible-access', name: 'Flexible Access (Decorator)' },
		{ path: '/decorator/user-profile', name: 'User Profile (Decorator)' },
		{ path: '/decorator/token-info', name: 'Token Info (Decorator)' },
		{ path: '/decorator/admin-user-delete', name: 'Admin User Delete (Decorator)' },
		{ path: '/decorator/unprotected', name: 'Unprotected Endpoint' }
	];

	return (
		<div style={{ padding: '2rem' }}>
			<h1>Permission Testing</h1>
			<p>Test different permission-based access control endpoints using decorators</p>

			<div style={{ marginBottom: '2rem' }}>
				<button onClick={() => endpoints.forEach(ep => testEndpoint(ep.path, ep.name))}>
					Test All Endpoints
				</button>
			</div>

			{endpoints.map(endpoint => (
				<div key={endpoint.name} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd' }}>
					<h3>{endpoint.name}</h3>
					<p><strong>Endpoint:</strong> {endpoint.path}</p>

					<button
						onClick={() => testEndpoint(endpoint.path, endpoint.name)}
						disabled={loading[endpoint.name]}
						style={{ marginBottom: '1rem' }}
					>
						{loading[endpoint.name] ? 'Testing...' : 'Test'}
					</button>

					{results[endpoint.name] && (
						<div style={{
							padding: '1rem',
							backgroundColor: results[endpoint.name].success ? '#d4edda' : '#f8d7da',
							border: '1px solid #c3e6cb'
						}}>
							<h4>Result:</h4>
							{results[endpoint.name].success ? (
								<pre>{JSON.stringify(results[endpoint.name].data, null, 2)}</pre>
							) : (
								<p style={{ color: 'red' }}>Error: {results[endpoint.name].error}</p>
							)}
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default PermissionTest; 