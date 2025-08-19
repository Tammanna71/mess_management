import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

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
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [messes, setMesses] = useState([]);
	const [formData, setFormData] = useState({
		mess: '',
		type: '',
		session_time: '',
		available: true,
		delayed: false,
		delay_minutes: '',
		reserve_meal: false
	});
	const [formLoading, setFormLoading] = useState(false);
	const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

	useEffect(() => {
		fetchMealSlots();
		fetchMesses();
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

	const fetchMesses = async () => {
		try {
			const response = await apiService.getAllMess();
			setMesses(response);
		} catch (err: any) {
			showError('Failed to load messes', err.response?.data?.message || 'Please try again later');
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		let processedValue: any = value;
		
		if (type === 'checkbox') {
			processedValue = (e.target as HTMLInputElement).checked;
		} else if (name === 'session_time' || name === 'delay_minutes') {
			processedValue = parseFloat(value) || 0;
		}
		
		setFormData(prev => ({
			...prev,
			[name]: processedValue
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormLoading(true);

		try {
			await apiService.createMealSlot(formData);
			showSuccess('Meal slot created successfully!');
			setFormData({
				mess: '',
				type: '',
				session_time: '',
				available: true,
				delayed: false,
				delay_minutes: '',
				reserve_meal: false
			});
			setShowCreateForm(false);
			fetchMealSlots(); // Refresh the list
		} catch (err: any) {
			showError('Failed to create meal slot', err.response?.data?.message || 'Please try again later');
		} finally {
			setFormLoading(false);
		}
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	return (
		<>
			<div className="min-h-screen bg-gray-100 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="mb-8">
						<div className="flex justify-between items-center">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">Meal Slots</h1>
								<p className="text-gray-600">Manage meal time slots</p>
							</div>
							<button
								onClick={() => setShowCreateForm(!showCreateForm)}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
							>
								{showCreateForm ? 'Cancel' : 'Create Meal Slot'}
							</button>
						</div>
					</div>

					{/* Create Meal Slot Form */}
					{showCreateForm && (
						<div className="mb-8 bg-white shadow rounded-lg p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Meal Slot</h2>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Mess
										</label>
										<select
											name="mess"
											value={formData.mess}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="">Select a mess</option>
											{messes.map((mess: any) => (
												<option key={mess.mess_id} value={mess.mess_id}>
													{mess.name} - {mess.location}
												</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Meal Type
										</label>
										<select
											name="type"
											value={formData.type}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="">Select meal type</option>
											<option value="Breakfast">Breakfast</option>
											<option value="Lunch">Lunch</option>
											<option value="Dinner">Dinner</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Session Time
										</label>
										<select
											name="session_time"
											value={formData.session_time}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="">Select time</option>
											<option value="8">8:00 AM</option>
											<option value="13">1:00 PM</option>
											<option value="20">8:00 PM</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Delay Minutes
										</label>
										<input
											type="number"
											name="delay_minutes"
											value={formData.delay_minutes}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="0 (no delay)"
										/>
									</div>
								</div>
								<div className="flex items-center space-x-6">
									<label className="flex items-center">
										<input
											type="checkbox"
											name="available"
											checked={formData.available}
											onChange={handleInputChange}
											className="mr-2"
										/>
										<span className="text-sm text-gray-700">Available</span>
									</label>
									<label className="flex items-center">
										<input
											type="checkbox"
											name="delayed"
											checked={formData.delayed}
											onChange={handleInputChange}
											className="mr-2"
										/>
										<span className="text-sm text-gray-700">Delayed</span>
									</label>
									<label className="flex items-center">
										<input
											type="checkbox"
											name="reserve_meal"
											checked={formData.reserve_meal}
											onChange={handleInputChange}
											className="mr-2"
										/>
										<span className="text-sm text-gray-700">Reserve Meal</span>
									</label>
								</div>
								<div className="flex justify-end space-x-3">
									<button
										type="button"
										onClick={() => setShowCreateForm(false)}
										className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={formLoading}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
									>
										{formLoading ? 'Creating...' : 'Create Meal Slot'}
									</button>
								</div>
							</form>
						</div>
					)}



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
			<ToastContainer toasts={toasts} onClose={removeToast} />
		</>
	);
};

export default MealSlots; 