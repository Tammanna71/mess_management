import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { formatDate } from '../utils/helpers';
import LoadingAnimation from '../components/LoadingAnimation';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { Download, FileText } from 'lucide-react';

interface MessUsageReport {
	mess_id: number;
	mess_name: string;
	total_meals: number;
	unique_users: number;
}

interface ReportCard {
	id: string;
	title: string;
	description: string;
	type: string;
	data: any;
	fetchFunction: () => Promise<any>;
}

const Reports = () => {
	const [messUsageData, setMessUsageData] = useState<MessUsageReport[]>([]);
	const [bookingData, setBookingData] = useState<any[]>([]);
	const [userData, setUserData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeReport, setActiveReport] = useState<string | null>(null);
	const [reportLoading, setReportLoading] = useState<string | null>(null);
	const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

	// Safe CSV Export Functions
	const exportToCSV = (data: any[], filename: string) => {
		try {
			if (data.length === 0) {
				showError('Export Failed', 'No data available to export');
				return;
			}

			// Get headers from the first object
			const headers = Object.keys(data[0]);

			// Create CSV content
			const csvContent = [
				headers.join(','), // Header row
				...data.map(row =>
					headers.map(header => {
						const value = row[header];
						// Escape values that contain commas or quotes
						if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
							return `"${value.replace(/"/g, '""')}"`;
						}
						return value || '';
					}).join(',')
				)
			].join('\n');

			// Create and download file
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const link = document.createElement('a');
			const url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			showSuccess('Export Successful', `${filename}.csv has been downloaded successfully`);
		} catch (error) {
			console.error('Export error:', error);
			showError('Export Failed', 'Failed to export data to CSV');
		}
	};

	const exportMessUsageReport = () => {
		const exportData = messUsageData.map(mess => ({
			'Mess ID': mess.mess_id,
			'Mess Name': mess.mess_name,
			'Total Meals': mess.total_meals,
			'Unique Users': mess.unique_users,
			'Avg Meals per User': mess.unique_users > 0 ? (mess.total_meals / mess.unique_users).toFixed(1) : '0',
			'Generated Date': new Date().toLocaleDateString()
		}));
		exportToCSV(exportData, 'Mess_Usage_Report');
	};

	const exportBookingSummaryReport = () => {
		const exportData = bookingData.map((booking, index) => ({
			'Sr. No': index + 1,
			'Booking ID': booking.booking_id || 'N/A',
			'User Name': booking.user?.name || 'Unknown',
			'User Email': booking.user?.email || 'N/A',
			'Mess Name': booking.mess?.name || booking.meal_slot?.mess?.name || 'N/A',
			'Meal Type': booking.meal_slot?.type || 'N/A',
			'Session Time': booking.meal_slot?.session_time || 'N/A',
			'Created Date': booking.created_at ? formatDate(booking.created_at) : 'N/A',
			'Status': booking.cancelled ? 'Cancelled' : 'Active',
			'Generated Date': new Date().toLocaleDateString()
		}));
		exportToCSV(exportData, 'Booking_Summary_Report');
	};

	const exportUserAnalyticsReport = () => {
		const userStats = getUserStats();
		const exportData = userData.map(user => ({
			'User ID': user.user_id || user.id,
			'Name': user.name || 'N/A',
			'Email': user.email || 'N/A',
			'Phone': user.phone || 'N/A',
			'Roll Number': user.roll_no || 'N/A',
			'Room Number': user.room_no || 'N/A',
			'Role': user.is_superuser ? 'Admin' : user.is_staff ? 'Staff' : 'Student',
			'Status': user.is_active ? 'Active' : 'Inactive',
			'Date Joined': user.date_joined ? formatDate(user.date_joined) : 'N/A',
			'Generated Date': new Date().toLocaleDateString()
		}));

		// Add summary data at the top
		const summaryData = [
			{ 'Summary': 'Total Users', 'Value': userStats.total },
			{ 'Summary': 'Students', 'Value': userStats.students },
			{ 'Summary': 'Staff', 'Value': userData.filter(u => u.is_staff && !u.is_superuser).length },
			{ 'Summary': 'Admins', 'Value': userStats.admins },
			{ 'Summary': 'Recent Registrations', 'Value': userStats.recentRegistrations },
			{ 'Summary': '', 'Value': '' }, // Empty row for separation
			...exportData
		];

		exportToCSV(summaryData, 'User_Analytics_Report');
	};

	const reportCards: ReportCard[] = [
		{
			id: 'mess-usage',
			title: 'Mess Usage Report',
			description: 'View meal consumption and user statistics per mess',
			type: 'mess',
			data: messUsageData,
			fetchFunction: () => apiService.getMessUsageReport()
		},
		{
			id: 'booking-summary',
			title: 'Booking Summary',
			description: 'Overview of all booking activities',
			type: 'booking',
			data: [],
			fetchFunction: () => apiService.getBookings()
		},
		{
			id: 'user-analytics',
			title: 'User Analytics',
			description: 'User registration and activity metrics',
			type: 'user',
			data: [],
			fetchFunction: () => apiService.getUsers()
		}
	];

	useEffect(() => {
		fetchMessUsageReport();
	}, []);

	const fetchMessUsageReport = async () => {
		try {
			const response = await apiService.getMessUsageReport();
			setMessUsageData(response as MessUsageReport[]);
			// Remove auto-success toast to avoid duplicates
		} catch (err: any) {
			showError('Failed to load reports', err.response?.data?.message || 'Please try again later');
		} finally {
			setLoading(false);
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'booking':
				return 'bg-blue-100 text-blue-800';
			case 'revenue':
				return 'bg-green-100 text-green-800';
			case 'user':
				return 'bg-purple-100 text-purple-800';
			case 'mess':
				return 'bg-yellow-100 text-yellow-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const handleViewReport = async (reportId: string) => {
		if (activeReport === reportId) {
			setActiveReport(null);
			return;
		}

		setReportLoading(reportId);
		try {
			switch (reportId) {
				case 'booking-summary':
					if (bookingData.length === 0) {
						const bookings = await apiService.getBookings();
						setBookingData(bookings);
					}
					break;
				case 'user-analytics':
					if (userData.length === 0) {
						const users = await apiService.getUsers();
						setUserData(users);
					}
					break;
			}
			setActiveReport(reportId);
		} catch (err: any) {
			showError(`Failed to load ${reportId}`, err.response?.data?.message || err.message);
		} finally {
			setReportLoading(null);
		}
	};

	const getTotalMeals = () => {
		return messUsageData.reduce((sum, mess) => sum + mess.total_meals, 0);
	};

	const getTotalUsers = () => {
		return messUsageData.reduce((sum, mess) => sum + mess.unique_users, 0);
	};

	// Booking Analytics
	const getBookingStats = () => {
		const activeBookings = bookingData.filter(b => !b.cancelled);
		const cancelledBookings = bookingData.filter(b => b.cancelled);

		// Group by meal type
		const byMealType = activeBookings.reduce((acc, booking) => {
			const mealType = booking.meal_slot?.type || 'Unknown';
			acc[mealType] = (acc[mealType] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Recent bookings (last 7 days)
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		const recentBookings = bookingData.filter(b =>
			new Date(b.created_at) >= weekAgo
		);

		return {
			total: bookingData.length,
			active: activeBookings.length,
			cancelled: cancelledBookings.length,
			byMealType,
			recentCount: recentBookings.length,
			cancellationRate: bookingData.length > 0 ? (cancelledBookings.length / bookingData.length * 100).toFixed(1) : '0'
		};
	};

	// User Analytics  
	const getUserStats = () => {
		const admins = userData.filter(u => u.is_superuser || u.is_staff);
		const students = userData.filter(u => !u.is_superuser && !u.is_staff);

		// Recent registrations (last 30 days)
		const monthAgo = new Date();
		monthAgo.setDate(monthAgo.getDate() - 30);
		const recentUsers = userData.filter(u =>
			u.date_joined && new Date(u.date_joined) >= monthAgo
		);

		return {
			total: userData.length,
			admins: admins.length,
			students: students.length,
			recentRegistrations: recentUsers.length,
			staffPercentage: userData.length > 0 ? (admins.length / userData.length * 100).toFixed(1) : '0'
		};
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-7xl mx-auto">
				<ToastContainer toasts={toasts} onClose={removeToast} />

				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Reports</h1>
					<p className="text-gray-600">View system reports and analytics</p>
				</div>

				{/* Summary Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Total Messes</h3>
						<p className="text-3xl font-bold text-blue-600">{messUsageData.length}</p>
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Total Meals Served</h3>
						<p className="text-3xl font-bold text-green-600">{getTotalMeals()}</p>
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Total Active Users</h3>
						<p className="text-3xl font-bold text-purple-600">{getTotalUsers()}</p>
					</div>
				</div>

				{/* Report Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{reportCards.map((report) => (
						<div key={report.id} className="bg-white shadow rounded-lg overflow-hidden flex flex-col">
							<div className="p-6 flex flex-col h-full">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
									<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(report.type)}`}>
										{report.type}
									</span>
								</div>

								<p className="text-gray-600 mb-4 flex-grow">{report.description}</p>

								<div className="space-y-2 mb-4">
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Generated:</span>
										<span className="text-gray-900">{formatDate(new Date().toISOString())}</span>
									</div>
								</div>

								<div className="space-y-2 mt-auto">
									<button
										onClick={() => handleViewReport(report.id)}
										disabled={reportLoading === report.id}
										className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
									>
										{reportLoading === report.id ? (
											<>
												<LoadingSpinner size="sm" />
												<span>Loading...</span>
											</>
										) : (
											<span>{activeReport === report.id ? 'Hide Report' : 'View Report'}</span>
										)}
									</button>

									{/* Quick Export Button */}
									<button
										onClick={() => {
											if (report.id === 'mess-usage') exportMessUsageReport();
											else if (report.id === 'booking-summary') exportBookingSummaryReport();
											else if (report.id === 'user-analytics') exportUserAnalyticsReport();
										}}
										disabled={reportLoading === report.id || (report.id === 'mess-usage' && messUsageData.length === 0) ||
											(report.id === 'booking-summary' && bookingData.length === 0) ||
											(report.id === 'user-analytics' && userData.length === 0)}
										className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
									>
										<FileText className="w-4 h-4" />
										<span>Export CSV</span>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Detailed Reports */}
				{activeReport === 'mess-usage' && (
					<div className="bg-white shadow rounded-lg overflow-hidden mb-8">
						<div className="px-6 py-4 border-b border-gray-200">
							<div className="flex justify-between items-center">
								<div>
									<h2 className="text-xl font-semibold text-gray-900">Mess Usage Report</h2>
									<p className="text-gray-600">Detailed breakdown of meal consumption by mess</p>
								</div>
								<button
									onClick={exportMessUsageReport}
									className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors space-x-2"
								>
									<Download className="w-4 h-4" />
									<span>Export to CSV</span>
								</button>
							</div>
						</div>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Mess ID
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Mess Name
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Total Meals
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Unique Users
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Avg. Meals/User
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{messUsageData.map((mess) => (
										<tr key={mess.mess_id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{mess.mess_id}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{mess.mess_name}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{mess.total_meals}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{mess.unique_users}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{mess.unique_users > 0 ? (mess.total_meals / mess.unique_users).toFixed(1) : '0'}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Booking Summary Report */}
				{activeReport === 'booking-summary' && (
					<div className="bg-white shadow rounded-lg overflow-hidden mb-8">
						<div className="px-6 py-4 border-b border-gray-200">
							<div className="flex justify-between items-center">
								<div>
									<h2 className="text-xl font-semibold text-gray-900">Booking Summary Report</h2>
									<p className="text-gray-600">Overview of all booking activities and trends</p>
								</div>
								<button
									onClick={exportBookingSummaryReport}
									className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors space-x-2"
								>
									<Download className="w-4 h-4" />
									<span>Export to CSV</span>
								</button>
							</div>
						</div>
						<div className="p-6">
							{/* Stats Grid */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
								<div className="text-center">
									<p className="text-2xl font-bold text-blue-600">{getBookingStats().total}</p>
									<p className="text-sm text-gray-500">Total Bookings</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold text-green-600">{getBookingStats().active}</p>
									<p className="text-sm text-gray-500">Active</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold text-red-600">{getBookingStats().cancelled}</p>
									<p className="text-sm text-gray-500">Cancelled</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold text-purple-600">{getBookingStats().cancellationRate}%</p>
									<p className="text-sm text-gray-500">Cancellation Rate</p>
								</div>
							</div>

							{/* Meal Type Breakdown */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-3">Bookings by Meal Type</h3>
								<div className="space-y-2">
									{Object.entries(getBookingStats().byMealType).map(([mealType, count]) => (
										<div key={mealType} className="flex justify-between items-center p-3 bg-gray-50 rounded">
											<span className="font-medium">{mealType}</span>
											<span className="text-blue-600 font-bold">{count} bookings</span>
										</div>
									))}
								</div>
							</div>

							{/* Recent Activity */}
							<div>
								<h3 className="text-lg font-semibold mb-3">Recent Activity (Last 7 Days)</h3>
								<p className="text-xl font-bold text-green-600">{getBookingStats().recentCount} new bookings</p>
							</div>
						</div>
					</div>
				)}

				{/* User Analytics Report */}
				{activeReport === 'user-analytics' && (
					<div className="bg-white shadow rounded-lg overflow-hidden mb-8">
						<div className="px-6 py-4 border-b border-gray-200">
							<div className="flex justify-between items-center">
								<div>
									<h2 className="text-xl font-semibold text-gray-900">User Analytics Report</h2>
									<p className="text-gray-600">User registration and activity metrics</p>
								</div>
								<button
									onClick={exportUserAnalyticsReport}
									className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors space-x-2"
								>
									<Download className="w-4 h-4" />
									<span>Export to CSV</span>
								</button>
							</div>
						</div>
						<div className="p-6">
							{/* User Stats Grid */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
								<div className="text-center">
									<p className="text-2xl font-bold text-blue-600">{getUserStats().total || 0}</p>
									<p className="text-sm text-gray-500">Total Users</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold text-green-600">{getUserStats().students}</p>
									<p className="text-sm text-gray-500">Students</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold text-purple-600">{getUserStats().admins}</p>
									<p className="text-sm text-gray-500">Staff/Admins</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold text-orange-600">{getUserStats().staffPercentage}%</p>
									<p className="text-sm text-gray-500">Staff Ratio</p>
								</div>
							</div>

							{/* Recent Registrations */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold mb-3">Recent Activity (Last 30 Days)</h3>
								<p className="text-xl font-bold text-green-600">{getUserStats().recentRegistrations} new registrations</p>
							</div>

							{/* User Details Table */}
							<div>
								<h3 className="text-lg font-semibold mb-3">User Breakdown</h3>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Name
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Role
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Phone
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Joined
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{userData.slice(0, 10).map((user) => (
												<tr key={user.user_id} className="hover:bg-gray-50">
													<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
														{user.name}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														{user.is_superuser ? 'Admin' : user.is_staff ? 'Staff' : 'Student'}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														{user.phone || 'N/A'}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{formatDate(user.date_joined)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								{userData.length > 10 && (
									<p className="text-sm text-gray-500 mt-2">Showing first 10 users...</p>
								)}
							</div>
						</div>
					</div>
				)}

				{messUsageData.length === 0 && !loading && (
					<div className="text-center py-8">
						<p className="text-gray-500">No report data available</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Reports; 