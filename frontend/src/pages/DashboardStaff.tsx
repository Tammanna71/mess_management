import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
	Calendar,
	Clock,
	CheckCircle,
	Building2,
	Users,
	ClipboardList,
	Utensils,
	UserCheck,
	Settings,
	BarChart3,
	Activity,
	ArrowUpRight,
	TrendingUp,
	AlertCircle,
	Timer,
	BookOpen
} from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';

interface StaffStats {
	totalBookings: number;
	pendingBookings: number;
	activeBookings: number;
	totalMesses: number;
	todayBookings: number;
	completedToday: number;
	upcomingMeals: number;
}

const DashboardStaff = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState<StaffStats | null>(null);
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
				const calculatedStats: StaffStats = {
					totalBookings: Array.isArray(bookings) ? bookings.length : 0,
					pendingBookings: Array.isArray(bookings) ? bookings.filter((b: any) => b.status === 'pending').length : 0,
					activeBookings: Array.isArray(bookings) ? bookings.filter((b: any) => b.status === 'active').length : 0,
					totalMesses: Array.isArray(messes) ? messes.length : 0,
					todayBookings: Array.isArray(bookings) ? bookings.filter((b: any) => {
						const today = new Date().toDateString();
						return new Date(b.booking_date).toDateString() === today;
					}).length : 0,
					completedToday: Array.isArray(bookings) ? bookings.filter((b: any) => {
						const today = new Date().toDateString();
						return new Date(b.booking_date).toDateString() === today && b.status === 'completed';
					}).length : 0,
					upcomingMeals: Array.isArray(bookings) ? bookings.filter((b: any) => {
						const now = new Date();
						return new Date(b.booking_date) > now;
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
			change: '+15%',
			changeType: 'increase'
		},
		{
			title: 'Pending Approvals',
			value: stats?.pendingBookings || 0,
			icon: Clock,
			color: 'from-yellow-500 to-yellow-600',
			bgColor: 'bg-yellow-50',
			iconColor: 'text-yellow-600',
			change: '-5%',
			changeType: 'decrease'
		},
		{
			title: 'Active Bookings',
			value: stats?.activeBookings || 0,
			icon: CheckCircle,
			color: 'from-green-500 to-green-600',
			bgColor: 'bg-green-50',
			iconColor: 'text-green-600',
			change: '+22%',
			changeType: 'increase'
		},
		{
			title: 'Managed Messes',
			value: stats?.totalMesses || 0,
			icon: Building2,
			color: 'from-purple-500 to-purple-600',
			bgColor: 'bg-purple-50',
			iconColor: 'text-purple-600',
			change: '+3%',
			changeType: 'increase'
		}
	];

	const quickActions = [
		{
			title: 'Manage Bookings',
			description: 'Approve, reject, and manage bookings',
			icon: ClipboardList,
			link: '/bookings',
			color: 'from-blue-500 to-blue-600',
			priority: 'high'
		},
		{
			title: 'View Messes',
			description: 'Monitor mess hall operations',
			icon: Utensils,
			link: '/messes',
			color: 'from-green-500 to-green-600',
			priority: 'medium'
		},
		{
			title: 'Manage Meal Slots',
			description: 'Configure meal times and slots',
			icon: Timer,
			link: '/meal-slots',
			color: 'from-purple-500 to-purple-600',
			priority: 'medium'
		},
		{
			title: 'View Users',
			description: 'Monitor student registrations',
			icon: Users,
			link: '/users',
			color: 'from-orange-500 to-orange-600',
			priority: 'low'
		}
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
				<Calendar className="absolute top-32 left-1/4 w-8 h-8 text-green-300 animate-pulse" />
				<Utensils className="absolute top-1/2 right-1/3 w-6 h-6 text-green-400 animate-pulse" style={{ animationDelay: '1s' }} />
				<Clock className="absolute bottom-1/3 left-1/3 w-7 h-7 text-green-300 animate-pulse" style={{ animationDelay: '2s' }} />
				<Users className="absolute bottom-40 right-1/4 w-5 h-5 text-green-400 animate-pulse" style={{ animationDelay: '3s' }} />
			</div>

			<div className="relative z-10 p-6">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-12">
						<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-green-100/50">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-6">
									<div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
										<UserCheck className="w-10 h-10 text-white" />
									</div>
									<div>
										<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
											Staff Dashboard
										</h1>
										<p className="text-xl text-gray-600 mt-2">Welcome back, {user?.name}!</p>
										<p className="text-sm text-gray-500 mt-1">Manage mess operations efficiently</p>
									</div>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-500">Current Shift</div>
									<div className="text-2xl font-bold text-gray-900">Day Shift</div>
									<div className="text-sm text-green-600 font-semibold">Active</div>
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
									<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
										<TrendingUp className="w-4 h-4 text-blue-600" />
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{quickActions.map((action, index) => (
										<Link
											key={index}
											to={action.link}
											className="group block p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative"
										>
											{action.priority === 'high' && (
												<div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
											)}
											<div className="flex items-start space-x-4">
												<div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
													<action.icon className="w-6 h-6 text-white" />
												</div>
												<div className="flex-1">
													<h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
														{action.title}
													</h4>
													<p className="text-sm text-gray-600 mt-1">{action.description}</p>
													{action.priority === 'high' && (
														<span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
															High Priority
														</span>
													)}
												</div>
												<ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
											</div>
										</Link>
									))}
								</div>
							</div>
						</div>

						{/* Today's Summary & Tasks */}
						<div className="space-y-8">
							{/* Today's Summary */}
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-green-100/50">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-xl font-bold text-gray-900">Today's Summary</h3>
									<Activity className="w-5 h-5 text-blue-600" />
								</div>
								<div className="space-y-4">
									<div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
												<Clock className="w-4 h-4 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">Pending Approvals</p>
												<p className="text-xs text-gray-500">Requires attention</p>
											</div>
										</div>
										<span className="text-lg font-bold text-yellow-600">{stats?.pendingBookings || 0}</span>
									</div>

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

									<div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
												<Building2 className="w-4 h-4 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">Managed Messes</p>
												<p className="text-xs text-gray-500">Under supervision</p>
											</div>
										</div>
										<span className="text-lg font-bold text-blue-600">{stats?.totalMesses || 0}</span>
									</div>
								</div>
							</div>

							{/* Upcoming Tasks */}
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-green-100/50">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-xl font-bold text-gray-900">Upcoming Tasks</h3>
									<BookOpen className="w-5 h-5 text-purple-600" />
								</div>
								<div className="space-y-3">
									<div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
										<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
										<div className="flex-1">
											<p className="text-sm font-medium text-gray-900">Review lunch bookings</p>
											<p className="text-xs text-gray-500">Due in 2 hours</p>
										</div>
									</div>
									<div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
										<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
										<div className="flex-1">
											<p className="text-sm font-medium text-gray-900">Update meal menu</p>
											<p className="text-xs text-gray-500">Due tomorrow</p>
										</div>
									</div>
									<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<div className="flex-1">
											<p className="text-sm font-medium text-gray-900">Weekly report</p>
											<p className="text-xs text-gray-500">Due Friday</p>
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

export default DashboardStaff;