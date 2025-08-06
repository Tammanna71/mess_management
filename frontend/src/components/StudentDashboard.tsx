import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import { Mess, MealSlot, Booking, Coupon } from '../types';

interface DashboardData {
	mess: Mess[];
	availableMeals: MealSlot[];
	myBookings: Booking[];
	myCoupons: Coupon[];
}

const StudentDashboard: React.FC = () => {
	const { user } = useAuth();
	const [data, setData] = useState<DashboardData>({
		mess: [],
		availableMeals: [],
		myBookings: [],
		myCoupons: []
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		setLoading(true);
		try {
			const [mess, availableMeals, myBookings, myCoupons] = await Promise.all([
				apiService.getAllMess(),
				apiService.getMealAvailability(),
				apiService.getBookingHistory(user?.user_id || 0),
				apiService.getMyCoupons().catch(() => [])
			]);

			setData({ mess, availableMeals, myBookings, myCoupons });
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	const handleBookMeal = async (mealSlotId: number) => {
		try {
			const bookingData = {
				userId: user?.user_id || 0,
				mealSlotId: mealSlotId
			};

			await apiService.createBooking(bookingData);
			setSuccess('Meal booked successfully!');

			// Refresh data
			setTimeout(() => {
				fetchDashboardData();
				setSuccess('');
			}, 2000);
		} catch (err) {
			setError(getErrorMessage(err));
			setTimeout(() => setError(''), 3000);
		}
	};

	const handleCancelBooking = async (bookingId: number) => {
		if (window.confirm('Are you sure you want to cancel this booking?')) {
			try {
				await apiService.deleteBooking(bookingId);
				setSuccess('Booking cancelled successfully!');

				// Refresh bookings
				setTimeout(() => {
					fetchDashboardData();
					setSuccess('');
				}, 2000);
			} catch (err) {
				setError(getErrorMessage(err));
				setTimeout(() => setError(''), 3000);
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
			<h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

			<div className="text-lg mb-6">
				Welcome, {user?.name} - {user?.roll_no}
			</div>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
					{error}
				</div>
			)}

			{success && (
				<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
					{success}
				</div>
			)}

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-blue-100 p-4 rounded-lg">
					<h3 className="font-semibold">Available Mess</h3>
					<p className="text-2xl font-bold">{data.mess.length}</p>
				</div>
				<div className="bg-green-100 p-4 rounded-lg">
					<h3 className="font-semibold">Available Meals</h3>
					<p className="text-2xl font-bold">{data.availableMeals.length}</p>
				</div>
				<div className="bg-yellow-100 p-4 rounded-lg">
					<h3 className="font-semibold">My Bookings</h3>
					<p className="text-2xl font-bold">{data.myBookings.length}</p>
				</div>
				<div className="bg-purple-100 p-4 rounded-lg">
					<h3 className="font-semibold">My Coupons</h3>
					<p className="text-2xl font-bold">{data.myCoupons.length}</p>
				</div>
			</div>

			{/* Available Mess */}
			<div className="bg-white p-6 rounded-lg shadow mb-6">
				<h2 className="text-xl font-semibold mb-4">Available Mess</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{data.mess.map(mess => (
						<div key={mess.mess_id} className="border p-4 rounded">
							<h3 className="font-semibold">{mess.name}</h3>
							<p className="text-sm text-gray-600">Location: {mess.location}</p>
							<p className="text-sm text-gray-600">Menu: {mess.menu}</p>
							<p className="text-sm text-gray-600">Available Stock: {mess.stock}</p>
							<div className="mt-2">
								<span className={`px-2 py-1 rounded text-xs ${mess.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
									}`}>
									{mess.availability ? 'Available' : 'Closed'}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Available Meal Slots */}
			<div className="bg-white p-6 rounded-lg shadow mb-6">
				<h2 className="text-xl font-semibold mb-4">Book Meals</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{data.availableMeals.map(meal => (
						<div key={meal.id} className="border p-4 rounded">
							<h3 className="font-semibold">{meal.type}</h3>
							<p className="text-sm text-gray-600">Mess ID: {meal.mess}</p>
							<p className="text-sm text-gray-600">Time: {meal.session_time}</p>
							<div className="mt-3">
								{meal.available ? (
									<button
										onClick={() => handleBookMeal(meal.id)}
										className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
									>
										Book Now
									</button>
								) : (
									<button
										disabled
										className="bg-gray-300 text-gray-500 px-4 py-2 rounded w-full cursor-not-allowed"
									>
										Not Available
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* My Bookings */}
			<div className="bg-white p-6 rounded-lg shadow mb-6">
				<h2 className="text-xl font-semibold mb-4">My Bookings</h2>
				<div className="overflow-x-auto">
					<table className="w-full table-auto">
						<thead>
							<tr className="bg-gray-50">
								<th className="px-4 py-2 text-left">Booking ID</th>
								<th className="px-4 py-2 text-left">Meal Slot</th>
								<th className="px-4 py-2 text-left">Booked At</th>
								<th className="px-4 py-2 text-left">Status</th>
								<th className="px-4 py-2 text-left">Actions</th>
							</tr>
						</thead>
						<tbody>
							{data.myBookings.map(booking => (
								<tr key={booking.booking_id} className="border-t">
									<td className="px-4 py-2">{booking.booking_id}</td>
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
									<td className="px-4 py-2">
										{!booking.cancelled && (
											<button
												onClick={() => handleCancelBooking(booking.booking_id)}
												className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
											>
												Cancel
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* My Coupons */}
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">My Coupons</h2>
				{data.myCoupons.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{data.myCoupons.map(coupon => (
							<div key={coupon.c_id} className="border p-4 rounded">
								<h3 className="font-semibold">Coupon #{coupon.c_id}</h3>
								<p className="text-sm text-gray-600">Meal: {coupon.meal_type}</p>
								<p className="text-sm text-gray-600">Mess: {coupon.mess_name}</p>
								<p className="text-sm text-gray-600">Time: {coupon.session_time}</p>
								<p className="text-sm text-gray-600">Location: {coupon.location}</p>
								<div className="mt-2">
									<span className={`px-2 py-1 rounded text-xs ${coupon.cancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
										}`}>
										{coupon.cancelled ? 'Used/Cancelled' : 'Valid'}
									</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500">No coupons available</p>
				)}
			</div>
		</div>
	);
};

export default StudentDashboard; 