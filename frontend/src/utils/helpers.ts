import { User, UserRole } from '../types';

// Role checking functions
export const isAdmin = (user: User | null): boolean => {
	return user?.is_superuser || false;
};

export const isStaff = (user: User | null): boolean => {
	return user?.is_staff || false;
};

export const isStudent = (user: User | null): boolean => {
	return !user?.is_superuser && !user?.is_staff;
};

export const hasRequiredRole = (user: User | null, requiredRoles: string[]): boolean => {
	if (!user) return false;

	if (user.is_superuser) return true;
	if (user.is_staff && requiredRoles.includes('staff')) return true;
	if (requiredRoles.includes('admin') && user.is_superuser) return true;
	if (requiredRoles.includes('student') && !user.is_superuser && !user.is_staff) return true;

	return false;
};

export const getUserRole = (user: User | null): UserRole => {
	if (user?.is_superuser) return 'superuser';
	if (user?.is_staff) return 'staff';
	return 'student';
};

// Permission checking functions
export const hasPermission = (user: User | null, permission: string): boolean => {
	if (!user) return false;
	return user.user_permissions.includes(permission);
};

export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
	if (!user) return false;
	return permissions.some(permission => user.user_permissions.includes(permission));
};

export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
	if (!user) return false;
	return permissions.every(permission => user.user_permissions.includes(permission));
};

// Date and time utilities
export const formatDate = (dateString: string | null | undefined): string => {
	if (!dateString) return 'N/A';

	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return 'Invalid Date';
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	} catch (error) {
		return 'Invalid Date';
	}
};

export const formatDateTime = (dateString: string | null | undefined): string => {
	if (!dateString) return 'N/A';

	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return 'Invalid Date';
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch (error) {
		return 'Invalid Date';
	}
};

export const formatTime = (timeString: string): string => {
	const [hours, minutes] = timeString.split(':');
	const date = new Date();
	date.setHours(parseInt(hours), parseInt(minutes));
	return date.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
	});
};

// String utilities
export const capitalizeFirst = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + '...';
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
	return password.length >= 8;
};

// Status utilities
export const getStatusColor = (status: string): string => {
	switch (status.toLowerCase()) {
		case 'active':
		case 'confirmed':
		case 'success':
			return 'green';
		case 'pending':
		case 'waiting':
			return 'yellow';
		case 'inactive':
		case 'cancelled':
		case 'error':
			return 'red';
		default:
			return 'gray';
	}
};

export const getStatusBadgeColor = (status: string): string => {
	switch (status.toLowerCase()) {
		case 'active':
		case 'confirmed':
			return 'bg-green-100 text-green-800';
		case 'pending':
		case 'waiting':
			return 'bg-yellow-100 text-yellow-800';
		case 'inactive':
		case 'cancelled':
			return 'bg-red-100 text-red-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
	return array.reduce((groups, item) => {
		const group = String(item[key]);
		groups[group] = groups[group] || [];
		groups[group].push(item);
		return groups;
	}, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
	return [...array].sort((a, b) => {
		const aVal = a[key];
		const bVal = b[key];

		if (aVal < bVal) return direction === 'asc' ? -1 : 1;
		if (aVal > bVal) return direction === 'asc' ? 1 : -1;
		return 0;
	});
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
	func: T,
	wait: number
): ((...args: Parameters<T>) => void) => {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}; 