import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

interface User {
	user_id: number;
	name: string;
	email: string;
	roll_no: string;
	room_no: string;
	phone: string;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
	date_joined: string;
}

const UserDetails = () => {
	const { userId } = useParams<{ userId: string }>();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

	useEffect(() => {
		if (userId) {
			fetchUser();
		}
	}, [userId]);

	const fetchUser = async () => {
		try {
			const response = await apiService.get(`/user/${userId}/`);
			setUser(response as User);
			// Remove auto-success toast to avoid duplicates
		} catch (err: any) {
			showError('Failed to load user details', err.response?.data?.message || 'Please try again later');
		} finally {
			setLoading(false);
		}
	};

	const getUserRole = (user: User): string => {
		if (user.is_superuser) return 'Admin';
		if (user.is_staff) return 'Staff';
		return 'Student';
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-gray-100 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="text-center">User not found</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-4xl mx-auto">
				<ToastContainer toasts={toasts} onClose={removeToast} />

				<div className="mb-8">
					<Link
						to="/users"
						className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
					>
						← Back to Users
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">User Details</h1>
				</div>

				<div className="bg-white shadow rounded-lg">
					<div className="px-6 py-4 border-b border-gray-200">
						<div className="flex items-center">
							<div className="flex-shrink-0 h-16 w-16">
								<div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
									<span className="text-xl font-medium text-gray-700">
										{user.name.charAt(0).toUpperCase()}
									</span>
								</div>
							</div>
							<div className="ml-6">
								<h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
								<p className="text-gray-600">{user.email}</p>
							</div>
						</div>
					</div>

					<div className="px-6 py-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
								<dl className="space-y-3">
									<div>
										<dt className="text-sm font-medium text-gray-500">Full Name</dt>
										<dd className="text-sm text-gray-900">{user.name}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Email</dt>
										<dd className="text-sm text-gray-900">{user.email}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Phone</dt>
										<dd className="text-sm text-gray-900">{user.phone}</dd>
									</div>
								</dl>
							</div>

							<div>
								<h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
								<dl className="space-y-3">
									<div>
										<dt className="text-sm font-medium text-gray-500">Roll Number</dt>
										<dd className="text-sm text-gray-900">{user.roll_no || 'N/A'}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Room Number</dt>
										<dd className="text-sm text-gray-900">{user.room_no || 'N/A'}</dd>
									</div>
								</dl>
							</div>
						</div>

						<div className="mt-8 pt-6 border-t border-gray-200">
							<h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
							<dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<dt className="text-sm font-medium text-gray-500">Role</dt>
									<dd className="text-sm text-gray-900">
										<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserRole(user) === 'Admin' ? 'bg-red-100 text-red-800' :
											getUserRole(user) === 'Staff' ? 'bg-yellow-100 text-yellow-800' :
												'bg-green-100 text-green-800'
											}`}>
											{getUserRole(user)}
										</span>
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">Status</dt>
									<dd className="text-sm text-gray-900">
										<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
											}`}>
											{user.is_active ? 'Active' : 'Inactive'}
										</span>
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">Joined</dt>
									<dd className="text-sm text-gray-900">
										{new Date(user.date_joined).toLocaleDateString()}
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserDetails; 