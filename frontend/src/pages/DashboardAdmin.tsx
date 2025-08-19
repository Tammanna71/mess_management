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
	ArrowDownRight,
	Plus,
	Download,
	Eye
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
			
			// Fetch data from multiple endpoints
			const [users, messes, bookings, coupons, reports] = await Promise.all([
				apiService.getUsers(),
				apiService.getAllMess(),
				apiService.getBookings(),
				apiService.getMyCoupons(),
				apiService.getMessUsageReport()
			]);

			// Calculate dashboard stats from the fetched data
			const today = new Date();
			const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

			const calculatedStats: DashboardStats = {
				totalUsers: Array.isArray(users) ? users.length : 0,
				totalMesses: Array.isArray(messes) ? messes.length : 0,
				totalBookings: Array.isArray(bookings) ? bookings.length : 0,
				totalCoupons: Array.isArray(coupons) ? coupons.length : 0,
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

	const handleExportReport = async () => {
		try {
			const response = await apiService.exportReport();
			// Create a download link for the CSV
			const blob = new Blob([response], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `mess-usage-report-${new Date().toISOString().split('T')[0]}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			showSuccess('Report exported', 'Mess usage report downloaded successfully');
		} catch (error) {
			showError('Export failed', 'Failed to export report');
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
						onClick={() => fetchStats(true)}
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
							<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
							<p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
						</div>
						<div className="flex items-center space-x-3">
							<button
								onClick={() => fetchStats(true)}
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
							<button
								onClick={handleExportReport}
								className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
							>
								<Download className="h-4 w-4 mr-2" />
								Export Report
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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{/* Total Users */}
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<Users className="h-6 w-6 text-blue-600" />
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
										<dd className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
						<div className="bg-gray-50 px-5 py-3">
							<div className="text-sm">
								<Link to="/users" className="font-medium text-blue-600 hover:text-blue-500">
									View all users
								</Link>
							</div>
						</div>
					</div>

					{/* Total Messes */}
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<Building2 className="h-6 w-6 text-green-600" />
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Total Messes</dt>
										<dd className="text-lg font-medium text-gray-900">{stats?.totalMesses || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
						<div className="bg-gray-50 px-5 py-3">
							<div className="text-sm">
								<Link to="/messes" className="font-medium text-green-600 hover:text-green-500">
									Manage messes
								</Link>
							</div>
						</div>
					</div>

					{/* Total Bookings */}
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<Calendar className="h-6 w-6 text-purple-600" />
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
								<Link to="/bookings" className="font-medium text-purple-600 hover:text-purple-500">
									View bookings
								</Link>
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
										<dt className="text-sm font-medium text-gray-500 truncate">Total Coupons</dt>
										<dd className="text-lg font-medium text-gray-900">{stats?.totalCoupons || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
						<div className="bg-gray-50 px-5 py-3">
							<div className="text-sm">
								<Link to="/coupons" className="font-medium text-yellow-600 hover:text-yellow-500">
									Manage coupons
								</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Additional Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

					{/* Today's Bookings */}
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<Clock className="h-6 w-6 text-blue-600" />
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Today's Bookings</dt>
										<dd className="text-lg font-medium text-gray-900">{stats?.todayBookings || 0}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					{/* Pending Bookings */}
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<AlertCircle className="h-6 w-6 text-orange-600" />
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Pending Bookings</dt>
										<dd className="text-lg font-medium text-gray-900">{stats?.pendingBookings || 0}</dd>
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
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<Link
								to="/users"
								className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors duration-200"
							>
								<Users className="h-8 w-8 text-blue-600 mr-3" />
								<div>
									<h4 className="font-medium text-gray-900">Manage Users</h4>
									<p className="text-sm text-gray-500">Add, edit, or remove users</p>
								</div>
							</Link>

							<Link
								to="/messes"
								className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors duration-200"
							>
								<Building2 className="h-8 w-8 text-green-600 mr-3" />
								<div>
									<h4 className="font-medium text-gray-900">Manage Messes</h4>
									<p className="text-sm text-gray-500">Configure mess settings</p>
								</div>
							</Link>

							<Link
								to="/meal-slots"
								className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors duration-200"
							>
								<Utensils className="h-8 w-8 text-purple-600 mr-3" />
								<div>
									<h4 className="font-medium text-gray-900">Meal Slots</h4>
									<p className="text-sm text-gray-500">Set meal timings</p>
								</div>
							</Link>

							<Link
								to="/coupons"
								className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors duration-200"
							>
								<Ticket className="h-8 w-8 text-yellow-600 mr-3" />
								<div>
									<h4 className="font-medium text-gray-900">Generate Coupons</h4>
									<p className="text-sm text-gray-500">Create meal coupons</p>
								</div>
							</Link>
						</div>
					</div>
				</div>

				{/* System Status */}
				<div className="bg-white shadow rounded-lg">
					<div className="px-6 py-4 border-b border-gray-200">
						<h3 className="text-lg font-medium text-gray-900">System Status</h3>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
								<div className="space-y-3">
									<div className="flex items-center text-sm text-gray-600">
										<CheckCircle className="h-4 w-4 text-green-500 mr-2" />
										Dashboard refreshed successfully
									</div>
									<div className="flex items-center text-sm text-gray-600">
										<Clock className="h-4 w-4 text-blue-500 mr-2" />
										Auto-refresh enabled (30s interval)
									</div>
									<div className="flex items-center text-sm text-gray-600">
										<Shield className="h-4 w-4 text-purple-500 mr-2" />
										Admin privileges active
									</div>
								</div>
							</div>
							<div>
								<h4 className="font-medium text-gray-900 mb-4">Quick Links</h4>
								<div className="space-y-2">
									<Link
										to="/reports"
										className="flex items-center text-sm text-blue-600 hover:text-blue-500"
									>
										<BarChart3 className="h-4 w-4 mr-2" />
										View detailed reports
									</Link>
									<Link
										to="/notifications"
										className="flex items-center text-sm text-blue-600 hover:text-blue-500"
									>
										<AlertCircle className="h-4 w-4 mr-2" />
										Send notifications
									</Link>
									<Link
										to="/audit-logs"
										className="flex items-center text-sm text-blue-600 hover:text-blue-500"
									>
										<Eye className="h-4 w-4 mr-2" />
										View audit logs
									</Link>
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