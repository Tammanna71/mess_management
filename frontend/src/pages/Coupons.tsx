import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { formatDate } from '../utils/helpers';
import LoadingAnimation from '../components/LoadingAnimation';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

interface Coupon {
	c_id: number;
	user: number;
	mess: number;
	meal_type: string;
	session_time: number;
	location: string;
	cancelled: boolean;
	created_at: string;
	created_by: string;
}

const Coupons = () => {
	const [coupons, setCoupons] = useState<Coupon[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [messes, setMesses] = useState([]);
	const [formData, setFormData] = useState({
		user: '',
		mess: '',
		meal_type: '',
		session_time: '',
		location: '',
		created_by: ''
	});
	const [formLoading, setFormLoading] = useState(false);
	const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

	useEffect(() => {
		fetchCoupons();
		fetchMesses();
	}, []);

	const fetchCoupons = async () => {
		try {
			const response = await apiService.getMyCoupons();
			setCoupons(response);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to load coupons');
		} finally {
			setLoading(false);
		}
	};

	const fetchMesses = async () => {
		try {
			const response = await apiService.getAllMess();
			setMesses(response);
		} catch (err: any) {
			showError('Failed to load messes', err.response?.data?.message || 'Please try again later');
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormLoading(true);

		try {
			await apiService.generateCoupon(formData);
			showSuccess('Coupon created successfully!');
			setFormData({
				user: '',
				mess: '',
				meal_type: '',
				session_time: '',
				location: '',
				created_by: ''
			});
			setShowCreateForm(false);
			fetchCoupons(); // Refresh the list
		} catch (err: any) {
			showError('Failed to create coupon', err.response?.data?.message || 'Please try again later');
		} finally {
			setFormLoading(false);
		}
	};

	if (loading) {
		return <LoadingAnimation />;
	}

	return (
		<>
			<div className="min-h-screen bg-gray-100 p-6">
				<div className="max-w-7xl mx-auto">


					<div className="bg-white shadow rounded-lg">
						<div className="px-6 py-4 border-b border-gray-200">
							<div className="flex justify-between items-center">
								<div>
									<h1 className="text-3xl font-bold text-gray-900">My Coupons</h1>
									<p className="text-gray-600">View your meal coupons</p>
								</div>
								<button
									onClick={() => setShowCreateForm(!showCreateForm)}
									className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
								>
									{showCreateForm ? 'Cancel' : 'Create Coupon'}
								</button>
							</div>
						</div>

						{/* Create Coupon Form */}
						{showCreateForm && (
							<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												User ID
											</label>
											<input
												type="number"
												name="user"
												value={formData.user}
												onChange={handleInputChange}
												required
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												placeholder="Enter user ID"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Mess
											</label>
											<select
												name="mess"
												value={formData.mess}
												onChange={handleInputChange}
												required
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												<option value="">Select a mess</option>
												{messes.map((mess: any) => (
													<option key={mess.mess_id} value={mess.mess_id}>
														{mess.name} - {mess.location}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Meal Type
											</label>
											<select
												name="meal_type"
												value={formData.meal_type}
												onChange={handleInputChange}
												required
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												<option value="">Select meal type</option>
												<option value="Breakfast">Breakfast</option>
												<option value="Lunch">Lunch</option>
												<option value="Dinner">Dinner</option>
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Session Time
											</label>
											<select
												name="session_time"
												value={formData.session_time}
												onChange={handleInputChange}
												required
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												<option value="">Select time</option>
												<option value="8">8:00 AM</option>
												<option value="13">1:00 PM</option>
												<option value="20">8:00 PM</option>
											</select>
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
												Created By
											</label>
											<input
												type="text"
												name="created_by"
												value={formData.created_by}
												onChange={handleInputChange}
												required
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												placeholder="Enter creator name"
											/>
										</div>
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
											{formLoading ? 'Creating...' : 'Create Coupon'}
										</button>
									</div>
								</form>
							</div>
						)}

						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Coupon ID
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Meal Type
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Session Time
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Location
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Created By
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Created
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{coupons.map((coupon) => (
										<tr key={coupon.c_id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												#{coupon.c_id}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{coupon.meal_type}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{coupon.session_time} hours
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{coupon.location}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${coupon.cancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
													}`}>
													{coupon.cancelled ? 'Used/Cancelled' : 'Valid'}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{coupon.created_by}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{formatDate(coupon.created_at)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{coupons.length === 0 && (
							<div className="text-center py-8">
								<p className="text-gray-500">No coupons found</p>
							</div>
						)}
					</div>
				</div>
			</div>
			<ToastContainer toasts={toasts} onClose={removeToast} />
		</>
	);
};

export default Coupons;