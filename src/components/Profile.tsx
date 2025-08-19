import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import {
	User,
	Mail,
	Phone,
	GraduationCap,
	Home,
	Calendar,
	Shield,
	Edit3,
	Save,
	X,
	Camera,
	MapPin,
	Clock,
	Award,
	Settings
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
	const { user } = useAuth();
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('profile');

	useEffect(() => {
		if (user) {
			setForm({
				name: user.name || '',
				email: user.email || '',
				phone: user.phone || '',
				roll_no: user.roll_no || '',
				room_no: user.room_no || ''
			});
		}
	}, [user]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await apiService.put(`/user/${user.user_id}/`, form);
			setEditing(false);
			// Success toast will be shown by the API service
		} catch (err) {
			// Error toast will be shown by the API service
		} finally {
			setIsLoading(false);
		}
	};

	const getUserRole = () => {
		if (user?.is_superuser) return 'Super Admin';
		if (user?.is_staff) return 'Staff Member';
		return 'Student';
	};

	const getRoleColor = () => {
		if (user?.is_superuser) return 'from-red-500 to-red-600';
		if (user?.is_staff) return 'from-blue-500 to-blue-600';
		return 'from-green-500 to-green-600';
	};

	const getRoleIcon = () => {
		if (user?.is_superuser) return <Shield className="w-5 h-5" />;
		if (user?.is_staff) return <Settings className="w-5 h-5" />;
		return <GraduationCap className="w-5 h-5" />;
	};

	if (!user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
				<LoadingSpinner size="lg" text="Loading profile..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden">
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
				<User className="absolute top-32 left-1/4 w-8 h-8 text-green-300 animate-pulse" />
				<Mail className="absolute top-1/2 right-1/3 w-6 h-6 text-green-400 animate-pulse" style={{ animationDelay: '1s' }} />
				<Phone className="absolute bottom-1/3 left-1/3 w-7 h-7 text-green-300 animate-pulse" style={{ animationDelay: '2s' }} />
				<GraduationCap className="absolute bottom-40 right-1/4 w-5 h-5 text-green-400 animate-pulse" style={{ animationDelay: '3s' }} />
			</div>

			{/* Header */}
			<div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 relative overflow-hidden z-10">
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
					<div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-full"></div>
					<div className="absolute top-1/2 left-1/2 w-20 h-20 border-4 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
				</div>

				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
						{/* Profile Picture */}
						<div className="relative">
							<div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 animate-pulse">
								<User className="w-16 h-16 text-white" />
							</div>
							<button className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-110">
								<Camera className="w-5 h-5 text-white" />
							</button>
						</div>

						{/* User Info */}
						<div className="text-center md:text-left text-white">
							<h1 className="text-4xl font-bold mb-2">{user.name}</h1>
							<div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
								<div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getRoleColor()} shadow-lg`}>
									{getRoleIcon()}
									<span className="ml-2 font-semibold">{getUserRole()}</span>
								</div>
							</div>
							<div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-green-100">
								<div className="flex items-center space-x-2">
									<Mail className="w-4 h-4" />
									<span>{user.email}</span>
								</div>
								<div className="flex items-center space-x-2">
									<Phone className="w-4 h-4" />
									<span>{user.phone}</span>
								</div>
								<div className="flex items-center space-x-2">
									<Calendar className="w-4 h-4" />
									<span>Joined {new Date(user.date_joined).toLocaleDateString()}</span>
								</div>
							</div>
						</div>

						{/* Edit Button */}
						<div className="md:ml-auto">
							<button
								onClick={() => setEditing(!editing)}
								className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 shadow-lg transform hover:scale-105"
							>
								{editing ? (
									<>
										<X className="w-5 h-5 mr-2" />
										Cancel
									</>
								) : (
									<>
										<Edit3 className="w-5 h-5 mr-2" />
										Edit Profile
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* Profile Information */}
						<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-green-100/50 hover:shadow-3xl transition-all duration-300">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Profile Information</h2>
								{!editing && (
									<button
										onClick={() => setEditing(true)}
										className="inline-flex items-center px-4 py-2 text-green-600 hover:text-green-700 transition-all duration-200 hover:bg-green-50 rounded-lg"
									>
										<Edit3 className="w-4 h-4 mr-2" />
										Edit
									</button>
								)}
							</div>

							{editing ? (
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
												Full Name
											</label>
											<div className="relative group">
												<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
													<User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
												</div>
												<input
													id="name"
													name="name"
													type="text"
													value={form.name}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
												/>
											</div>
										</div>

										<div>
											<label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
												Email Address
											</label>
											<div className="relative group">
												<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
													<Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
												</div>
												<input
													id="email"
													name="email"
													type="email"
													value={form.email}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
												/>
											</div>
										</div>

										<div>
											<label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
												Phone Number
											</label>
											<div className="relative group">
												<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
													<Phone className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
												</div>
												<input
													id="phone"
													name="phone"
													type="tel"
													value={form.phone}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
												/>
											</div>
										</div>

										<div>
											<label htmlFor="roll_no" className="block text-sm font-semibold text-gray-700 mb-2">
												Roll Number
											</label>
											<div className="relative group">
												<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
													<GraduationCap className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
												</div>
												<input
													id="roll_no"
													name="roll_no"
													type="text"
													value={form.roll_no}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
												/>
											</div>
										</div>

										<div className="md:col-span-2">
											<label htmlFor="room_no" className="block text-sm font-semibold text-gray-700 mb-2">
												Room Number
											</label>
											<div className="relative group">
												<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
													<Home className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
												</div>
												<input
													id="room_no"
													name="room_no"
													type="text"
													value={form.room_no}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
												/>
											</div>
										</div>
									</div>

									<div className="flex space-x-4">
										<button
											type="submit"
											disabled={isLoading}
											className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
										>
											{isLoading ? (
												<div className="flex items-center justify-center">
													<LoadingSpinner size="sm" className="mr-3" />
													Saving...
												</div>
											) : (
												<div className="flex items-center justify-center">
													<Save className="w-5 h-5 mr-2" />
													Save Changes
												</div>
											)}
										</button>
										<button
											type="button"
											onClick={() => setEditing(false)}
											className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
										>
											Cancel
										</button>
									</div>
								</form>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
											<div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
												<User className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-green-700">Full Name</p>
												<p className="text-lg font-semibold text-gray-900">{user.name}</p>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
											<div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
												<Mail className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-green-700">Email Address</p>
												<p className="text-lg font-semibold text-gray-900">{user.email}</p>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
											<div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
												<Phone className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-green-700">Phone Number</p>
												<p className="text-lg font-semibold text-gray-900">{user.phone}</p>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
											<div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
												<GraduationCap className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-green-700">Roll Number</p>
												<p className="text-lg font-semibold text-gray-900">{user.roll_no}</p>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
											<div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
												<Home className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-green-700">Room Number</p>
												<p className="text-lg font-semibold text-gray-900">{user.room_no}</p>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
											<div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
												<Calendar className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="text-sm font-medium text-green-700">Member Since</p>
												<p className="text-lg font-semibold text-gray-900">
													{new Date(user.date_joined).toLocaleDateString('en-US', {
														year: 'numeric',
														month: 'long',
														day: 'numeric'
													})}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-8">
						{/* Account Status */}
						<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-green-100/50 hover:shadow-3xl transition-all duration-300">
							<h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4">Account Status</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-green-700 font-medium">Account Status</span>
									<span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
										}`}>
										{user.is_active ? 'Active' : 'Inactive'}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-green-700 font-medium">User ID</span>
									<span className="font-mono text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
										#{user.user_id}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-green-700 font-medium">Role</span>
									<div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${getRoleColor()} text-white text-xs font-semibold`}>
										{getRoleIcon()}
										<span className="ml-1">{getUserRole()}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Quick Stats */}
						<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-green-100/50 hover:shadow-3xl transition-all duration-300">
							<h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4">Quick Stats</h3>
							<div className="space-y-4">
								<div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
									<div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
										<Clock className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-green-700">Last Login</p>
										<p className="text-sm font-semibold text-gray-900">Today, 2:30 PM</p>
									</div>
								</div>
								<div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
									<div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
										<Award className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-green-700">Meals This Month</p>
										<p className="text-sm font-semibold text-gray-900">42 meals</p>
									</div>
								</div>
								<div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
									<div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
										<MapPin className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-green-700">Preferred Hall</p>
										<p className="text-sm font-semibold text-gray-900">Main Dining</p>
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

export default Profile;