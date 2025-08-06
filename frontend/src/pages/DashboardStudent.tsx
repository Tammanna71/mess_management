import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
	Calendar,
	CheckCircle,
	Building2,
	Ticket,
	Clock,
	Utensils,
	History,
	Star,
	TrendingUp,
	Activity,
	ArrowUpRight,
	AlertCircle,
	GraduationCap,
	MapPin,
	Award,
	BookOpen,
	Heart
} from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';

interface StudentStats {
	totalBookings: number;
	activeBookings: number;
	completedBookings: number;
	availableMesses: number;
	todayMeals: number;
	weeklyMeals: number;
	favoriteMessId: number;
	upcomingBookings: number;
}

const DashboardStudent = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState<StudentStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchStats = async () => {
			try {
				// Fetch data from multiple existing endpoints
				const [messes, bookings] = await Promise.all([
					apiService.get<any[]>('/mess/'),
					apiService.get<any[]>('/booking')
				]);

				// Calculate dashboard stats from the fetched data
				const today = new Date();
				const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

				const calculatedStats: StudentStats = {
					totalBookings: Array.isArray(bookings) ? bookings.length : 0,
					activeBookings: Array.isArray(bookings) ? bookings.filter((b: any) => b.status === 'active').length : 0,
					completedBookings: Array.isArray(bookings) ? bookings.filter((b: any) => b.status === 'completed').length : 0,
					availableMesses: Array.isArray(messes) ? messes.length : 0,
					todayMeals: Array.isArray(bookings) ? bookings.filter((b: any) => {
						const todayStr = today.toDateString();
						return new Date(b.booking_date).toDateString() === todayStr;
					}).length : 0,
					weeklyMeals: Array.isArray(bookings) ? bookings.filter((b: any) => {
						const bookingDate = new Date(b.booking_date);
						return bookingDate >= weekAgo && bookingDate <= today;
					}).length : 0,
					favoriteMessId: 1, // Would need more complex calculation
					upcomingBookings: Array.isArray(bookings) ? bookings.filter((b: any) => {
						return new Date(b.booking_date) > today;
					}).length : 0
				};

				setStats(calculatedStats);
			} catch (err: any) {
				setError(err.response?.data?.message || 'Failed to load dashboard stats');
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	if (loading) {
		return <LoadingAnimation />;
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-6">
				<div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-red-100">
					<div className="text-center">
						<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
						<h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h3>
						<p className="text-red-600">{error}</p>
					</div>
				</div>
			</div>
		);
	}

	const statCards = [
		{
			title: 'Total Bookings',
			value: stats?.totalBookings || 0,
			icon: Calendar,
			color: 'from-blue-500 to-blue-600',
			bgColor: 'bg-blue-50',
			iconColor: 'text-blue-600',
			change: '+12%',
			changeType: 'increase'
		},
		{
			title: 'Active Bookings',
			value: stats?.activeBookings || 0,
			icon: CheckCircle,
			color: 'from-green-500 to-green-600',
			bgColor: 'bg-green-50',
			iconColor: 'text-green-600',
			change: '+8%',
			changeType: 'increase'
		},
		{
			title: 'Completed Meals',
			value: stats?.completedBookings || 0,
			icon: Award,
			color: 'from-purple-500 to-purple-600',
			bgColor: 'bg-purple-50',
			iconColor: 'text-purple-600',
			change: '+25%',
			changeType: 'increase'
		},
		{
			title: 'Available Messes',
			value: stats?.availableMesses || 0,
			icon: Building2,
			color: 'from-orange-500 to-orange-600',
			bgColor: 'bg-orange-50',
			iconColor: 'text-orange-600',
			change: '+2%',
			changeType: 'increase'
		}
	];

	const quickActions = [
		{
			title: 'My Bookings',
			description: 'View and manage your meal bookings',
			icon: Calendar,
			link: '/bookings',
			color: 'from-blue-500 to-blue-600',
			badge: stats?.activeBookings || 0
		},
		{
			title: 'Browse Messes',
			description: 'Explore available dining options',
			icon: Utensils,
			link: '/messes',
			color: 'from-green-500 to-green-600',
			badge: stats?.availableMesses || 0
		},
		{
			title: 'Booking History',
			description: 'Review your past meal history',
			icon: History,
			link: '/booking-history',
			color: 'from-purple-500 to-purple-600',
			badge: null
		},
		{
			title: 'My Coupons',
			description: 'View available meal coupons',
			icon: Ticket,
			link: '/coupons',
			color: 'from-orange-500 to-orange-600',
			badge: null
		}
	];

	const upcomingMeals = [
		{ time: '08:00 AM', meal: 'Breakfast', mess: 'Main Dining Hall', status: 'confirmed' },
		{ time: '01:00 PM', meal: 'Lunch', mess: 'North Campus Mess', status: 'pending' },
		{ time: '08:00 PM', meal: 'Dinner', mess: 'Main Dining Hall', status: 'confirmed' }
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden">
			{/* 3D Background Elements */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-20 left-20 w-32 h-32 border-4 border-green-300 rounded-full transform rotate-12"></div>
				<div className="absolute top-40 right-32 w-24 h-24 border-4 border-green-400 rounded-full transform -rotate-12"></div>
				<div className="absolute bottom-32 left-40 w-20 h-20 border-4 border-green-300 rounded-full transform rotate-45"></div>
				<div className="absolute bottom-20 right-20 w-28 h-28 border-4 border-green-400 rounded-full transform -rotate-45"></div>
				<div className="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-green-300 rounded-full transform rotate-90"></div>
			</div>

			{/* Floating 3D Icons */}
			<div className="absolute inset-0 opacity-3">
				<Utensils className="absolute top-32 left-1/4 w-8 h-8 text-green-300 animate-pulse" />
				<Calendar className="absolute top-1/2 right-1/3 w-6 h-6 text-green-400 animate-pulse" style={{ animationDelay: '1s' }} />
				<Building2 className="absolute bottom-1/3 left-1/3 w-7 h-7 text-green-300 animate-pulse" style={{ animationDelay: '2s' }} />
				<Star className="absolute bottom-40 right-1/4 w-5 h-5 text-green-400 animate-pulse" style={{ animationDelay: '3s' }} />
			</div>

			<div className="relative z-10 p-6">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-12">
						<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-green-100/50">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-6">
									<div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
										<GraduationCap className="w-10 h-10 text-white" />
									</div>
									<div>
										<h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
											Student Dashboard
										</h1>
										<p className="text-xl text-gray-600 mt-2">Welcome back, {user?.name}!</p>
										<div className="flex items-center space-x-4 mt-2">
											<div className="flex items-center space-x-2 text-sm text-gray-500">
												<MapPin className="w-4 h-4" />
												<span>Room {user?.room_no}</span>
											</div>
											<div className="flex items-center space-x-2 text-sm text-gray-500">
												<BookOpen className="w-4 h-4" />
												<span>Roll {user?.roll_no}</span>
											</div>
										</div>
									</div>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-500">Today's Date</div>
									<div className="text-2xl font-bold text-gray-900">{new Date().toLocaleDateString()}</div>
									<div className="text-sm text-green-600 font-semibold">
										{stats?.todayMeals || 0} meals today
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
						{statCards.map((card, index) => (
							<div key={index} className="group">
								<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-green-100/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
									<div className="flex items-center justify-between mb-4">
										<div className={`w-14 h-14 ${card.bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
											<card.icon className={`w-7 h-7 ${card.iconColor}`} />
										</div>
										<div className="flex items-center space-x-1">
											<ArrowUpRight className={`w-4 h-4 ${card.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
												}`} />
											<span className={`text-sm font-semibold ${card.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
												}`}>
												{card.change}
											</span>
										</div>
									</div>
									<div>
										<h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
										<p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Main Content Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Quick Actions */}
						<div className="lg:col-span-2">
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-green-100/50">
								<div className="flex items-center justify-between mb-8">
									<h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
									<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
										<TrendingUp className="w-4 h-4 text-green-600" />
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{quickActions.map((action, index) => (
										<Link
											key={index}
											to={action.link}
											className="group block p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative"
										>
											{action.badge && action.badge > 0 && (
												<div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
													<span className="text-xs font-bold text-white">{action.badge}</span>
												</div>
											)}
											<div className="flex items-start space-x-4">
												<div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
													<action.icon className="w-6 h-6 text-white" />
												</div>
												<div className="flex-1">
													<h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
														{action.title}
													</h4>
													<p className="text-sm text-gray-600 mt-1">{action.description}</p>
												</div>
												<ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors duration-200" />
											</div>
										</Link>
									))}
								</div>
							</div>
						</div>

						{/* My Summary & Upcoming Meals */}
						<div className="space-y-8">
							{/* My Summary */}
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-green-100/50">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-xl font-bold text-gray-900">My Summary</h3>
									<Activity className="w-5 h-5 text-green-600" />
								</div>
								<div className="space-y-4">
									<div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
												<CheckCircle className="w-4 h-4 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">Active Bookings</p>
												<p className="text-xs text-gray-500">Currently active</p>
											</div>
										</div>
										<span className="text-lg font-bold text-green-600">{stats?.activeBookings || 0}</span>
									</div>

									<div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
												<Award className="w-4 h-4 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">Completed Meals</p>
												<p className="text-xs text-gray-500">This month</p>
											</div>
										</div>
										<span className="text-lg font-bold text-purple-600">{stats?.completedBookings || 0}</span>
									</div>

									<div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
												<Building2 className="w-4 h-4 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">Available Messes</p>
												<p className="text-xs text-gray-500">Ready to book</p>
											</div>
										</div>
										<span className="text-lg font-bold text-blue-600">{stats?.availableMesses || 0}</span>
									</div>
								</div>
							</div>

							{/* Upcoming Meals */}
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-green-100/50">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-xl font-bold text-gray-900">Today's Meals</h3>
									<Clock className="w-5 h-5 text-orange-600" />
								</div>
								<div className="space-y-3">
									{upcomingMeals.map((meal, index) => (
										<div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
											<div className="flex items-center space-x-3">
												<div className={`w-3 h-3 rounded-full ${meal.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
													}`}></div>
												<div>
													<p className="text-sm font-medium text-gray-900">{meal.meal}</p>
													<p className="text-xs text-gray-500">{meal.mess}</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-sm font-semibold text-gray-900">{meal.time}</p>
												<p className={`text-xs font-medium ${meal.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
													}`}>
													{meal.status}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Favorite Mess */}
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-green-100/50">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-xl font-bold text-gray-900">Favorite Mess</h3>
									<Heart className="w-5 h-5 text-red-500" />
								</div>
								<div className="text-center">
									<div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
										<Utensils className="w-8 h-8 text-white" />
									</div>
									<h4 className="text-lg font-semibold text-gray-900 mb-2">Main Dining Hall</h4>
									<p className="text-sm text-gray-600 mb-4">Your most visited mess this month</p>
									<div className="flex items-center justify-center space-x-4 text-sm">
										<div className="text-center">
											<p className="font-bold text-gray-900">24</p>
											<p className="text-gray-500">Visits</p>
										</div>
										<div className="text-center">
											<p className="font-bold text-gray-900">4.8</p>
											<p className="text-gray-500">Rating</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardStudent;