import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
	Utensils,
	Users,
	Clock,
	Shield,
	ArrowRight,
	Star,
	CheckCircle,

} from 'lucide-react';

const HomePage = () => {
	const [isVisible, setIsVisible] = useState(false);
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		setIsVisible(true);
	}, []);

	const handleGetStarted = () => {
		if (isAuthenticated && user) {
			// User is authenticated, redirect to appropriate dashboard
			const isAdmin = user.is_superuser || user.is_staff === true;
			const isStaff = user.is_staff === true;

			if (isAdmin) {
				navigate('/admin');
			} else if (isStaff) {
				navigate('/staff');
			} else {
				navigate('/student');
			}
		} else {
			// User is not authenticated, redirect to register
			navigate('/register');
		}
	};

	const features = [
		{
			icon: Utensils,
			title: "Smart Meal Management",
			description: "Efficiently manage meal bookings and dining schedules with our intelligent system."
		},
		{
			icon: Users,
			title: "User Management",
			description: "Comprehensive user management for students, staff, and administrators."
		},
		{
			icon: Clock,
			title: "Real-time Booking",
			description: "Book meals in real-time with instant confirmation and updates."
		},
		{
			icon: Shield,
			title: "Secure Platform",
			description: "Advanced security features to protect user data and transactions."
		}
	];

	const stats = [
		{ number: "5000+", label: "Active Users" },
		{ number: "50+", label: "Mess Halls" },
		{ number: "99.9%", label: "Uptime" },
		{ number: "24/7", label: "Support" }
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 relative overflow-hidden">
			{/* Subtle 3D Background Elements */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-20 left-20 w-32 h-32 border-2 border-orange-300 rounded-full transform rotate-12 animate-pulse"></div>
				<div className="absolute top-40 right-32 w-24 h-24 border-2 border-orange-400 rounded-full transform -rotate-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
				<div className="absolute bottom-32 left-40 w-20 h-20 border-2 border-orange-300 rounded-full transform rotate-45 animate-pulse" style={{ animationDelay: '2s' }}></div>
				<div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-orange-400 rounded-full transform -rotate-45 animate-pulse" style={{ animationDelay: '3s' }}></div>
			</div>

			{/* Floating 3D Icons - Subtle */}
			<div className="absolute inset-0 opacity-10">
				<Utensils className="absolute top-32 left-1/4 w-8 h-8 text-orange-400 animate-bounce" style={{ animationDuration: '3s' }} />
				<Users className="absolute top-1/2 right-1/3 w-6 h-6 text-orange-500 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
				<Clock className="absolute bottom-1/3 left-1/3 w-7 h-7 text-orange-400 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
			</div>

			{/* Hero Section */}
			<div className="relative z-10 min-h-screen flex items-center">
				<div className="max-w-7xl mx-auto px-4 py-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

						{/* Left Content */}
						<div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
							<div className="space-y-8">
								<div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-lg border border-orange-200">
									<div className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
									<span className="text-orange-600 font-semibold">Professional Mess Management</span>
								</div>

								<h1 className="text-5xl lg:text-6xl font-bold leading-tight">
									<span className="text-gray-900">Campus</span>
									<br />
									<span className="text-orange-500">Mess Management</span>
								</h1>

								<p className="text-xl text-gray-600 leading-relaxed max-w-lg">
									Streamline your campus dining operations with our comprehensive management system designed for educational institutions and student hostels.
								</p>

								<div className="flex flex-col sm:flex-row gap-4">
									<button
										onClick={handleGetStarted}
										className="group inline-flex items-center justify-center px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
									>
										{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
										<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
									</button>

									<Link
										to="/login"
										className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-500 rounded-lg font-semibold text-lg border-2 border-orange-500 hover:bg-orange-50 transform transition-all duration-300 hover:scale-105"
									>
										Sign In
									</Link>
								</div>
							</div>
						</div>

						{/* Right Content - Hero Image */}
						<div className={`relative transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
							<div className="grid grid-cols-1 gap-6">
								{/* First Image - Campus Dining Hall */}
								<div className="relative">
									<div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl opacity-20 transform rotate-2 animate-pulse"></div>
									<img
										src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop"
										alt="Campus Dining Hall"
										className="relative z-10 w-full h-64 object-cover rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500"
									/>
									<div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
										<Users className="w-3 h-3 inline mr-1" />
										Campus Dining
									</div>
								</div>

								{/* Second Image - Student Meal Service */}
								<div className="relative">
									<div className="absolute -inset-4 bg-gradient-to-r from-gray-400 to-gray-600 rounded-3xl opacity-20 transform -rotate-2 animate-pulse" style={{ animationDelay: '1s' }}></div>
									<img
										src="https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop"
										alt="Student Meal Service"
										className="relative z-10 w-full h-64 object-cover rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500"
									/>
									<div className="absolute top-4 right-4 bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
										<CheckCircle className="w-3 h-3 inline mr-1" />
										Quality Service
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Stats Section */}
			<div className="relative z-10 py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4">
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
						{stats.map((stat, index) => (
							<div key={index} className="text-center group">
								<div className="bg-orange-50 rounded-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
									<div className="text-4xl font-bold text-orange-500 mb-2">{stat.number}</div>
									<div className="text-gray-600 font-medium">{stat.label}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="relative z-10 py-20">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							Why Choose Our Campus Dining Solution?
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Built specifically for educational institutions with modern technology and designed for student-focused efficiency.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<div key={index} className="group">
								<div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
									<div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors duration-300">
										<feature.icon className="w-8 h-8 text-orange-500 group-hover:text-white transition-colors duration-300" />
									</div>
									<h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
									<p className="text-gray-600 leading-relaxed">{feature.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Testimonial Section */}
			<div className="relative z-10 py-20 bg-white">
				<div className="max-w-4xl mx-auto px-4 text-center">
					<div className="bg-orange-50 rounded-3xl p-12 border border-orange-100">
						<div className="flex justify-center mb-6">
							{[...Array(5)].map((_, i) => (
								<Star key={i} className="w-6 h-6 text-orange-400 fill-current" />
							))}
						</div>
						<blockquote className="text-2xl text-gray-700 font-medium mb-8 leading-relaxed">
							"This campus mess management system has completely transformed how we handle student dining operations. It's intuitive, reliable, and has significantly improved our hostel efficiency."
						</blockquote>
						<div className="flex items-center justify-center space-x-4">
							<img
								src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
								alt="Hostel Warden"
								className="w-16 h-16 rounded-full object-cover"
							/>
							<div className="text-left">
								<div className="font-semibold text-gray-900">Dr. Priya Sharma</div>
								<div className="text-gray-600">Hostel Warden, Engineering College</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="relative z-10 py-20 bg-gradient-to-r from-orange-500 to-orange-600">
				<div className="max-w-4xl mx-auto text-center px-4">
					<h2 className="text-4xl font-bold text-white mb-6">
						Ready to Modernize Your Campus Dining?
					</h2>
					<p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
						Join hundreds of educational institutions who have streamlined their campus dining operations with our platform.
					</p>
					<button
						onClick={handleGetStarted}
						className="inline-flex items-center px-8 py-4 bg-white text-orange-500 rounded-lg font-semibold text-lg hover:bg-orange-50 transform transition-all duration-300 hover:scale-105 shadow-lg"
					>
						{isAuthenticated ? 'Go to Dashboard' : 'Get Started Today'}
						<ArrowRight className="w-5 h-5 ml-2" />
					</button>
				</div>
			</div>

			{/* Footer */}
			<footer className="relative z-10 bg-gray-900 text-white py-16">
				<div className="max-w-7xl mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div className="col-span-1 md:col-span-2">
							<div className="flex items-center space-x-3 mb-6">
								<div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
									<Utensils className="w-6 h-6 text-white" />
								</div>
								<span className="text-2xl font-bold">MessManager</span>
							</div>
							<p className="text-gray-400 max-w-md leading-relaxed">
								Professional campus dining management solutions designed to streamline educational institution operations and enhance student experience.
							</p>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-4">Quick Links</h3>
							<ul className="space-y-2">
								<li><Link to="/about" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">About Us</Link></li>
								<li><Link to="/features" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Features</Link></li>
								<li><Link to="/pricing" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Pricing</Link></li>
								<li><Link to="/contact" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Contact</Link></li>
							</ul>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-4">Support</h3>
							<ul className="space-y-2">
								<li><Link to="/help" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Help Center</Link></li>
								<li><Link to="/docs" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Documentation</Link></li>
								<li><Link to="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Privacy Policy</Link></li>
								<li><Link to="/terms" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Terms of Service</Link></li>
							</ul>
						</div>
					</div>

					<div className="border-t border-gray-800 mt-12 pt-8 text-center">
						<p className="text-gray-400">
							© 2024 MessManager. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default HomePage;