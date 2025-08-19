import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import {
	Calendar,
	Ticket,
	Clock,
	CheckCircle,
	AlertCircle,
	Utensils,
	GraduationCap,
	Plus,
	Eye,
	History,
	MapPin,
	User
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface StudentStats {
	totalBookings: number;
	activeBookings: number;
	totalCoupons: number;
	availableMeals: number;
	upcomingMeals: number;
}

const DashboardStudent = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState<StudentStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [recentBookings, setRecentBookings] = useState<any[]>([]);
	const [recentCoupons, setRecentCoupons] = useState<any[]>([]);
	const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

	const fetchStudentData = async (showLoading = false) => {
		try {
			if (showLoading) setRefreshing(true);
			
			// Fetch student-specific data
			const [bookings, coupons, mealAvailability] = await Promise.all([
				apiService.getBookings(),
				apiService.getMyCoupons(),
				apiService.getMealAvailability()
			]);

			// Calculate student stats
			const calculatedStats: StudentStats = {
				totalBookings: Array.isArray(bookings) ? bookings.length : 0,
				activeBookings: Array.isArray(bookings) ? bookings.filter((b: any) => !b.cancelled).length : 0,
				totalCoupons: Array.isArray(coupons) ? coupons.length : 0,
				availableMeals: Array.isArray(mealAvailability) ? mealAvailability.filter((m: any) => m.available).length : 0,
				upcomingMeals: Array.isArray(mealAvailability) ? mealAvailability.filter((m: any) => {
					const now = new Date();
					const mealTime = new Date();
					mealTime.setHours(Math.floor(m.session_time), (m.session_time % 1) * 60, 0, 0);
					return mealTime > now && m.available;
				}).length : 0
			};

			setStats(calculatedStats);
			
			// Set recent data
			if (Array.isArray(bookings)) {
				setRecentBookings(bookings.slice(0, 5).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
			}
			
			if (Array.isArray(coupons)) {
				setRecentCoupons(coupons.slice(0, 5).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
			}

			setLastUpdated(new Date());
			if (showLoading) {
				showSuccess('Dashboard refreshed', 'Student data updated successfully');
			}
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to load student data');
			showError('Failed to load dashboard', err.response?.data?.message || 'Please refresh the page');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchStudentData();

		// Set up auto-refresh every 30 seconds for real-time data
		const intervalId = setInterval(() => fetchStudentData(false), 30000);
		return () => clearInterval(intervalId);
	}, []);

	const formatMealTime = (sessionTime: number) => {
		const hours = Math.floor(sessionTime);
		const minutes = Math.round((sessionTime % 1) * 60);
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	};

	const getMealTypeColor = (mealType: string) => {
		switch (mealType.toLowerCase()) {
			case 'breakfast':
				return 'bg-orange-100 text-orange-800';
			case 'lunch':
				return 'bg-green-100 text-green-800';
			case 'dinner':
				return 'bg-purple-100 text-purple-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={() => fetchStudentData(true)}
						className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer toasts={toasts} removeToast={removeToast} />
			
			{/* Header */}
			<div className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
							<p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
							<div className="flex items-center mt-2 text-sm text-gray-500">
								<GraduationCap className="h-4 w-4 mr-2" />
								<span>Roll No: {user?.roll_no || 'N/A'}</span>
								<span className="mx-2">•</span>
								<MapPin className="h-4 w-4 mr-2" />
								<span>Room: {user?.room_no || 'N/A'}</span>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<button
								onClick={() => fetchStudentData(true)}
								disabled={refreshing}
								className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
							>
								{refreshing ? (
									<LoadingSpinner size="sm" className="mr-2" />
								) : (
									<Clock className="h-4 w-4 mr-2" />
								)}
								Refresh
							</button>
						</div>
					</div>
					{lastUpdated && (
						<p className="text-sm text-gray-500 mt-2">
							Last updated: {lastUpdated.toLocaleTimeString()}
						</p>
					)}
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
					{/* Total Bookings */}
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<Calendar className="h-6 w-6 text-blue-600" />
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
										<dd className="text-lg font-medium text-gray-900">{stats?.totalBookings || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
						<div className="bg-gray-50 px-5 py-3">
							<div className="text-sm">
								<Link to="/bookings" className="font-medium text-blue-600 hover:text-blue-500">
									View all
								</Link>
							</div>
						</div>
					</div>

					{/* Active Bookings */}
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<CheckCircle className="h-6 w-6 text-green-600" />
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Active Bookings</dt>
										<dd className="text-lg font-medium text-gray-900">{stats?.activeBookings || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					{/* Total Coupons */}
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<Ticket className="h-6 w-6 text-yellow-600" />
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">My Coupons</dt>
										<dd className="text-lg font-medium text-gray-900">{stats?.totalCoupons || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
						<div className="bg-gray-50 px-5 py-3">
							<div className="text-sm">
								<Link to="/coupons" className="font-medium text-yellow-600 hover:text-yellow-500">
									View all
								</Link>
							</div>
						</div>
					</div>

					{/* Available Meals */}
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<Utensils className="h-6 w-6 text-purple-600" />
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Available Meals</dt>
										<dd className="text-lg font-medium text-gray-900">{stats?.availableMeals || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					{/* Upcoming Meals */}
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<Clock className="h-6 w-6 text-orange-600" />
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Upcoming Meals</dt>
										<dd className="text-lg font-medium text-gray-900">{stats?.upcomingMeals || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="bg-white shadow rounded-lg mb-8">
					<div className="px-6 py-4 border-b border-gray-200">
						<h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Link
								to="/bookings"
								className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors duration-200"
							>
								<Plus className="h-8 w-8 text-blue-600 mr-3" />
								<div>
									<h4 className="font-medium text-gray-900">Book a Meal</h4>
									<p className="text-sm text-gray-500">Reserve your meal slot</p>
								</div>
							</Link>

							<Link
								to="/booking-history"
								className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors duration-200"
							>
								<History className="h-8 w-8 text-green-600 mr-3" />
								<div>
									<h4 className="font-medium text-gray-900">Booking History</h4>
									<p className="text-sm text-gray-500">View past bookings</p>
								</div>
							</Link>

							<Link
								to="/coupons"
								className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors duration-200"
							>
								<Ticket className="h-8 w-8 text-yellow-600 mr-3" />
								<div>
									<h4 className="font-medium text-gray-900">My Coupons</h4>
									<p className="text-sm text-gray-500">View meal coupons</p>
								</div>
							</Link>
						</div>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Recent Bookings */}
					<div className="bg-white shadow rounded-lg">
						<div className="px-6 py-4 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
								<Link
									to="/bookings"
									className="text-sm text-orange-600 hover:text-orange-500 font-medium"
								>
									View all
								</Link>
							</div>
						</div>
						<div className="p-6">
							{recentBookings.length > 0 ? (
								<div className="space-y-4">
									{recentBookings.map((booking) => (
										<div key={booking.booking_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
											<div className="flex items-center space-x-3">
												<div className={`w-3 h-3 rounded-full ${booking.cancelled ? 'bg-red-500' : 'bg-green-500'}`}></div>
												<div>
													<p className="text-sm font-medium text-gray-900">
														{booking.meal_slot?.type || 'Meal'}
													</p>
													<p className="text-xs text-gray-500">
														{booking.meal_slot?.mess?.name || 'Mess'} • {formatMealTime(booking.meal_slot?.session_time || 0)}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-xs text-gray-500">
													{new Date(booking.created_at).toLocaleDateString()}
												</p>
												<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
													booking.cancelled 
														? 'bg-red-100 text-red-800' 
														: 'bg-green-100 text-green-800'
												}`}>
													{booking.cancelled ? 'Cancelled' : 'Active'}
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
									<p className="text-gray-500">No bookings yet</p>
									<Link
										to="/bookings"
										className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
									>
										<Plus className="h-4 w-4 mr-2" />
										Book your first meal
									</Link>
								</div>
							)}
						</div>
					</div>

					{/* Recent Coupons */}
					<div className="bg-white shadow rounded-lg">
						<div className="px-6 py-4 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium text-gray-900">Recent Coupons</h3>
								<Link
									to="/coupons"
									className="text-sm text-orange-600 hover:text-orange-500 font-medium"
								>
									View all
								</Link>
							</div>
						</div>
						<div className="p-6">
							{recentCoupons.length > 0 ? (
								<div className="space-y-4">
									{recentCoupons.map((coupon) => (
										<div key={coupon.c_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
											<div className="flex items-center space-x-3">
												<div className={`w-3 h-3 rounded-full ${coupon.cancelled ? 'bg-red-500' : 'bg-green-500'}`}></div>
												<div>
													<p className="text-sm font-medium text-gray-900">
														{coupon.meal_type}
													</p>
													<p className="text-xs text-gray-500">
														{coupon.location} • {formatMealTime(coupon.session_time)}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-xs text-gray-500">
													{new Date(coupon.created_at).toLocaleDateString()}
												</p>
												<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
													coupon.cancelled 
														? 'bg-red-100 text-red-800' 
														: 'bg-green-100 text-green-800'
												}`}>
													{coupon.cancelled ? 'Used' : 'Available'}
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<Ticket className="mx-auto h-12 w-12 text-gray-400 mb-4" />
									<p className="text-gray-500">No coupons yet</p>
									<p className="text-sm text-gray-400 mt-1">Contact admin to get coupons</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Profile Section */}
				<div className="bg-white shadow rounded-lg mt-8">
					<div className="px-6 py-4 border-b border-gray-200">
						<h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h4 className="font-medium text-gray-900 mb-4">Personal Details</h4>
								<div className="space-y-3">
									<div className="flex items-center text-sm">
										<User className="h-4 w-4 text-gray-400 mr-3" />
										<span className="text-gray-500 w-20">Name:</span>
										<span className="text-gray-900 font-medium">{user?.name}</span>
									</div>
									<div className="flex items-center text-sm">
										<GraduationCap className="h-4 w-4 text-gray-400 mr-3" />
										<span className="text-gray-500 w-20">Roll No:</span>
										<span className="text-gray-900 font-medium">{user?.roll_no || 'N/A'}</span>
									</div>
									<div className="flex items-center text-sm">
										<MapPin className="h-4 w-4 text-gray-400 mr-3" />
										<span className="text-gray-500 w-20">Room:</span>
										<span className="text-gray-900 font-medium">{user?.room_no || 'N/A'}</span>
									</div>
								</div>
							</div>
							<div>
								<h4 className="font-medium text-gray-900 mb-4">Account Status</h4>
								<div className="space-y-3">
									<div className="flex items-center text-sm">
										<div className={`w-3 h-3 rounded-full ${user?.is_active ? 'bg-green-500' : 'bg-red-500'} mr-3`}></div>
										<span className="text-gray-500 w-20">Status:</span>
										<span className={`font-medium ${user?.is_active ? 'text-green-600' : 'text-red-600'}`}>
											{user?.is_active ? 'Active' : 'Inactive'}
										</span>
									</div>
									<div className="flex items-center text-sm">
										<Clock className="h-4 w-4 text-gray-400 mr-3" />
										<span className="text-gray-500 w-20">Joined:</span>
										<span className="text-gray-900 font-medium">
											{user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="mt-6 pt-6 border-t border-gray-200">
							<Link
								to="/profile"
								className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
							>
								<Eye className="h-4 w-4 mr-2" />
								View Full Profile
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardStudent;