import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface BookingHistory {
	id: number;
	user: {
		name: string;
		email: string;
	};
	mess: {
		name: string;
		location: string;
	};
	mealSlot: {
		name: string;
		startTime: string;
		endTime: string;
	};
	date: string;
	status: string;
	createdAt: string;
	completedAt?: string;
}

const BookingHistory = () => {
	const [bookings, setBookings] = useState<BookingHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		fetchBookingHistory();
	}, []);

	const fetchBookingHistory = async () => {
		try {
			const response = await apiService.getBookingHistory(user?.user_id || 0);
			setBookings(response);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to load booking history');
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			case 'no-show':
				return 'bg-orange-100 text-orange-800';
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
					<h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
					<p className="text-gray-600">View your past bookings</p>
				</div>



				<div className="bg-white shadow rounded-lg">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Mess
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Meal Slot
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Date
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Booked On
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{bookings.map((booking) => (
									<tr key={booking.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">{booking.mess.name}</div>
												<div className="text-sm text-gray-500">{booking.mess.location}</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">{booking.meal_slot?.type || booking.mealSlot?.name || 'N/A'}</div>
												<div className="text-sm text-gray-500">{booking.meal_slot?.session_time ? `${booking.meal_slot.session_time} hours` : 'N/A'}</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatDate(booking.created_at || booking.date)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.cancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
												{booking.cancelled ? 'Cancelled' : 'Active'}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{bookings.length === 0 && (
						<div className="text-center py-8">
							<p className="text-gray-500">No booking history found</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default BookingHistory; 