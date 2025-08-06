import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
	Utensils,
	User,
	Mail,
	Phone,
	GraduationCap,
	Home,
	Lock,
	Eye,
	EyeOff,
	CheckCircle,
	ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		roll_no: '',
		room_no: '',
		password: '',
		confirmPassword: ''
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [currentStep, setCurrentStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const { register, operationLoading } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (form.password !== form.confirmPassword) {
			return; // Error will be shown in validation
		}

		setIsLoading(true);
		try {
			const { confirmPassword, ...registerData } = form;
			await register(registerData, 'student');
			navigate('/login');
		} catch (err) {
			// Error handling is done in AuthContext with toasts
		} finally {
			setIsLoading(false);
		}
	};

	const nextStep = () => {
		if (currentStep < 3) setCurrentStep(currentStep + 1);
	};

	const prevStep = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	};

	const isStepValid = (step) => {
		switch (step) {
			case 1:
				return form.name && form.email && form.phone;
			case 2:
				return form.roll_no && form.room_no;
			case 3:
				return form.password && form.confirmPassword && form.password === form.confirmPassword;
			default:
				return false;
		}
	};

	const getStepIcon = (step) => {
		if (step < currentStep) return <CheckCircle className="w-6 h-6 text-white" />;
		if (step === currentStep) return <div className="w-3 h-3 bg-white rounded-full"></div>;
		return <div className="w-6 h-6 border-2 border-white/50 rounded-full"></div>;
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
				{/* Left Side - Progress & Info */}
				<div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 relative overflow-hidden">
					{/* Decorative Elements */}
					<div className="absolute inset-0 opacity-10">
						<div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
						<div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white rounded-full"></div>
					</div>

					<div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
						{/* Logo */}
						<div className="mb-12 text-center">
							<div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
								<Utensils className="w-10 h-10 text-white" />
							</div>
							<h1 className="text-3xl font-bold mb-2">Join Our Community</h1>
							<p className="text-green-100">Create your mess management account</p>
						</div>

						{/* Progress Steps */}
						<div className="w-full max-w-sm">
							<div className="flex items-center justify-between mb-8">
								{[1, 2, 3].map((step) => (
									<div key={step} className="flex flex-col items-center">
										<div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                      ${step <= currentStep ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/10'}
                    `}>
											{getStepIcon(step)}
										</div>
										<span className="text-xs text-green-100">
											{step === 1 ? 'Personal' : step === 2 ? 'Details' : 'Security'}
										</span>
									</div>
								))}
							</div>

							{/* Step Descriptions */}
							<div className="space-y-4">
								<div className={`flex items-center space-x-3 transition-opacity duration-300 ${currentStep === 1 ? 'opacity-100' : 'opacity-50'}`}>
									<User className="w-5 h-5" />
									<span className="text-sm">Personal Information</span>
								</div>
								<div className={`flex items-center space-x-3 transition-opacity duration-300 ${currentStep === 2 ? 'opacity-100' : 'opacity-50'}`}>
									<GraduationCap className="w-5 h-5" />
									<span className="text-sm">Academic Details</span>
								</div>
								<div className={`flex items-center space-x-3 transition-opacity duration-300 ${currentStep === 3 ? 'opacity-100' : 'opacity-50'}`}>
									<Lock className="w-5 h-5" />
									<span className="text-sm">Account Security</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Side - Registration Form */}
				<div className="w-full lg:w-3/5 flex items-center justify-center p-8">
					<div className="max-w-lg w-full space-y-8">
						{/* Mobile Header */}
						<div className="lg:hidden text-center">
							<div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
								<Utensils className="w-8 h-8 text-white" />
							</div>
							<h2 className="text-2xl font-bold text-gray-900">Student Registration</h2>
						</div>

						{/* Header */}
						<div className="text-center">
							<h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
							<p className="text-gray-600">Step {currentStep} of 3 - {
								currentStep === 1 ? 'Personal Information' :
									currentStep === 2 ? 'Academic Details' :
										'Account Security'
							}</p>
						</div>

						{/* Registration Form */}
						<div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100/50 backdrop-blur-sm">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Step 1: Personal Information */}
								{currentStep === 1 && (
									<div className="space-y-6">
										<div>
											<label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
												Full Name
											</label>
											<div className="relative group">
												<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
													<User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
												</div>
												<input
													id="name"
													name="name"
													type="text"
													value={form.name}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
													placeholder="Enter your full name"
												/>
											</div>
										</div>

										<div>
											<label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
												Email Address
											</label>
											<div className="relative group">
												<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
													<Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
												</div>
												<input
													id="email"
													name="email"
													type="email"
													value={form.email}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
													placeholder="Enter your email address"
												/>
											</div>
										</div>

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
													name="phone"
													type="tel"
													value={form.phone}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
													placeholder="Enter your phone number"
												/>
											</div>
										</div>
									</div>
								)}

								{/* Step 2: Academic Details */}
								{currentStep === 2 && (
									<div className="space-y-6">
										<div>
											<label htmlFor="roll_no" className="block text-sm font-semibold text-gray-700 mb-2">
												Roll Number
											</label>
											<div className="relative group">
												<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
													<GraduationCap className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
												</div>
												<input
													id="roll_no"
													name="roll_no"
													type="text"
													value={form.roll_no}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
													placeholder="Enter your roll number"
												/>
											</div>
										</div>

										<div>
											<label htmlFor="room_no" className="block text-sm font-semibold text-gray-700 mb-2">
												Room Number
											</label>
											<div className="relative group">
												<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
													<Home className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
												</div>
												<input
													id="room_no"
													name="room_no"
													type="text"
													value={form.room_no}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
													placeholder="Enter your room number"
												/>
											</div>
										</div>

										<div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
											<div className="flex items-start space-x-3">
												<CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
												<div>
													<h4 className="text-sm font-semibold text-orange-800">Academic Information</h4>
													<p className="text-xs text-orange-700 mt-1">
														This information helps us identify you within the mess system and assign you to the correct dining hall.
													</p>
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Step 3: Security */}
								{currentStep === 3 && (
									<div className="space-y-6">
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
													name="password"
													type={showPassword ? 'text' : 'password'}
													value={form.password}
													onChange={handleChange}
													required
													className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
													placeholder="Create a strong password"
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

										<div>
											<label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
												Confirm Password
											</label>
											<div className="relative group">
												<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
													<Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
												</div>
												<input
													id="confirmPassword"
													name="confirmPassword"
													type={showConfirmPassword ? 'text' : 'password'}
													value={form.confirmPassword}
													onChange={handleChange}
													required
													className={`
                            w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white
                            ${form.confirmPassword && form.password !== form.confirmPassword
															? 'border-red-300 focus:border-red-500'
															: 'border-gray-300 focus:border-orange-500'
														}
                          `}
													placeholder="Confirm your password"
												/>
												<button
													type="button"
													onClick={() => setShowConfirmPassword(!showConfirmPassword)}
													className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-500 transition-colors duration-200"
												>
													{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
												</button>
											</div>
											{form.confirmPassword && form.password !== form.confirmPassword && (
												<p className="mt-2 text-sm text-red-600">Passwords do not match</p>
											)}
										</div>

										<div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
											<div className="flex items-start space-x-3">
												<Lock className="w-5 h-5 text-orange-500 mt-0.5" />
												<div>
													<h4 className="text-sm font-semibold text-orange-800">Security Tips</h4>
													<ul className="text-xs text-orange-700 mt-1 space-y-1">
														<li>• Use at least 8 characters</li>
														<li>• Include uppercase and lowercase letters</li>
														<li>• Add numbers and special characters</li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Navigation Buttons */}
								<div className="flex space-x-4">
									{currentStep > 1 && (
										<button
											type="button"
											onClick={prevStep}
											className="flex-1 py-4 px-6 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
										>
											Previous
										</button>
									)}

									{currentStep < 3 ? (
										<button
											type="button"
											onClick={nextStep}
											disabled={!isStepValid(currentStep)}
											className="flex-1 py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
										>
											Next Step
											<ArrowRight className="w-5 h-5 ml-2" />
										</button>
									) : (
										<button
											type="submit"
											disabled={!isStepValid(currentStep) || isLoading || operationLoading}
											className="flex-1 py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{isLoading || operationLoading ? (
												<div className="flex items-center justify-center">
													<LoadingSpinner size="sm" className="mr-3" />
													Creating Account...
												</div>
											) : (
												'Create Account'
											)}
										</button>
									)}
								</div>
							</form>

							{/* Footer */}
							<div className="mt-8 text-center">
								<p className="text-sm text-gray-600">
									Already have an account?{' '}
									<Link
										to="/login"
										className="font-semibold text-orange-600 hover:text-orange-500 transition-colors duration-200"
									>
										Sign in here
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;