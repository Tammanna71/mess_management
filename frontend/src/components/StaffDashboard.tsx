import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import { Mess, MealSlot, Booking } from '../types';

interface DashboardData {
	mess: Mess[];
	mealSlots: MealSlot[];
	bookings: Booking[];
}

interface NewMess {
	name: string;
	location: string;
	stock: string;
	menu: string;
}

const StaffDashboard: React.FC = () => {
	const { user } = useAuth();
	const [data, setData] = useState<DashboardData>({
		mess: [],
		mealSlots: [],
		bookings: []
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [showCreateMess, setShowCreateMess] = useState(false);
	const [newMess, setNewMess] = useState<NewMess>({
		name: '',
		location: '',
		stock: '',
		menu: ''
	});

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		setLoading(true);
		try {
			const [mess, mealSlots, bookings] = await Promise.all([
				apiService.getAllMess(),
				apiService.getMealSlots(),
				apiService.getBookings()
			]);

			setData({ mess, mealSlots, bookings });
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	const handleCreateMess = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const messData = {
				...newMess,
				stock: parseInt(newMess.stock),
				availability: true,
				current_status: 'Open',
				bookings: 0,
				admin: user?.name || ''
			};

			const createdMess = await apiService.createMess(messData);
			setData(prev => ({
				...prev,
				mess: [...prev.mess, createdMess]
			}));

			setNewMess({ name: '', location: '', stock: '', menu: '' });
			setShowCreateMess(false);
		} catch (err) {
			setError(getErrorMessage(err));
		}
	};

	const toggleMealSlotAvailability = async (slotId: number, currentAvailability: boolean) => {
		try {
			const updatedSlot = await apiService.updateMealSlot(slotId, {
				available: !currentAvailability
			});

			setData(prev => ({
				...prev,
				mealSlots: prev.mealSlots.map(slot =>
					slot.id === slotId ? updatedSlot : slot
				)
			}));
		} catch (err) {
			setError(getErrorMessage(err));
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
			<h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>

			<div className="text-lg mb-6">
				Welcome, {user?.name} - Staff
			</div>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
					{error}
				</div>
			)}

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-blue-100 p-4 rounded-lg">
					<h3 className="font-semibold">Total Mess</h3>
					<p className="text-2xl font-bold">{data.mess.length}</p>
				</div>
				<div className="bg-green-100 p-4 rounded-lg">
					<h3 className="font-semibold">Meal Slots</h3>
					<p className="text-2xl font-bold">{data.mealSlots.length}</p>
				</div>
				<div className="bg-yellow-100 p-4 rounded-lg">
					<h3 className="font-semibold">Today's Bookings</h3>
					<p className="text-2xl font-bold">{data.bookings.length}</p>
				</div>
			</div>

			{/* Mess Management */}
			<div className="bg-white p-6 rounded-lg shadow mb-6">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">Mess Management</h2>
					<button
						onClick={() => setShowCreateMess(true)}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Create New Mess
					</button>
				</div>

				{showCreateMess && (
					<form onSubmit={handleCreateMess} className="mb-6 p-4 border rounded">
						<h3 className="font-semibold mb-3">Create New Mess</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<input
								type="text"
								placeholder="Mess Name"
								value={newMess.name}
								onChange={(e) => setNewMess({ ...newMess, name: e.target.value })}
								className="border p-2 rounded"
								required
							/>
							<input
								type="text"
								placeholder="Location"
								value={newMess.location}
								onChange={(e) => setNewMess({ ...newMess, location: e.target.value })}
								className="border p-2 rounded"
								required
							/>
							<input
								type="number"
								placeholder="Stock"
								value={newMess.stock}
								onChange={(e) => setNewMess({ ...newMess, stock: e.target.value })}
								className="border p-2 rounded"
								required
							/>
							<input
								type="text"
								placeholder="Menu"
								value={newMess.menu}
								onChange={(e) => setNewMess({ ...newMess, menu: e.target.value })}
								className="border p-2 rounded"
								required
							/>
						</div>
						<div className="mt-4 space-x-2">
							<button
								type="submit"
								className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
							>
								Create
							</button>
							<button
								type="button"
								onClick={() => setShowCreateMess(false)}
								className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
							>
								Cancel
							</button>
						</div>
					</form>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{data.mess.map(mess => (
						<div key={mess.mess_id} className="border p-4 rounded">
							<h3 className="font-semibold">{mess.name}</h3>
							<p className="text-sm text-gray-600">Location: {mess.location}</p>
							<p className="text-sm text-gray-600">Stock: {mess.stock}</p>
							<p className="text-sm text-gray-600">Menu: {mess.menu}</p>
							<p className="text-sm text-gray-600">Bookings: {mess.bookings}</p>
							<div className="mt-2">
								<span className={`px-2 py-1 rounded text-xs ${mess.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
									}`}>
									{mess.availability ? 'Available' : 'Unavailable'}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Meal Slots Management */}
			<div className="bg-white p-6 rounded-lg shadow mb-6">
				<h2 className="text-xl font-semibold mb-4">Meal Slots Management</h2>
				<div className="overflow-x-auto">
					<table className="w-full table-auto">
						<thead>
							<tr className="bg-gray-50">
								<th className="px-4 py-2 text-left">Mess ID</th>
								<th className="px-4 py-2 text-left">Type</th>
								<th className="px-4 py-2 text-left">Session Time</th>
								<th className="px-4 py-2 text-left">Available</th>
								<th className="px-4 py-2 text-left">Status</th>
								<th className="px-4 py-2 text-left">Actions</th>
							</tr>
						</thead>
						<tbody>
							{data.mealSlots.map(slot => (
								<tr key={slot.id} className="border-t">
									<td className="px-4 py-2">{slot.mess}</td>
									<td className="px-4 py-2">{slot.type}</td>
									<td className="px-4 py-2">{slot.session_time}</td>
									<td className="px-4 py-2">
										<span className={`px-2 py-1 rounded text-xs ${slot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
											}`}>
											{slot.available ? 'Yes' : 'No'}
										</span>
									</td>
									<td className="px-4 py-2">
										{slot.delayed && (
											<span className="text-orange-600 text-xs">
												Delayed {slot.delay_minutes}min
											</span>
										)}
									</td>
									<td className="px-4 py-2">
										<button
											onClick={() => toggleMealSlotAvailability(slot.id, slot.available)}
											className={`px-3 py-1 rounded text-sm ${slot.available
													? 'bg-red-500 text-white hover:bg-red-600'
													: 'bg-green-500 text-white hover:bg-green-600'
												}`}
										>
											{slot.available ? 'Disable' : 'Enable'}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
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

export default StaffDashboard; 