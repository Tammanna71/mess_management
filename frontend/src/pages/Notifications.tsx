import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import LoadingAnimation from '../components/LoadingAnimation';

interface Notification {
	id: number;
	title: string;
	message: string;
	type: string;
	isRead: boolean;
	createdAt: string;
	targetUser?: {
		name: string;
		email: string;
	};
}

const Notifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		fetchNotifications();
	}, []);

	const fetchNotifications = async () => {
		try {
			const response = await apiService.getNotifications();
			setNotifications(response);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to load notifications');
		} finally {
			setLoading(false);
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'info':
				return 'bg-blue-100 text-blue-800';
			case 'success':
				return 'bg-green-100 text-green-800';
			case 'warning':
				return 'bg-yellow-100 text-yellow-800';
			case 'error':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
					<p className="text-gray-600">Manage system notifications</p>
				</div>



				<div className="space-y-4">
					{notifications.map((notification) => (
						<div key={notification.id} className={`bg-white shadow rounded-lg p-6 ${!notification.isRead ? 'border-l-4 border-blue-500' : ''}`}>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center space-x-3 mb-2">
										<h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
										<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
											{notification.type}
										</span>
										{!notification.isRead && (
											<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
												New
											</span>
										)}
									</div>
									<p className="text-gray-600 mb-3">{notification.message}</p>
									{notification.targetUser && (
										<div className="text-sm text-gray-500 mb-2">
											Target: {notification.targetUser.name} ({notification.targetUser.email})
										</div>
									)}
									<div className="text-sm text-gray-500">
										{new Date(notification.createdAt).toLocaleString()}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{notifications.length === 0 && (
					<div className="text-center py-8">
						<p className="text-gray-500">No notifications found</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Notifications; 