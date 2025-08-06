import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { formatDate } from '../utils/helpers';
import LoadingAnimation from '../components/LoadingAnimation';

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

	useEffect(() => {
		fetchCoupons();
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

	if (loading) {
		return <LoadingAnimation />;
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-7xl mx-auto">


				<div className="bg-white shadow rounded-lg">
					<div className="px-6 py-4 border-b border-gray-200">
						<h1 className="text-3xl font-bold text-gray-900">My Coupons</h1>
						<p className="text-gray-600">View your meal coupons</p>
					</div>

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
	);
};

export default Coupons;