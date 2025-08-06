import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { useToast } from '../../hooks/useToast';
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
	const { toasts, removeToast, error: showError, success: showSuccess } = useToast();

	useEffect(() => {
		fetchMesses();
	}, []);

	const fetchMesses = async () => {
		try {
			const response = await apiService.getAllMess();
			setMesses(response);
		} catch (err: any) {
			setError(err.response?.data?.message || 'Failed to load messes');
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
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Messes</h1>
					<p className="text-gray-600">View and manage all messes</p>
				</div>



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