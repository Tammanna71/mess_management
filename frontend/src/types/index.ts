// User Types
export interface User {
	user_id: string;
	name: string;
	email: string;
	phone?: string;
	roll_no?: string;
	room_no?: string;
	is_superuser: boolean;
	is_staff: boolean;
	is_active: boolean;
	date_joined: string;
	groups: string[];
	user_permissions: string[];
	roles?: string[];
	permissions?: string[];
}

// Auth Types
export interface AuthTokens {
	access: string;
	refresh: string;
}

export interface LoginCredentials {
	phone: string;
	password: string;
}

export interface RegisterData {
	username: string;
	email: string;
	password: string;
	name: string;
	roll_no?: string;
	room_no?: string;
}

// Mess Types
export interface Mess {
	mess_id: number;
	name: string;
	location: string;
	availability: boolean;
	stock?: number;
	admin?: string;
	current_status?: string;
	bookings?: number;
	menu?: string;
}

// Meal Slot Types
export interface MealSlot {
	id: number;
	mess: number;
	mess_name?: string;
	mess_location?: string;
	type: string;
	available: boolean;
	session_time: number;
	delayed: boolean;
	delay_minutes?: number;
	reserve_meal: boolean;
	booking_count?: number;
}

// Booking Types
export interface Booking {
	booking_id: number;
	user: {
		name: string;
		email: string;
	};
	meal_slot: {
		type: string;
		session_time: number;
		mess: {
			name: string;
			location: string;
		};
	};
	mess: {
		name: string;
		location: string;
	};
	created_at: string;
	cancelled: boolean;
}

// Coupon Types
export interface Coupon {
	c_id: number;
	user: number;
	mess: number;
	mess_name?: string;
	meal_type: string;
	session_time: number;
	location: string;
	cancelled: boolean;
	created_at: string;
	created_by: string;
}

// Notification Types
export interface Notification {
	id: string;
	title: string;
	message: string;
	user?: string;
	is_read: boolean;
	created_at: string;
}

// Report Types
export interface MessUsageReport {
	mess_name: string;
	total_bookings: number;
	total_users: number;
	usage_percentage: number;
}

// Audit Log Types
export interface AuditLog {
	id: string;
	user: string;
	action: string;
	resource: string;
	details: string;
	ip_address: string;
	created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
	data: T;
	message?: string;
	status: string;
}

export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

// Form Types
export interface MessForm {
	name: string;
	location: string;
	capacity: number;
	description?: string;
}

export interface MealSlotForm {
	mess: string;
	meal_type: string;
	session_time: string;
	delay_minutes: number;
}

export interface BookingForm {
	meal_slot: string;
	booking_date: string;
}

export interface CouponForm {
	mess: string;
	discount_percentage: number;
}

export interface NotificationForm {
	title: string;
	message: string;
	user?: string;
}

// Component Props Types
export interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRoles?: string[];
	requiredPermissions?: string[];
}

export interface NavigationProps {
	// Add any specific props if needed
}

export interface DashboardProps {
	// Add any specific props if needed
}

// Context Types
export interface AuthContextType {
	user: User | null;
	loading: boolean;
	isAuthenticated: boolean;
	tokens: AuthTokens | null;
	login: (credentials: LoginCredentials, userType?: string) => Promise<{ success: boolean; user?: User }>;
	register: (userData: RegisterData, userType?: string) => Promise<{ success: boolean; user?: User }>;
	logout: () => void;
	updateUser: (userData: Partial<User>) => void;
}

// Utility Types
export type UserRole = 'admin' | 'staff' | 'student' | 'superuser';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

// Error Types
export interface ApiError {
	message: string;
	status: number;
	errors?: Record<string, string[]>;
} 