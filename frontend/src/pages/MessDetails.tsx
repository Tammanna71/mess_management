import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import LoadingAnimation from '../components/LoadingAnimation';

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

const MessDetails = () => {
	const { messId } = useParams<{ messId: string }>();
	const [mess, setMess] = useState<Mess | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (messId) {
			fetchMess();
		}
	}, [messId]);

	const fetchMess = async () => {
		try {
			const response = await apiService.getMessDetails(messId!);
			setMess(response);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to load mess details');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-100 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="text-center">Loading mess details...</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-100 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						{error}
					</div>
				</div>
			</div>
		);
	}

	if (!mess) {
		return (
			<div className="min-h-screen bg-gray-100 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="text-center">Mess not found</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8">
					<Link
						to="/messes"
						className="text-indigo-600 hover:text-indigo-900 mb-4 inline-block"
					>
						← Back to Messes
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">{mess.name}</h1>
				</div>

				<div className="bg-white shadow rounded-lg">
					<div className="px-6 py-4 border-b border-gray-200">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold text-gray-900">{mess.name}</h2>
								<p className="text-gray-600">{mess.location || 'No location specified'}</p>
							</div>
							<span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${mess.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
								}`}>
								{mess.availability ? 'Available' : 'Unavailable'}
							</span>
						</div>
					</div>

					<div className="px-6 py-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h3 className="text-lg font-medium text-gray-900 mb-4">Mess Information</h3>
								<dl className="space-y-3">
									<div>
										<dt className="text-sm font-medium text-gray-500">Name</dt>
										<dd className="text-sm text-gray-900">{mess.name}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Location</dt>
										<dd className="text-sm text-gray-900">{mess.location || 'N/A'}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Current Status</dt>
										<dd className="text-sm text-gray-900">{mess.current_status || 'Unknown'}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Admin</dt>
										<dd className="text-sm text-gray-900">{mess.admin || 'N/A'}</dd>
									</div>
								</dl>
							</div>

							<div>
								<h3 className="text-lg font-medium text-gray-900 mb-4">Operational Information</h3>
								<dl className="space-y-3">
									<div>
										<dt className="text-sm font-medium text-gray-500">Stock</dt>
										<dd className="text-sm text-gray-900">{mess.stock || 0}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Total Bookings</dt>
										<dd className="text-sm text-gray-900">{mess.bookings || 0}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">Availability</dt>
										<dd className="text-sm text-gray-900">{mess.availability ? 'Available' : 'Not Available'}</dd>
									</div>
								</dl>
							</div>
						</div>

						<div className="mt-8 pt-6 border-t border-gray-200">
							<h3 className="text-lg font-medium text-gray-900 mb-4">Menu</h3>
							<div className="space-y-3">
								<p className="text-gray-600">{mess.menu || 'No menu available'}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MessDetails; 