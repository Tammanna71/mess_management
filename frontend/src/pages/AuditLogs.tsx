import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import LoadingAnimation from '../components/LoadingAnimation';



interface AuditLog {
	id: number;
	performed_by: string;  // Backend returns string, not object
	action: string;
	details: string;
	timestamp: string;
}


const AuditLogs = () => {
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		fetchAuditLogs();
	}, []);

	const fetchAuditLogs = async () => {
		try {
			const response = await apiService.getAuditLogs();
			setAuditLogs(response);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to load audit logs');
		} finally {
			setLoading(false);
		}
	};

	const getActionColor = (action: string) => {
		switch (action.toLowerCase()) {
			case 'create':
				return 'bg-green-100 text-green-800';
			case 'update':
				return 'bg-blue-100 text-blue-800';
			case 'delete':
				return 'bg-red-100 text-red-800';
			case 'login':
				return 'bg-purple-100 text-purple-800';
			case 'logout':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-yellow-100 text-yellow-800';
		}
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
					<p className="text-gray-600">View system activity logs</p>
				</div>



				<div className="bg-white shadow rounded-lg">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										User
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Action
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Details
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Timestamp
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{auditLogs.map((log) => (
									<tr key={log.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{log.performed_by || 'Unknown User'}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
												{log.action}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
											{log.details || 'No details available'}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDateTime(log.timestamp)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{auditLogs.length === 0 && (
						<div className="text-center py-8">
							<p className="text-gray-500">No audit logs found</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AuditLogs; 