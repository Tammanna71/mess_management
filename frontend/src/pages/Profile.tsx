import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import LoadingAnimation from '../components/LoadingAnimation';

interface UserProfile {
	user_id: number;
	name: string;
	email: string;
	roll_no: string;
	room_no: string;
	phone: string;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
	date_joined: string;
}

const Profile = () => {
	const { user } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		roomNo: ''
	});

	const getUserRole = (profile: UserProfile): string => {
		if (profile.is_superuser) return 'Admin';
		if (profile.is_staff) return 'Staff';
		return 'Student';
	};

	const formatDate = (dateString: string): string => {
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) return 'N/A';
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return 'N/A';
		}
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
		try {
			// Get user info from token instead of non-existent profile endpoint
			const userInfo = await apiService.getTokenInfo() as any;
			const userData = userInfo.user_info;

			// Debug: Log the actual data structure
			console.log('Raw user data from backend:', userData);

			const profileData: UserProfile = {
				user_id: userData.user_id || userData.id,
				name: userData.name || '',
				email: userData.email || '',
				roll_no: userData.roll_no || userData.rollNo || '',
				room_no: userData.room_no || userData.roomNo || '',
				phone: userData.phone || '',
				is_active: userData.is_active !== undefined ? userData.is_active : true,
				is_staff: userData.is_staff || false,
				is_superuser: userData.is_superuser || false,
				date_joined: userData.date_joined || userData.dateJoined || new Date().toISOString()
			};

			console.log('Processed profile data:', profileData);

			setProfile(profileData);
			setFormData({
				name: profileData.name,
				phone: profileData.phone,
				roomNo: profileData.room_no
			});
		} catch (err: any) {
			console.error('Profile fetch error:', err);
			setError(err.response?.data?.message || 'Failed to load profile');
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const userInfo = await apiService.getTokenInfo() as any;
			await apiService.put(`/user/${userInfo.user_info.user_id}/`, {
				name: formData.name,
				phone: formData.phone,
				room_no: formData.roomNo
			});
			await fetchProfile();
			setIsEditing(false);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to update profile');
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	if (error && !profile) {
		return (
			<div className="min-h-screen bg-gray-100 p-6">
				<div className="max-w-4xl mx-auto">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						{error}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Profile</h1>
					<p className="text-gray-600">Manage your account information</p>
				</div>



				{profile && (
					<div className="bg-white shadow rounded-lg">
						<div className="px-6 py-4 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<div className="flex-shrink-0 h-16 w-16">
										<div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
											<span className="text-xl font-medium text-gray-700">
												{profile.name.charAt(0).toUpperCase()}
											</span>
										</div>
									</div>
									<div className="ml-6">
										<h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
										<p className="text-gray-600">{profile.email}</p>
									</div>
								</div>
								<button
									onClick={() => setIsEditing(!isEditing)}
									className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
								>
									{isEditing ? 'Cancel' : 'Edit Profile'}
								</button>
							</div>
						</div>

						<div className="px-6 py-4">
							{isEditing ? (
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Full Name
											</label>
											<input
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Phone Number
											</label>
											<input
												type="tel"
												name="phone"
												value={formData.phone}
												onChange={handleChange}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Room Number
											</label>
											<input
												type="text"
												name="roomNo"
												value={formData.roomNo}
												onChange={handleChange}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
												required
											/>
										</div>
									</div>
									<div className="flex justify-end space-x-3">
										<button
											type="button"
											onClick={() => setIsEditing(false)}
											className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
										>
											Cancel
										</button>
										<button
											type="submit"
											className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
										>
											Save Changes
										</button>
									</div>
								</form>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
										<dl className="space-y-3">
											<div>
												<dt className="text-sm font-medium text-gray-500">Full Name</dt>
												<dd className="text-sm text-gray-900">{profile.name}</dd>
											</div>
											<div>
												<dt className="text-sm font-medium text-gray-500">Email</dt>
												<dd className="text-sm text-gray-900">{profile.email}</dd>
											</div>
											<div>
												<dt className="text-sm font-medium text-gray-500">Phone</dt>
												<dd className="text-sm text-gray-900">{profile.phone}</dd>
											</div>
										</dl>
									</div>

									<div>
										<h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
										<dl className="space-y-3">
											<div>
												<dt className="text-sm font-medium text-gray-500">Roll Number</dt>
												<dd className="text-sm text-gray-900">{profile.roll_no || 'N/A'}</dd>
											</div>
											<div>
												<dt className="text-sm font-medium text-gray-500">Room Number</dt>
												<dd className="text-sm text-gray-900">{profile.room_no || 'N/A'}</dd>
											</div>
										</dl>
									</div>
								</div>
							)}

							<div className="mt-8 pt-6 border-t border-gray-200">
								<h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
								<dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<dt className="text-sm font-medium text-gray-500">Role</dt>
										<dd className="text-sm text-gray-900">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserRole(profile) === 'Admin' ? 'bg-red-100 text-red-800' :
												getUserRole(profile) === 'Staff' ? 'bg-yellow-100 text-yellow-800' :
													'bg-green-100 text-green-800'
												}`}>
												{getUserRole(profile)}
											</span>
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Status</dt>
										<dd className="text-sm text-gray-900">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
												}`}>
												{profile.is_active ? 'Active' : 'Inactive'}
											</span>
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Joined</dt>
										<dd className="text-sm text-gray-900">
											{formatDate(profile.date_joined)}
										</dd>
									</div>
								</dl>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Profile; 