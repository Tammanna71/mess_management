import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Phone, Lock, Shield, GraduationCap, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState('student');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Prevent double submission
		if (isSubmitting) return;

		setError('');
		setLoading(true);
		setIsSubmitting(true);

		try {
			const result = await login({ phone, password }, role);

			// Debug logging to understand user properties
			console.log('Login result user:', result.user);
			console.log('User is_superuser:', result.user?.is_superuser);
			console.log('User is_staff:', result.user?.is_staff);
			console.log('Selected role:', role);

			if (result.user?.is_superuser || result.user?.is_staff) {
				navigate('/admin');
			} else {
				navigate('/student');
			}
		} catch (err: any) {
			// Prevent duplicate error messages by ensuring we only set the error once
			const errorMessage = err.message || 'Invalid credentials. Please try again.';
			setError(errorMessage);
		} finally {
			setLoading(false);
			setIsSubmitting(false);
		}
	};

	const getRoleIcon = (roleType) => {
		switch (roleType) {
			case 'admin':
				return <Shield className="w-5 h-5" />;
			default:
				return <GraduationCap className="w-5 h-5" />;
		}
	};

	const getRoleColor = (roleType) => {
		switch (roleType) {
			case 'admin':
				return 'from-red-500 to-red-600';
			default:
				return 'from-orange-500 to-orange-600';
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 relative overflow-hidden">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-20 left-20 w-32 h-32 border-2 border-orange-300 rounded-full"></div>
				<div className="absolute top-40 right-32 w-24 h-24 border-2 border-orange-400 rounded-full"></div>
				<div className="absolute bottom-32 left-40 w-20 h-20 border-2 border-orange-300 rounded-full"></div>
				<div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-orange-400 rounded-full"></div>
			</div>

			<div className="relative z-10 flex min-h-screen">
				{/* Left Side - Branding */}
				<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 relative overflow-hidden">
					{/* Decorative Elements */}
					<div className="absolute inset-0 opacity-10">
						<div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
						<div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white rounded-full"></div>
						<div className="absolute top-1/2 left-20 w-24 h-24 border-4 border-white rounded-full"></div>
					</div>

					<div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
						{/* Logo */}
						<div className="mb-8">
							<div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-2xl">
								<Utensils className="w-12 h-12 text-white" />
							</div>
							<h1 className="text-4xl font-bold mb-4">Mess Management</h1>
							<p className="text-xl text-orange-100">Digital Dining Experience</p>
						</div>

						{/* Features */}
						<div className="space-y-6 max-w-md">
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
									<Utensils className="w-6 h-6" />
								</div>
								<div className="text-left">
									<h3 className="font-semibold">Smart Meal Planning</h3>
									<p className="text-orange-100 text-sm">Efficient meal management and planning</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
									<Shield className="w-6 h-6" />
								</div>
								<div className="text-left">
									<h3 className="font-semibold">User Management</h3>
									<p className="text-orange-100 text-sm">Role-based access for all users</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
									<Shield className="w-6 h-6" />
								</div>
								<div className="text-left">
									<h3 className="font-semibold">Secure Platform</h3>
									<p className="text-orange-100 text-sm">Advanced security and data protection</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Side - Login Form */}
				<div className="w-full lg:w-1/2 flex items-center justify-center p-8">
					<div className="max-w-md w-full space-y-8">
						{/* Mobile Logo */}
						<div className="lg:hidden text-center">
							<div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
								<Utensils className="w-8 h-8 text-white" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">Mess Management</h2>
						</div>

						{/* Header */}
						<div className="text-center">
							<h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
							<p className="text-gray-600">Sign in to access your dining dashboard</p>
						</div>

						{/* Login Form */}
						<div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100/50 backdrop-blur-sm">
							{/* Error Message */}
							{error && (
								<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
									<AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
									<p className="text-red-700 text-sm font-medium">{error}</p>
								</div>
							)}
							<form onSubmit={handleSubmit} className="space-y-6">

								{/* Role Selection */}
								<div>
									<label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-3">
										Select Your Role
									</label>
									<div className="grid grid-cols-2 gap-3">
										{['student', 'admin'].map((roleType) => (
											<button
												key={roleType}
												type="button"
												onClick={() => setRole(roleType)}
												className={`
                          relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
                          ${role === roleType
														? 'border-orange-500 bg-orange-50 shadow-lg'
														: 'border-gray-200 bg-white hover:border-orange-300'
													}
                        `}
											>
												<div className={`
                          w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center
                          ${role === roleType
														? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
														: 'bg-gray-100 text-gray-600'
													}
                        `}>
													{getRoleIcon(roleType)}
												</div>
												<span className={`
                          text-xs font-medium capitalize
                          ${role === roleType ? 'text-orange-700' : 'text-gray-600'}
                        `}>
													{roleType}
												</span>
												{role === roleType && (
													<div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
														<div className="w-2 h-2 bg-white rounded-full"></div>
													</div>
												)}
											</button>
										))}
									</div>
								</div>

								{/* Phone Number */}
								<div>
									<label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
										Phone Number
									</label>
									<div className="relative group">
										<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
											<Phone className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
										</div>
										<input
											id="phone"
											type="tel"
											value={phone}
											onChange={(e) => setPhone(e.target.value)}
											required
											className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
											placeholder="Enter your phone number"
										/>
									</div>
								</div>

								{/* Password */}
								<div>
									<label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
										Password
									</label>
									<div className="relative group">
										<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
											<Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
										</div>
										<input
											id="password"
											type={showPassword ? 'text' : 'password'}
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
											placeholder="Enter your password"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-500 transition-colors duration-200"
										>
											{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={loading}
									className={`
                    w-full py-4 px-6 rounded-xl font-semibold text-white text-lg
                    bg-gradient-to-r ${getRoleColor(role)} 
                    hover:shadow-2xl hover:scale-105 
                    focus:outline-none focus:ring-4 focus:ring-orange-300 
                    transition-all duration-300 transform
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  `}
								>
									{loading ? (
										<div className="flex items-center justify-center">
											<LoadingSpinner size="sm" className="mr-3" />
											Signing in...
										</div>
									) : (
										<div className="flex items-center justify-center">
											{getRoleIcon(role)}
											<span className="ml-2">Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
										</div>
									)}
								</button>
							</form>

							{/* Footer */}
							<div className="mt-8 text-center">
								<p className="text-sm text-gray-600">
									Don't have an account?{' '}
									<Link
										to="/register"
										className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200"
									>
										Register here
									</Link>
								</p>
							</div>
						</div>

						{/* Additional Info */}
						<div className="text-center">
							<p className="text-xs text-gray-500">
								© 2024 Mess Management System. All rights reserved.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;