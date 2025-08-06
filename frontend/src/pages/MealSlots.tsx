import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import LoadingAnimation from '../components/LoadingAnimation';

interface MealSlot {
	id: number;
	mess: number;
	mess_name?: string;
	mess_location?: string;
	type: string;
	available: boolean;
	session_time: number;
	delayed: boolean;
	delay_minutes?: number;
	reserve_meal: boolean;
	booking_count?: number;
}

const MealSlots = () => {
	const [mealSlots, setMealSlots] = useState<MealSlot[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		fetchMealSlots();
	}, []);

	const fetchMealSlots = async () => {
		try {
			const response = await apiService.getMealSlots();
			setMealSlots(response);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to load meal slots');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Meal Slots</h1>
					<p className="text-gray-600">Manage meal time slots</p>
				</div>



				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{mealSlots.map((slot) => (
						<div key={slot.id} className="bg-white shadow rounded-lg overflow-hidden">
							<div className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-medium text-gray-900">{slot.type}</h3>
									<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${slot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
										}`}>
										{slot.available ? 'Available' : 'Unavailable'}
									</span>
								</div>

								<div className="space-y-3 mb-4">
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Mess:</span>
										<span className="text-gray-900">{slot.mess_name || `Mess #${slot.mess}`}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Location:</span>
										<span className="text-gray-900">{slot.mess_location || 'N/A'}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Session Time:</span>
										<span className="text-gray-900">{slot.session_time} hours</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Current Bookings:</span>
										<span className="text-gray-900">{slot.booking_count || 0}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Reserve Meal:</span>
										<span className="text-gray-900">{slot.reserve_meal ? 'Yes' : 'No'}</span>
									</div>
									{slot.delayed && (
										<div className="flex justify-between text-sm">
											<span className="text-gray-500">Delay:</span>
											<span className="text-gray-900">{slot.delay_minutes || 0} minutes</span>
										</div>
									)}
								</div>

								<div className="mb-4">
									<div className="flex items-center space-x-2">
										{slot.delayed && (
											<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
												Delayed
											</span>
										)}
										{slot.reserve_meal && (
											<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
												Reservable
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{mealSlots.length === 0 && (
					<div className="text-center py-8">
						<p className="text-gray-500">No meal slots found</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default MealSlots; 