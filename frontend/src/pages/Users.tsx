import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const Users = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await apiService.getUsers();
			setUsers(response);
			// Remove auto-success toast to avoid duplicates
		} catch (err: any) {
			showError('Failed to load users', err.response?.data?.message || 'Please try again later');
		} finally {
			setLoading(false);
		}
	};

	const filteredUsers = users.filter(user =>
		user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		(user.roll_no && user.roll_no.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const getUserRole = (user: User): string => {
		if (user.is_superuser) return 'Admin';
		if (user.is_staff) return 'Staff';
		return 'Student';
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Users</h1>
					<p className="text-gray-600">Manage all users in the system</p>
				</div>



				<div className="bg-white shadow rounded-lg">
					<div className="px-6 py-4 border-b border-gray-200">
						<div className="flex justify-between items-center">
							<div className="flex-1 max-w-sm">
								<input
									type="text"
									placeholder="Search users..."
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										User
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Contact
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Role
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredUsers.map((user) => {
									const userRole = getUserRole(user);
									return (
										<tr key={user.user_id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="flex-shrink-0 h-10 w-10">
														<div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
															<span className="text-sm font-medium text-gray-700">
																{user.name.charAt(0).toUpperCase()}
															</span>
														</div>
													</div>
													<div className="ml-4">
														<div className="text-sm font-medium text-gray-900">{user.name}</div>
														<div className="text-sm text-gray-500">{user.email}</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900">Roll: {user.roll_no || 'N/A'}</div>
												<div className="text-sm text-gray-500">Room: {user.room_no || 'N/A'}</div>
												<div className="text-sm text-gray-500">{user.phone}</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userRole === 'Admin' ? 'bg-red-100 text-red-800' :
													userRole === 'Staff' ? 'bg-yellow-100 text-yellow-800' :
														'bg-green-100 text-green-800'
													}`}>
													{userRole}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
													}`}>
													{user.is_active ? 'Active' : 'Inactive'}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
												<Link
													to={`/user/${user.user_id}`}
													className="text-indigo-600 hover:text-indigo-900 mr-4"
												>
													View
												</Link>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{filteredUsers.length === 0 && (
						<div className="text-center py-8">
							<p className="text-gray-500">No users found</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Users; 