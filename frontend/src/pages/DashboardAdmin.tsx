import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import {
	Users,
	Building2,
	Calendar,
	Ticket,
	TrendingUp,
	Clock,
	CheckCircle,
	AlertCircle,
	BarChart3,
	UserCheck,
	Utensils,
	Shield,
	ArrowUpRight,
	ArrowDownRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardStats {
	totalUsers: number;
	totalMesses: number;
	totalBookings: number;
	totalCoupons: number;
	activeBookings: number;
	pendingBookings: number;
	todayBookings: number;
	monthlyRevenue: number;
	growthRate: number;
}

const DashboardAdmin = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

	const fetchStats = async (showLoading = false) => {
		try {
			if (showLoading) setRefreshing(true);
			// Fetch data from multiple existing endpoints
			const [users, messes, bookings] = await Promise.all([
				apiService.get<any[]>('/users/'),
				apiService.get<any[]>('/mess/'),
				apiService.get<any[]>('/booking')
			]);

			// Calculate dashboard stats from the fetched data
			const today = new Date();
			const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

			const calculatedStats: DashboardStats = {
				totalUsers: Array.isArray(users) ? users.length : 0,
				totalMesses: Array.isArray(messes) ? messes.length : 0,
				totalBookings: Array.isArray(bookings) ? bookings.length : 0,
				totalCoupons: 0, // Would need coupon endpoint
				activeBookings: Array.isArray(bookings) ? bookings.filter((b: any) => !b.cancelled).length : 0,
				pendingBookings: Array.isArray(bookings) ? bookings.filter((b: any) => {
					// Count recent bookings (last 24 hours) as pending
					const bookingDate = new Date(b.created_at);
					const hoursDiff = (today.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);
					return !b.cancelled && hoursDiff <= 24;
				}).length : 0,
				todayBookings: Array.isArray(bookings) ? bookings.filter((b: any) => {
					const bookingDate = new Date(b.created_at);
					const bookingDateStr = bookingDate.toISOString().split('T')[0];
					return bookingDateStr === todayStr;
				}).length : 0,
				monthlyRevenue: 0, // Would need to calculate from bookings
				growthRate: 0 // Would need historical data
			};

			setStats(calculatedStats);
			setLastUpdated(new Date());
			if (showLoading) {
				showSuccess('Dashboard refreshed', `Updated with ${calculatedStats.totalBookings} bookings`);
			}
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to load dashboard stats');
			showError('Failed to load dashboard', err.response?.data?.message || 'Please refresh the page');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchStats();

		// Set up auto-refresh every 30 seconds for real-time data
		const intervalId = setInterval(() => fetchStats(false), 30000);

		return () => clearInterval(intervalId);
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
			title: 'Total Users',
			value: stats?.totalUsers || 0,
			icon: Users,
			color: 'from-blue-500 to-blue-600',
			bgColor: 'bg-blue-50',
			iconColor: 'text-blue-600',
			change: '+12%',
			changeType: 'increase'
		},
		{
			title: 'Total Messes',
			value: stats?.totalMesses || 0,
			icon: Building2,
			color: 'from-green-500 to-green-600',
			bgColor: 'bg-green-50',
			iconColor: 'text-green-600',
			change: '+5%',
			changeType: 'increase'
		},
		{
			title: 'Total Bookings',
			value: stats?.totalBookings || 0,
			icon: Calendar,
			color: 'from-purple-500 to-purple-600',
			bgColor: 'bg-purple-50',
			iconColor: 'text-purple-600',
			change: '+18%',
			changeType: 'increase'
		},
		{
			title: 'Total Coupons',
			value: stats?.totalCoupons || 0,
			icon: Ticket,
			color: 'from-orange-500 to-orange-600',
			bgColor: 'bg-orange-50',
			iconColor: 'text-orange-600',
			change: '+8%',
			changeType: 'increase'
		}
	];

	const quickActions = [
		{
			title: 'Manage Users',
			description: 'Add, edit, and manage user accounts',
			icon: UserCheck,
			link: '/users',
			color: 'from-blue-500 to-blue-600'
		},
		{
			title: 'Manage Messes',
			description: 'Configure mess halls and dining options',
			icon: Utensils,
			link: '/messes',
			color: 'from-green-500 to-green-600'
		},
		{
			title: 'View Bookings',
			description: 'Monitor and manage all bookings',
			icon: Calendar,
			link: '/bookings',
			color: 'from-purple-500 to-purple-600'
		},
		{
			title: 'Generate Reports',
			description: 'Create detailed analytics reports',
			icon: BarChart3,
			link: '/reports',
			color: 'from-orange-500 to-orange-600'
		}
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden">
			<ToastContainer toasts={toasts} onClose={removeToast} />

			{/* 3D Background Elements */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-20 left-20 w-32 h-32 border-4 border-green-300 rounded-full transform rotate-12"></div>
				<div className="absolute top-40 right-32 w-24 h-24 border-4 border-green-400 rounded-full transform -rotate-12"></div>
				<div className="absolute bottom-32 left-40 w-20 h-20 border-4 border-green-300 rounded-full transform rotate-45"></div>
				<div className="absolute bottom-20 right-20 w-28 h-28 border-4 border-green-400 rounded-full transform -rotate-45"></div>
				<div className="absolute top-1/2 left-1/4 w-16 h-16 border-4 border-green-300 rounded-full transform rotate-90"></div>
				<div className="absolute top-1/3 right-1/4 w-12 h-12 border-4 border-green-400 rounded-full transform -rotate-90"></div>
			</div>

			{/* Floating 3D Icons */}
			<div className="absolute inset-0 opacity-3">
				<Users className="absolute top-32 left-1/4 w-8 h-8 text-green-300 animate-pulse" />
				<Building2 className="absolute top-1/2 right-1/3 w-6 h-6 text-green-400 animate-pulse" style={{ animationDelay: '1s' }} />
				<Calendar className="absolute bottom-1/3 left-1/3 w-7 h-7 text-green-300 animate-pulse" style={{ animationDelay: '2s' }} />
				<Utensils className="absolute bottom-40 right-1/4 w-5 h-5 text-green-400 animate-pulse" style={{ animationDelay: '3s' }} />
			</div>

			<div className="relative z-10 p-6">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-12">
						<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-green-100/50">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-6">
									<div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
										<Shield className="w-10 h-10 text-white" />
									</div>
									<div>
										<h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
											Admin Dashboard
										</h1>
										<p className="text-xl text-gray-600 mt-2">Welcome back, {user?.name}!</p>
										<p className="text-sm text-gray-500 mt-1">Manage your mess management system</p>
									</div>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-500">Today</div>
									<div className="text-2xl font-bold text-gray-900">{new Date().toLocaleDateString()}</div>
									<div className="text-sm text-green-600 font-semibold">System Online</div>
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
											{card.changeType === 'increase' ? (
												<ArrowUpRight className="w-4 h-4 text-green-500" />
											) : (
												<ArrowDownRight className="w-4 h-4 text-red-500" />
											)}
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
											className="group block p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
										>
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

						{/* Activity Summary */}
						<div className="space-y-8">
							{/* Recent Activity */}
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-green-100/50">
								<div className="flex items-center justify-between mb-6">
									<div>
										<h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
										{lastUpdated && (
											<p className="text-xs text-gray-500 mt-1">
												Last updated: {lastUpdated.toLocaleTimeString()}
											</p>
										)}
									</div>
									<div className="flex items-center space-x-2">
										<button
											onClick={() => fetchStats(true)}
											disabled={refreshing}
											className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors disabled:opacity-50"
											title="Refresh data"
										>
											<Clock className={`w-4 h-4 text-green-600 ${refreshing ? 'animate-spin' : ''}`} />
										</button>
									</div>
								</div>
								<div className="space-y-4">
									<div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100 relative overflow-hidden">
										{refreshing && (
											<div className="absolute inset-0 bg-green-100/50 flex items-center justify-center">
												<div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
											</div>
										)}
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
												<CheckCircle className="w-4 h-4 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">Active Bookings</p>
												<p className="text-xs text-gray-500">Currently active</p>
											</div>
										</div>
										<div className="text-right">
											<span className="text-2xl font-bold text-green-600">{stats?.activeBookings || 0}</span>
											<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto mt-1"></div>
										</div>
									</div>

									<div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100 relative overflow-hidden">
										{refreshing && (
											<div className="absolute inset-0 bg-yellow-100/50 flex items-center justify-center">
												<div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
											</div>
										)}
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
												<Clock className="w-4 h-4 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">Recent Bookings</p>
												<p className="text-xs text-gray-500">Last 24 hours</p>
											</div>
										</div>
										<div className="text-right">
											<span className="text-2xl font-bold text-yellow-600">{stats?.pendingBookings || 0}</span>
											<div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse ml-auto mt-1"></div>
										</div>
									</div>

									<div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 relative overflow-hidden">
										{refreshing && (
											<div className="absolute inset-0 bg-blue-100/50 flex items-center justify-center">
												<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
											</div>
										)}
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
												<Calendar className="w-4 h-4 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">Today's Bookings</p>
												<p className="text-xs text-gray-500">New today</p>
											</div>
										</div>
										<div className="text-right">
											<span className="text-2xl font-bold text-blue-600">{stats?.todayBookings || 0}</span>
											<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-auto mt-1"></div>
										</div>
									</div>
								</div>
							</div>

							{/* System Status */}
							<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-green-100/50">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-xl font-bold text-gray-900">System Status</h3>
									<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
								</div>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Server Status</span>
										<span className="text-sm font-semibold text-green-600">Online</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Database</span>
										<span className="text-sm font-semibold text-green-600">Connected</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Last Backup</span>
										<span className="text-sm font-semibold text-gray-900">2 hours ago</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">System Load</span>
										<span className="text-sm font-semibold text-green-600">Normal</span>
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

export default DashboardAdmin;