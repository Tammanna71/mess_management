import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import { apiService } from '../services/api';
import { User, AuthTokens, LoginCredentials, RegisterData, AuthContextType } from '../types';

interface AuthState {
	user: User | null;
	loading: boolean;
	isAuthenticated: boolean;
	tokens: AuthTokens | null;
}

type AuthAction =
	| { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
	| { type: 'LOGOUT' }
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
	user: null,
	loading: true,
	isAuthenticated: false,
	tokens: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
	switch (action.type) {
		case 'LOGIN_SUCCESS':
			return {
				...state,
				user: action.payload.user,
				tokens: action.payload.tokens,
				isAuthenticated: true,
				loading: false,
			};
		case 'LOGOUT':
			return {
				...state,
				user: null,
				tokens: null,
				isAuthenticated: false,
				loading: false,
			};
		case 'SET_LOADING':
			return {
				...state,
				loading: action.payload,
			};
		case 'UPDATE_USER':
			return {
				...state,
				user: action.payload,
			};
		default:
			return state;
	}
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);

	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async (): Promise<void> => {
		try {
			const tokens = authService.getTokens();
			if (tokens) {
				const userInfo = await apiService.getTokenInfo();
				// Ensure userInfo has the expected structure
				if (userInfo && userInfo.user_info) {
					dispatch({
						type: 'LOGIN_SUCCESS',
						payload: {
							user: userInfo.user_info,
							tokens,
						},
					});
				} else {
					console.error('Invalid user info structure:', userInfo);
					authService.clearTokens();
					dispatch({ type: 'SET_LOADING', payload: false });
				}
			} else {
				dispatch({ type: 'SET_LOADING', payload: false });
			}
		} catch (error) {
			console.error('Auth check failed:', error);
			authService.clearTokens();
			dispatch({ type: 'SET_LOADING', payload: false });
		}
	};

	const login = async (credentials: LoginCredentials, userType: string = 'student'): Promise<{ success: boolean; user?: User }> => {
		try {
			dispatch({ type: 'SET_LOADING', payload: true });
			const endpoint = userType === 'admin' ? '/auth/admin/login/' : '/auth/student/login/';
			const response = await apiService.post(endpoint, credentials);

			const tokens: AuthTokens = {
				access: response.access,
				refresh: response.refresh,
			};

			authService.setTokens(tokens);

			// Get user info after login
			const userInfo = await apiService.getTokenInfo();

			dispatch({
				type: 'LOGIN_SUCCESS',
				payload: {
					user: userInfo.user_info,
					tokens,
				},
			});

			return { success: true, user: userInfo.user_info };
		} catch (error: any) {
			console.error('Login failed:', error);
			dispatch({ type: 'SET_LOADING', payload: false });

			// Handle specific error cases
			if (error.response?.status === 401) {
				throw new Error('Invalid credentials. Please check your phone number and password.');
			} else if (error.response?.status === 400) {
				throw new Error(error.response?.data?.message || 'Invalid input. Please check your details.');
			} else if (error.response?.status >= 500) {
				throw new Error('Server error. Please try again later.');
			} else {
				throw new Error(error.response?.data?.message || error.message || 'Login failed. Please try again.');
			}
		}
	};

	const register = async (userData: RegisterData, userType: string = 'student'): Promise<{ success: boolean; user?: User }> => {
		try {
			dispatch({ type: 'SET_LOADING', payload: true });
			const endpoint = userType === 'admin' ? '/auth/admin/signup/' : '/auth/signup/';
			const response = await apiService.post(endpoint, userData);
			return { success: true, user: response.user };
		} catch (error) {
			console.error('Registration failed:', error);
			dispatch({ type: 'SET_LOADING', payload: false });
			return { success: false };
		}
	};

	const logout = (): void => {
		try {
			authService.clearTokens();
			dispatch({ type: 'LOGOUT' });
			// Force page reload to clear any cached state
			window.location.href = '/';
		} catch (error) {
			console.error('Logout error:', error);
			// Force redirect even if there's an error
			window.location.href = '/';
		}
	};

	const updateUser = (userData: Partial<User>): void => {
		if (state.user) {
			dispatch({
				type: 'UPDATE_USER',
				payload: { ...state.user, ...userData },
			});
		}
	};

	const value: AuthContextType = {
		user: state.user,
		loading: state.loading,
		isAuthenticated: state.isAuthenticated,
		tokens: state.tokens,
		login,
		register,
		logout,
		updateUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		// More detailed error for debugging
		console.error('useAuth called outside of AuthProvider. Component stack:', new Error().stack);
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}; 