import React, { useState, useEffect } from 'react';
// import { apiService } from '../services/api';

// Mock API service for demonstration
const apiService = {
  getBookingHistory: async (userId: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data that matches the interface
    return [
      {
        id: 1,
        user: {
          name: "John Doe",
          email: "john@example.com"
        },
        mess: {
          name: "Central Mess",
          location: "Block A, Campus"
        },
        mealSlot: {
          name: "Lunch",
          startTime: "12:00",
          endTime: "14:00"
        },
        date: "2024-08-15",
        status: "completed",
        createdAt: "2024-08-10T10:30:00Z",
        completedAt: "2024-08-15T13:30:00Z"
      },
      {
        id: 2,
        user: {
          name: "John Doe",
          email: "john@example.com"
        },
        mess: {
          name: "North Mess",
          location: "Block B, Campus"
        },
        mealSlot: {
          name: "Dinner",
          startTime: "18:00",
          endTime: "20:00"
        },
        date: "2024-08-14",
        status: "cancelled",
        createdAt: "2024-08-12T15:45:00Z"
      },
      {
        id: 3,
        user: {
          name: "John Doe",
          email: "john@example.com"
        },
        mess: {
          name: "South Mess",
          location: "Block C, Campus"
        },
        mealSlot: {
          name: "Breakfast",
          startTime: "07:00",
          endTime: "09:00"
        },
        date: "2024-08-13",
        status: "no-show",
        createdAt: "2024-08-11T20:15:00Z"
      }
    ];
  }
};

interface BookingHistory {
  id: number;
  user: {
    name: string;
    email: string;
  };
  mess: {
    name: string;
    location: string;
  };
  mealSlot: {
    name: string;
    startTime: string;
    endTime: string;
  };
  date: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

// Simple loading component
const LoadingAnimation = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
);

const BookingHistory = () => {
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock user data - replace this with your actual user context/state
  const user = {
    user_id: 123,
    name: "John Doe",
    email: "john@example.com"
  };

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getBookingHistory(user?.user_id || 0);
      setBookings(response);
    } catch (err: any) {
      console.error('Error fetching booking history:', err);
      setError(err.response?.data?.message || 'Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="font-bold">Error</h2>
            <p>{error}</p>
            <button
              onClick={fetchBookingHistory}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
          <p className="text-gray-600">View your past bookings</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No booking history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mess
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meal Slot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.mess?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.mess?.location || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.mealSlot?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.mealSlot?.startTime && booking.mealSlot?.endTime
                              ? `${booking.mealSlot.startTime} - ${booking.mealSlot.endTime}`
                              : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(booking.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(booking.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;