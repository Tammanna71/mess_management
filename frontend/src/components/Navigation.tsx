import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRequiredRole } from '../utils/helpers';
import { ChevronDown, Menu, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface NavItem {
	name: string;
	href: string;
	icon: string;
	children?: NavItem[];
}

const Navigation: React.FC = () => {
	const { user, logout, loading } = useAuth();
	const location = useLocation();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const navRef = useRef<HTMLDivElement>(null);

	// Don't render if no user data is available
	if (!user) {
		return null;
	}

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(event.target as Node)) {
				setOpenDropdown(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleLogout = () => {
		logout();
	};

	const dashboardUrl = useMemo((): string => {
		if (!user) return '/';

		if (user.is_superuser || user.is_staff) return '/admin';
		return '/student';
	}, [user]);

	const getNavItems = (): NavItem[] => {
		if (!user) return [];

		const isAdmin = user.is_superuser || user.is_staff;

		const items: NavItem[] = [
			{
				name: 'Home',
				href: '/',
				icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
			},
			{
				name: 'Dashboard',
				href: dashboardUrl,
				icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
			},
			{
				name: 'Profile',
				href: '/profile',
				icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
			},
		];

		if (isAdmin) {
			items.push(
				{
					name: 'Management',
					href: '#',
					icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
					children: [
						{
							name: 'Users',
							href: '/users',
							icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
						},
						{
							name: 'Messes',
							href: '/messes',
							icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
						},
						{
							name: 'Meal Slots',
							href: '/meal-slots',
							icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
						},
						{
							name: 'Bookings',
							href: '/bookings',
							icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
						},
						{
							name: 'Coupons',
							href: '/coupons',
							icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
						},
						{
							name: 'Notifications',
							href: '/notifications',
							icon: 'M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 004 6v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-1.81 1.19z'
						},
						{
							name: 'Reports',
							href: '/reports',
							icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
						},
						{
							name: 'Audit Logs',
							href: '/audit-logs',
							icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
						}
					]
				}
			);
		} else {
			// Student navigation items
			items.push(
				{
					name: 'Student',
					href: '#',
					icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
					children: [
						{
							name: 'Bookings',
							href: '/bookings',
							icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
						},
						{
							name: 'Booking History',
							href: '/booking-history',
							icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
						},
						{
							name: 'My Coupons',
							href: '/coupons',
							icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
						}
					]
				}
			);
		}

		return items;
	};

	const navItems = getNavItems();

	const toggleDropdown = (name: string) => {
		setOpenDropdown(openDropdown === name ? null : name);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
		setOpenDropdown(null);
	};

	const renderNavItem = (item: NavItem) => {
		const isActive = location.pathname === item.href;
		const hasChildren = item.children && item.children.length > 0;
		const isDropdownOpen = openDropdown === item.name;

		if (hasChildren) {
			return (
				<div key={item.name} className="relative">
					<button
						onClick={() => toggleDropdown(item.name)}
						className={`
							flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
							${isActive
								? 'bg-orange-100 text-orange-700'
								: 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
							}
						`}
					>
						<svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
						</svg>
						{item.name}
						<ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
					</button>

					{isDropdownOpen && (
						<div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
							<div className="py-1">
								{item.children!.map((child) => (
									<Link
										key={child.name}
										to={child.href}
										onClick={closeMobileMenu}
										className={`
											flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200
											${location.pathname === child.href ? 'bg-orange-50 text-orange-700' : ''}
										`}
									>
										<svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={child.icon} />
										</svg>
										{child.name}
									</Link>
								))}
							</div>
						</div>
					)}
				</div>
			);
		}

		return (
			<Link
				key={item.name}
				to={item.href}
				onClick={closeMobileMenu}
				className={`
					flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
					${isActive
						? 'bg-orange-100 text-orange-700'
						: 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
					}
				`}
			>
				<svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
				</svg>
				{item.name}
			</Link>
		);
	};

	if (loading) {
		return (
			<nav className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<LoadingSpinner size="sm" />
						</div>
					</div>
				</div>
			</nav>
		);
	}

	return (
		<nav ref={navRef} className="bg-white shadow-sm border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-4">
						{navItems.map(renderNavItem)}
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center">
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
						>
							{isMobileMenuOpen ? (
								<X className="block h-6 w-6" />
							) : (
								<Menu className="block h-6 w-6" />
							)}
						</button>
					</div>

					{/* User Menu */}
					<div className="flex items-center space-x-4">
						<div className="hidden md:flex items-center space-x-2">
							<span className="text-sm text-gray-700">Welcome,</span>
							<span className="text-sm font-medium text-gray-900">{user.name}</span>
						</div>
						<button
							onClick={handleLogout}
							className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
						>
							Logout
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation */}
			{isMobileMenuOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
						{navItems.map(renderNavItem)}
					</div>
					<div className="pt-4 pb-3 border-t border-gray-200">
						<div className="px-4">
							<div className="text-sm text-gray-700 mb-2">Welcome, {user.name}</div>
							<button
								onClick={handleLogout}
								className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navigation; 