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

const RoleTest: React.FC = () => {
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
		{ path: '/token/info', name: 'Token Info' },
		{ path: '/test/role-based', name: 'Role-Based Access' },
		{ path: '/test/permission-based', name: 'Permission-Based Access' },
		{ path: '/test/superuser-only', name: 'Superuser Only' },
		{ path: '/test/student-only', name: 'Student Only' },
		{ path: '/test/flexible-permission', name: 'Flexible Permission' },
		{ path: '/test/complex-permission', name: 'Complex Permission' }
	];

	return (
		<div style={{ padding: '2rem' }}>
			<h1>Role & Permission Testing</h1>
			<p>Test different role-based and permission-based access control endpoints</p>

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

export default RoleTest; 