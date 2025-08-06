import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { authService } from './auth';
import { AuthTokens, ApiError } from '../types';

class ApiService {
	private api: AxiosInstance;

	constructor() {
		this.api = axios.create({
			baseURL: 'http://localhost:8000/api',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		this.setupInterceptors();
	}

	private setupInterceptors(): void {
		// Request interceptor to add auth token
		this.api.interceptors.request.use(
			(config) => {
				const tokens = authService.getTokens();
				if (tokens?.access) {
					config.headers.Authorization = `Bearer ${tokens.access}`;
				}
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		// Response interceptor to handle token refresh
		this.api.interceptors.response.use(
			(response: AxiosResponse) => {
				return response.data;
			},
			async (error: AxiosError) => {
				const originalRequest = error.config as any;

				if (error.response?.status === 401 && !originalRequest._retry) {
					originalRequest._retry = true;

					try {
						const tokens = authService.getTokens();
						if (tokens?.refresh) {
							const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
								refresh: tokens.refresh,
							});

							const newTokens: AuthTokens = {
								access: response.data.access,
								refresh: tokens.refresh,
							};

							authService.setTokens(newTokens);
							originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;

							return this.api(originalRequest);
						}
					} catch (refreshError) {
						authService.clearTokens();
						window.location.href = '/login';
						return Promise.reject(refreshError);
					}
				}

				return Promise.reject(error);
			}
		);
	}

	// Generic HTTP methods
	async get<T>(url: string, params?: any): Promise<T> {
		return this.api.get(url, { params });
	}

	async post<T>(url: string, data?: any): Promise<T> {
		return this.api.post(url, data);
	}

	async put<T>(url: string, data?: any): Promise<T> {
		return this.api.put(url, data);
	}

	async patch<T>(url: string, data?: any): Promise<T> {
		return this.api.patch(url, data);
	}

	async delete<T>(url: string): Promise<T> {
		return this.api.delete(url);
	}

	// User Management
	async getUsers() {
		return this.get('/users/');
	}

	async getUserDetails(userId: string) {
		return this.get(`/user/${userId}/`);
	}

	async deleteUser(userId: string) {
		return this.delete(`/user/${userId}/`);
	}

	// Mess Management
	async getAllMess() {
		return this.get('/mess/');
	}

	async getMessDetails(messId: string) {
		return this.get(`/mess/${messId}/`);
	}

	async createMess(form: any) {
		return this.post('/mess/', form);
	}

	async updateMess(messId: string, form: any) {
		return this.put(`/mess/${messId}/`, form);
	}

	async deleteMess(messId: string) {
		return this.delete(`/mess/${messId}/`);
	}

	// Meal Slots
	async getMealSlots() {
		return this.get('/meal-slot');
	}

	async createMealSlot(form: any) {
		return this.post('/meal-slot', form);
	}

	async updateMealSlot(slotId: number, data: any) {
		return this.put(`/meal-slot/${slotId}`, data);
	}

	async deleteMealSlot(slotId: string) {
		return this.delete(`/meal-slot/${slotId}`);
	}

	// Bookings
	async getBookings() {
		return this.get('/booking');
	}

	async createBooking(form: any) {
		return this.post('/booking', form);
	}

	async deleteBooking(bookingId: string) {
		return this.delete(`/booking/${bookingId}`);
	}

	async getBookingHistory(userId: string) {
		return this.get(`/history/${userId}`);
	}

	// Coupons
	async getMyCoupons() {
		return this.get('/coupons/my');
	}

	async getCoupons() {
		return this.get('/coupons/my'); // Using same endpoint as getMyCoupons for now
	}

	async generateCoupon(form: any) {
		return this.post('/coupon', form);
	}

	async validateCoupon(couponId: string) {
		return this.post('/coupon/validate', { couponId });
	}

	// Notifications
	async getNotifications() {
		return this.get('/notifications/');
	}

	async createNotification(form: any) {
		return this.post('/notifications/', form);
	}

	// Reports
	async getMessUsageReport() {
		return this.get('/report/mess-usage');
	}

	async exportReport() {
		return this.get('/report/export');
	}

	// Audit Logs
	async getAuditLogs() {
		return this.get('/audit-logs');
	}

	// Token Info
	async getTokenInfo() {
		return this.get('/token/info');
	}
}

export const apiService = new ApiService(); 