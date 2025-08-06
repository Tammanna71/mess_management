import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { formatDate } from '../utils/helpers';
import LoadingAnimation from '../components/LoadingAnimation';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

interface Booking {
	booking_id: number;
	user: {
		name: string;
		email: string;
	};
	mess: {
		name: string;
		location: string;
	};
	mealSlot?: {
		name: string;
		startTime: string;
		endTime: string;
	};
	meal_slot?: {
		type: string;
		session_time: number;
		mess: {
			name: string;
			location: string;
		};
	};
	created_at: string;
	cancelled: boolean;
}

const Bookings = () => {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState('all');
	const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

	useEffect(() => {
		fetchBookings();
	}, []);

	const fetchBookings = async () => {
		try {
			const response = await apiService.getBookings();
			setBookings(response);
			// Remove auto-success toast to avoid duplicates
		} catch (err: any) {
			showError('Failed to load bookings', err.response?.data?.message || 'Please try again later');
		} finally {
			setLoading(false);
		}
	};

	const filteredBookings = bookings.filter(booking => {
		if (statusFilter === 'all') return true;
		if (statusFilter === 'active') return !booking.cancelled;
		if (statusFilter === 'cancelled') return booking.cancelled;
		return true;
	});

	const getStatusColor = (cancelled: boolean) => {
		return cancelled
			? 'bg-red-100 text-red-800'
			: 'bg-green-100 text-green-800';
	};

	const getStatusText = (cancelled: boolean) => {
		return cancelled ? 'Cancelled' : 'Active';
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
					<p className="text-gray-600">Manage all bookings</p>
				</div>



				<div className="bg-white shadow rounded-lg">
					<div className="px-6 py-4 border-b border-gray-200">
						<div className="flex justify-between items-center">
							<div className="flex space-x-4">
								<select
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
								>
									<option value="all">All Status</option>
									<option value="active">Active</option>
									<option value="cancelled">Cancelled</option>
								</select>
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
										Mess
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Meal Slot
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Created
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredBookings.map((booking) => (
									<tr key={booking.booking_id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
												<div className="text-sm text-gray-500">{booking.user.email}</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">{booking.mess.name}</div>
												<div className="text-sm text-gray-500">{booking.mess.location}</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">{booking.meal_slot?.type || booking.mealSlot?.name || 'N/A'}</div>
												<div className="text-sm text-gray-500">{booking.meal_slot?.session_time || 'N/A'}</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.cancelled)}`}>
												{getStatusText(booking.cancelled)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatDate(booking.created_at)}
										</td>

									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredBookings.length === 0 && (
						<div className="text-center py-8">
							<p className="text-gray-500">No bookings found</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Bookings; 