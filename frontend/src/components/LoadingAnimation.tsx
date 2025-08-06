import React from 'react';

const LoadingAnimation: React.FC = () => {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				{/* Smooth spinning logo */}
				<div className="mb-8">
					<div className="relative w-20 h-20 mx-auto">
						<div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl animate-smooth-pulse"></div>
						<div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
							<svg
								className="w-10 h-10 text-blue-600 animate-smooth-spin"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* Loading text with smooth fade */}
				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-gray-900 animate-smooth-pulse">
						Mess Management
					</h2>
					<p className="text-gray-600 animate-smooth-pulse">
						Loading your dashboard...
					</p>
				</div>

				{/* Smooth progress dots */}
				<div className="flex justify-center space-x-2 mt-8">
					<div className="w-3 h-3 bg-blue-600 rounded-full animate-smooth-bounce" style={{ animationDelay: '0ms' }}></div>
					<div className="w-3 h-3 bg-blue-600 rounded-full animate-smooth-bounce" style={{ animationDelay: '150ms' }}></div>
					<div className="w-3 h-3 bg-blue-600 rounded-full animate-smooth-bounce" style={{ animationDelay: '300ms' }}></div>
				</div>
			</div>
		</div>
	);
};

export default LoadingAnimation;