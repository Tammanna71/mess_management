import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import { User, Mess, Booking, MessUsageReport, AuditLog } from '../types';

interface DashboardData {
	users: User[];
	mess: Mess[];
	bookings: Booking[];
	reports: MessUsageReport[] | null;
	auditLogs: AuditLog[];
}

const AdminDashboard: React.FC = () => {
	const { user } = useAuth();
	const [data, setData] = useState<DashboardData>({
		users: [],
		mess: [],
		bookings: [],
		reports: null,
		auditLogs: []
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		setLoading(true);
		try {
			const [users, mess, bookings, reports, auditLogs] = await Promise.all([
				apiService.getUsers(),
				apiService.getAllMess(),
				apiService.getBookings(),
				apiService.getMessUsageReport().catch(() => []),
				apiService.getAuditLogs().catch(() => [])
			]);

			setData({
				users,
				mess,
				bookings,
				reports,
				auditLogs
			});
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteUser = async (userId: number) => {
		if (window.confirm('Are you sure you want to delete this user?')) {
			try {
				await apiService.deleteUser(userId);
				setData(prev => ({
					...prev,
					users: prev.users.filter(u => u.user_id !== userId)
				}));
			} catch (err) {
				setError(getErrorMessage(err));
			}
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg">Loading Dashboard...</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

			<div className="text-lg mb-6">
				Welcome, {user?.name} - {user?.is_superuser ? 'Superuser' : user?.is_staff ? 'Staff' : 'Student'}
			</div>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
					{error}
				</div>
			)}

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-blue-100 p-4 rounded-lg">
					<h3 className="font-semibold">Total Users</h3>
					<p className="text-2xl font-bold">{data.users.length}</p>
				</div>
				<div className="bg-green-100 p-4 rounded-lg">
					<h3 className="font-semibold">Total Mess</h3>
					<p className="text-2xl font-bold">{data.mess.length}</p>
				</div>
				<div className="bg-yellow-100 p-4 rounded-lg">
					<h3 className="font-semibold">Total Bookings</h3>
					<p className="text-2xl font-bold">{data.bookings.length}</p>
				</div>
				<div className="bg-purple-100 p-4 rounded-lg">
					<h3 className="font-semibold">Audit Logs</h3>
					<p className="text-2xl font-bold">{data.auditLogs.length}</p>
				</div>
			</div>

			{/* Users Management */}
			<div className="bg-white p-6 rounded-lg shadow mb-6">
				<h2 className="text-xl font-semibold mb-4">User Management</h2>
				<div className="overflow-x-auto">
					<table className="w-full table-auto">
						<thead>
							<tr className="bg-gray-50">
								<th className="px-4 py-2 text-left">Name</th>
								<th className="px-4 py-2 text-left">Email</th>
								<th className="px-4 py-2 text-left">Phone</th>
								<th className="px-4 py-2 text-left">Roll No</th>
								<th className="px-4 py-2 text-left">Status</th>
								<th className="px-4 py-2 text-left">Actions</th>
							</tr>
						</thead>
						<tbody>
							{data.users.map(user => (
								<tr key={user.user_id} className="border-t">
									<td className="px-4 py-2">{user.name}</td>
									<td className="px-4 py-2">{user.email}</td>
									<td className="px-4 py-2">{user.phone}</td>
									<td className="px-4 py-2">{user.roll_no}</td>
									<td className="px-4 py-2">
										<span className={`px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
											}`}>
											{user.is_active ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td className="px-4 py-2">
										<button
											onClick={() => handleDeleteUser(user.user_id)}
											className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Mess Overview */}
			<div className="bg-white p-6 rounded-lg shadow mb-6">
				<h2 className="text-xl font-semibold mb-4">Mess Overview</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{data.mess.map(mess => (
						<div key={mess.mess_id} className="border p-4 rounded">
							<h3 className="font-semibold">{mess.name}</h3>
							<p className="text-sm text-gray-600">Location: {mess.location}</p>
							<p className="text-sm text-gray-600">Stock: {mess.stock}</p>
							<p className="text-sm text-gray-600">Bookings: {mess.bookings}</p>
							<p className="text-sm text-gray-600">Status: {mess.current_status}</p>
						</div>
					))}
				</div>
			</div>

			{/* Recent Bookings */}
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
				<div className="overflow-x-auto">
					<table className="w-full table-auto">
						<thead>
							<tr className="bg-gray-50">
								<th className="px-4 py-2 text-left">Booking ID</th>
								<th className="px-4 py-2 text-left">User ID</th>
								<th className="px-4 py-2 text-left">Meal Slot</th>
								<th className="px-4 py-2 text-left">Created At</th>
								<th className="px-4 py-2 text-left">Status</th>
							</tr>
						</thead>
						<tbody>
							{data.bookings.slice(0, 10).map(booking => (
								<tr key={booking.booking_id} className="border-t">
									<td className="px-4 py-2">{booking.booking_id}</td>
									<td className="px-4 py-2">{booking.user}</td>
									<td className="px-4 py-2">{booking.meal_slot}</td>
									<td className="px-4 py-2">
										{new Date(booking.created_at).toLocaleDateString()}
									</td>
									<td className="px-4 py-2">
										<span className={`px-2 py-1 rounded text-xs ${booking.cancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
											}`}>
											{booking.cancelled ? 'Cancelled' : 'Active'}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard; 