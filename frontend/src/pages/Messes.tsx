import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

interface Mess {
	mess_id: number;
	name: string;
	location: string;
	capacity?: number;
	currentOccupancy?: number;
	availability: boolean;
	stock?: number;
	admin?: string;
	current_status?: string;
	bookings?: number;
	menu?: string;
}

const Messes = () => {
	const [messes, setMesses] = useState<Mess[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		location: '',
		availability: true,
		stock: '',
		admin: '',
		current_status: 'Active',
		bookings: 0,
		menu: ''
	});
	const [formLoading, setFormLoading] = useState(false);
	const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

	useEffect(() => {
		fetchMesses();
	}, []);

	const fetchMesses = async () => {
		try {
			const response = await apiService.getAllMess();
			setMesses(response);
		} catch (err: any) {
			showError('Failed to load messes', err.response?.data?.message || 'Please try again later');
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		let processedValue: any = value;
		
		if (type === 'checkbox') {
			processedValue = (e.target as HTMLInputElement).checked;
		} else if (name === 'stock' || name === 'bookings') {
			processedValue = parseInt(value) || 0;
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
			await apiService.createMess(formData);
			showSuccess('Mess created successfully!');
			setFormData({
				name: '',
				location: '',
				availability: true,
				stock: '',
				admin: '',
				current_status: 'Active',
				bookings: 0,
				menu: ''
			});
			setShowCreateForm(false);
			fetchMesses(); // Refresh the list
		} catch (err: any) {
			showError('Failed to create mess', err.response?.data?.message || 'Please try again later');
		} finally {
			setFormLoading(false);
		}
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Messes</h1>
							<p className="text-gray-600">View and manage all messes</p>
						</div>
						<button
							onClick={() => setShowCreateForm(!showCreateForm)}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
						>
							{showCreateForm ? 'Cancel' : 'Create Mess'}
						</button>
					</div>
				</div>

				{/* Create Mess Form */}
				{showCreateForm && (
					<div className="mb-8 bg-white shadow rounded-lg p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Mess</h2>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Mess Name
									</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter mess name"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Location
									</label>
									<input
										type="text"
										name="location"
										value={formData.location}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter location"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Stock
									</label>
									<input
										type="number"
										name="stock"
										value={formData.stock}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter stock capacity"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Admin
									</label>
									<input
										type="text"
										name="admin"
										value={formData.admin}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter admin name"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Status
									</label>
									<select
										name="current_status"
										value={formData.current_status}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="Active">Active</option>
										<option value="Inactive">Inactive</option>
										<option value="Maintenance">Maintenance</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Menu
									</label>
									<input
										type="text"
										name="menu"
										value={formData.menu}
										onChange={handleInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter menu description"
									/>
								</div>
							</div>
							<div className="flex items-center space-x-6">
								<label className="flex items-center">
									<input
										type="checkbox"
										name="availability"
										checked={formData.availability}
										onChange={handleInputChange}
										className="mr-2"
									/>
									<span className="text-sm text-gray-700">Available</span>
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
									{formLoading ? 'Creating...' : 'Create Mess'}
								</button>
							</div>
						</form>
					</div>
				)}



				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{messes.map((mess) => (
						<div key={mess.mess_id} className="bg-white shadow rounded-lg overflow-hidden">
							<div className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-medium text-gray-900">{mess.name}</h3>
									<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${mess.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
										}`}>
										{mess.availability ? 'Available' : 'Unavailable'}
									</span>
								</div>

								<p className="text-gray-600 mb-4">{mess.menu || 'No menu available'}</p>

								<div className="space-y-2 mb-4">
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Location:</span>
										<span className="text-gray-900">{mess.location || 'N/A'}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Stock:</span>
										<span className="text-gray-900">{mess.stock || 0}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Bookings:</span>
										<span className="text-gray-900">{mess.bookings || 0}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Status:</span>
										<span className="text-gray-900">{mess.current_status || 'Unknown'}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500">Admin:</span>
										<span className="text-gray-900">{mess.admin || 'N/A'}</span>
									</div>
								</div>

								<Link
									to={`/mess/${mess.mess_id}`}
									className="block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
								>
									View Details
								</Link>
							</div>
						</div>
					))}
				</div>

				{messes.length === 0 && (
					<div className="text-center py-8">
						<p className="text-gray-500">No messes found</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Messes; 