import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

interface Mess {
	mess_id: number;
	name: string;
	location: string;
	availability: boolean;
	stock?: number;
	admin?: string;
	current_status?: string;
	bookings?: number;
	menu?: string;
}

interface BookingFormData {
	userId: number;
	mealSlotId: number;
	date: string;
	mealType: string;
	messId: number;
}

interface MealBookingFormProps {
	onBookingSuccess?: () => void;
	showSuccess: (title: string, message?: string) => void;
	showError: (title: string, message?: string) => void;
}

const MealBookingForm: React.FC<MealBookingFormProps> = ({ onBookingSuccess, showSuccess, showError }) => {
	const { user } = useAuth();
	
	const [formData, setFormData] = useState<BookingFormData>({
		userId: user?.user_id || 0,
		mealSlotId: 0,
		date: '',
		mealType: '',
		messId: 0
	});
	
	const [availableMeals, setAvailableMeals] = useState<MealSlot[]>([]);
	const [messes, setMesses] = useState<Mess[]>([]);
	const [loading, setLoading] = useState(false);
	const [formLoading, setFormLoading] = useState(false);

	useEffect(() => {
		fetchInitialData();
	}, []);

	// Update userId when user changes
	useEffect(() => {
		if (user?.user_id) {
			setFormData(prev => ({
				...prev,
				userId: user.user_id
			}));
		}
	}, [user]);

	const fetchInitialData = async () => {
		setLoading(true);
		try {
			const [meals, messData] = await Promise.all([
				apiService.getMealAvailability(),
				apiService.getAllMess()
			]);
			
			setAvailableMeals(meals);
			setMesses(messData);
		} catch (err: any) {
			console.error('❌ Error fetching data:', err);
			showError('Failed to load data', err.response?.data?.message || 'Please try again later');
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		
		// Convert numeric fields to numbers
		let processedValue: string | number = value;
		if (name === 'messId' || name === 'mealSlotId') {
			processedValue = value ? parseInt(value, 10) : 0;
		}
		
		setFormData(prev => {
			const newData = {
				...prev,
				[name]: processedValue
			};
			
			// Reset dependent fields when parent selections change
			if (name === 'date') {
				newData.mealType = '';
				newData.mealSlotId = 0;
			} else if (name === 'messId' || name === 'mealType') {
				newData.mealSlotId = 0;
			}
			
			return newData;
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Validation
		const validationErrors = [];
		
		if (!formData.userId || formData.userId <= 0) {
			validationErrors.push('Invalid user ID');
		}
		if (!formData.mealSlotId || formData.mealSlotId <= 0) {
			validationErrors.push('Please select a time slot');
		}
		if (!formData.date) {
			validationErrors.push('Please select a date');
		}
		if (!formData.mealType) {
			validationErrors.push('Please select a meal type');
		}
		if (!formData.messId || formData.messId <= 0) {
			validationErrors.push('Please select a mess');
		}
		
		if (validationErrors.length > 0) {
			showError('Validation Error', validationErrors.join(', '));
			return;
		}

		// Check if user already has a booking for this meal slot
		try {
			const existingBookings = await apiService.getBookings();
			const hasExistingBooking = (existingBookings as any[]).some((booking: any) => 
				booking.meal_slot?.id === formData.mealSlotId && !booking.cancelled
			);
			
			if (hasExistingBooking) {
				console.log('❌ Existing booking found');
				showError('Booking Error', 'You already have a booking for this meal slot. Please cancel the existing booking first.');
				return;
			}
		} catch (error) {
			console.log('⚠️ Could not check existing bookings, proceeding...');
		}

		// Validate date is not in the past
		const selectedDate = new Date(formData.date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		if (selectedDate < today) {
			console.log('❌ Date validation failed - past date selected');
			showError('Validation Error', 'Cannot book meals for past dates');
			return;
		}

		setFormLoading(true);
		try {
			const bookingData = {
				userId: formData.userId,
				mealSlotId: formData.mealSlotId
			};
			
			console.log('📤 Sending booking request:', bookingData);
			const response = await apiService.createBooking(bookingData);
			console.log('✅ Booking response:', response);
			
			console.log('🎉 About to show success toast...');
			showSuccess('Meal booked successfully!');
			console.log('🎉 Success toast called!');
			
			// Reset form
			setFormData({
				userId: user?.user_id || 0,
				mealSlotId: 0,
				date: '',
				mealType: '',
				messId: 0
			});
			
			// Refresh available meals
			fetchInitialData();
			
			// Notify parent component
			if (onBookingSuccess) {
				onBookingSuccess();
			}
		} catch (err: any) {
			console.error('❌ Booking failed:', err);
			
			// Show specific error messages
			let errorMessage = 'Booking failed. ';
			if (err.response?.data?.detail) {
				errorMessage += err.response.data.detail;
			} else if (err.response?.data?.message) {
				errorMessage += err.response.data.message;
			} else if (err.message) {
				errorMessage += err.message;
			} else {
				errorMessage += 'Please try again later.';
			}
			
			showError('Booking Failed', errorMessage);
		} finally {
			setFormLoading(false);
		}
	};

	const getAvailableMealsForDate = () => {
		if (!formData.date) return [];
		
		const selectedDate = new Date(formData.date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		// Filter meals that are available and for future dates
		const filtered = availableMeals.filter(meal => 
			meal.available && 
			selectedDate >= today
		);
		
		return filtered;
	};

	const getMealTypes = () => {
		const meals = getAvailableMealsForDate();
		const types = [...new Set(meals.map(meal => meal.type))];
		return types;
	};

	const getAvailableSlots = () => {
		if (!formData.mealType || !formData.date) return [];
		
		const meals = getAvailableMealsForDate();
		
		// First filter by meal type
		let filteredMeals = meals.filter(meal => meal.type === formData.mealType);
		
		// If mess is selected, filter by mess as well
		if (formData.messId) {
			filteredMeals = filteredMeals.filter(meal => meal.mess === formData.messId);
		}
		
		return filteredMeals;
	};

	const getAllAvailableSlotsForMealType = () => {
		if (!formData.mealType || !formData.date) return [];
		
		const meals = getAvailableMealsForDate();
		return meals.filter(meal => meal.type === formData.mealType);
	};

	// Check if form is ready to submit
	const isFormValid = () => {
		const valid = !!(
			formData.userId && 
			formData.mealSlotId && 
			formData.date && 
			formData.mealType && 
			formData.messId
		);
		return valid;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="bg-white p-6 rounded-lg shadow">
			<h2 className="text-xl font-semibold mb-6">Book a Meal</h2>
			
			{/* User Info */}
			<div className="mb-6 p-4 bg-blue-50 rounded-lg">
				<h3 className="text-sm font-medium text-blue-800 mb-2">Booking for:</h3>
				<div className="text-sm text-blue-700">
					<div><strong>Name:</strong> {user?.name || 'N/A'}</div>
					<div><strong>Roll No:</strong> {user?.roll_no || 'N/A'}</div>
					<div><strong>Room:</strong> {user?.room_no || 'N/A'}</div>
					<div><strong>User ID:</strong> {user?.user_id || 'N/A'}</div>
					<div><strong>Phone:</strong> {user?.phone || 'N/A'}</div>
				</div>
			</div>
			
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Instructions */}
				<div className="p-4 bg-gray-50 rounded-lg">
					<p className="text-sm text-gray-600">
						<strong>How to book:</strong> Select a date, choose your preferred mess, 
						select the meal type, and pick an available time slot.
					</p>
				</div>

				{/* Date Selection */}
				<div>
					<label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
						Date *
					</label>
					<input
						type="date"
						id="date"
						name="date"
						value={formData.date}
						onChange={handleInputChange}
						min={new Date().toISOString().split('T')[0]}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>

				{/* Mess Selection */}
				<div>
					<label htmlFor="messId" className="block text-sm font-medium text-gray-700 mb-2">
						Mess *
					</label>
					<select
						id="messId"
						name="messId"
						value={formData.messId}
						onChange={handleInputChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					>
						<option value="">Select a mess</option>
						{messes.filter(mess => mess.availability).map(mess => (
							<option key={mess.mess_id} value={mess.mess_id}>
								{mess.name} - {mess.location}
							</option>
						))}
					</select>
					{formData.mealType && formData.messId && getAvailableSlots().length === 0 && (
						<p className="text-sm text-blue-600 mt-1">
							💡 <strong>Tip:</strong> Try changing the mess selection to see more available time slots for "{formData.mealType}"
						</p>
					)}
				</div>

				{/* Meal Type Selection */}
				{formData.date && (
					<div>
						<label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-2">
							Meal Type *
						</label>
						<select
							id="mealType"
							name="mealType"
							value={formData.mealType}
							onChange={handleInputChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						>
							<option value="">Select meal type</option>
							{getMealTypes().map(type => (
								<option key={type} value={type}>
									{type}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Time Slot Selection */}
				{formData.mealType && (
					<div>
						<label htmlFor="mealSlotId" className="block text-sm font-medium text-gray-700 mb-2">
							Time Slot *
						</label>
						<select
							id="mealSlotId"
							name="mealSlotId"
							value={formData.mealSlotId}
							onChange={handleInputChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						>
							<option value="">Select time slot</option>
							{getAvailableSlots().map(slot => (
								<option key={slot.id} value={slot.id}>
									{slot.session_time}:00 - {slot.type}
									{slot.delayed && ` (Delayed by ${slot.delay_minutes} min)`}
								</option>
							))}
						</select>
						{getAvailableSlots().length === 0 && formData.messId && (
							<div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded">
								<p className="text-sm text-orange-800 mb-2">
									<strong>No time slots available for the selected meal type and mess.</strong>
								</p>
								<p className="text-sm text-orange-700 mb-2">
									Try selecting a different mess or meal type.
								</p>
								{getAllAvailableSlotsForMealType().length > 0 && (
									<div>
										<p className="text-sm text-orange-700 mb-1">
											<strong>Available time slots for "{formData.mealType}" at other messes:</strong>
										</p>
										<div className="text-sm text-orange-600">
											{getAllAvailableSlotsForMealType().map(slot => (
												<div key={slot.id} className="ml-2">
													• {slot.session_time}:00 at {messes.find(m => m.mess_id === slot.mess)?.name || 'Unknown Mess'}
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}



				{/* Submit Button */}
				<button
					type="submit"
					disabled={formLoading || !isFormValid()}
					className={`w-full px-4 py-2 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
						formLoading || !isFormValid()
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-blue-600 hover:bg-blue-700'
					}`}
				>
					{formLoading ? 'Booking...' : 'Book Meal'}
				</button>
			</form>


		</div>
	);
};

export default MealBookingForm;