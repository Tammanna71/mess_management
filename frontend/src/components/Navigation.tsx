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

		if (user.is_superuser) return '/admin';
		if (user.is_staff) return '/staff';
		return '/student';
	}, [user]);

	const getNavItems = (): NavItem[] => {
		if (!user) return [];

		const isAdmin = user.is_superuser;
		const isStaff = user.is_staff || user.is_superuser;

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

		if (isAdmin || isStaff) {
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
							icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
						}
					]
				}
			);
		}

		if (isAdmin) {
			items.push(
				{
					name: 'Admin Tools',
					href: '#',
					icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
					children: [
						{
							name: 'Coupons',
							href: '/coupons',
							icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
						},
						{
							name: 'Notifications',
							href: '/notifications',
							icon: 'M15 17h5l-5 5v-5zM4.19 4.47A.749.749 0 014.47 4.19L4.86 3.8A.749.749 0 015.54 3.8L5.93 4.19A.749.749 0 015.54 4.86L5.15 4.47A.749.749 0 014.19 4.47zM4.19 19.53A.749.749 0 014.47 19.81L4.86 20.2A.749.749 0 015.54 20.2L5.93 19.81A.749.749 0 015.54 19.14L5.15 19.53A.749.749 0 014.19 19.53z'
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
		}

		return items;
	};

	const navItems = useMemo(() => getNavItems(), [user]);

	const getUserRole = (): string => {
		if (user?.is_superuser) return 'Admin';
		if (user?.is_staff) return 'Staff';
		return 'Student';
	};

	const toggleDropdown = (itemName: string) => {
		setOpenDropdown(openDropdown === itemName ? null : itemName);
	};

	const renderNavItem = (item: NavItem) => {
		const isActive = location.pathname === item.href;
		const isDropdownOpen = openDropdown === item.name;
		const hasChildren = item.children && item.children.length > 0;

		if (hasChildren) {
			return (
				<div key={item.name} className="relative">
					<button
						onClick={() => toggleDropdown(item.name)}
						className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
							}`}
					>
						<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
						</svg>
						<span>{item.name}</span>
						<ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
					</button>

					{isDropdownOpen && (
						<div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
							{item.children!.map((child) => (
								<Link
									key={child.name}
									to={child.href}
									className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 ${location.pathname === child.href ? 'bg-blue-50 text-blue-600' : ''
										}`}
									onClick={() => setOpenDropdown(null)}
								>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={child.icon} />
									</svg>
									<span>{child.name}</span>
								</Link>
							))}
						</div>
					)}
				</div>
			);
		}

		return (
			<Link
				key={item.name}
				to={item.href}
				className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
					? 'bg-blue-100 text-blue-700'
					: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
					}`}
			>
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
				</svg>
				<span>{item.name}</span>
			</Link>
		);
	};

	const renderMobileNavItem = (item: NavItem) => {
		const isActive = location.pathname === item.href;
		const hasChildren = item.children && item.children.length > 0;

		if (hasChildren) {
			return (
				<div key={item.name} className="space-y-1">
					<button
						onClick={() => toggleDropdown(item.name)}
						className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
							}`}
					>
						<div className="flex items-center space-x-2">
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
							</svg>
							<span>{item.name}</span>
						</div>
						<ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
					</button>

					{openDropdown === item.name && (
						<div className="ml-4 space-y-1">
							{item.children!.map((child) => (
								<Link
									key={child.name}
									to={child.href}
									className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 ${location.pathname === child.href ? 'bg-blue-50 text-blue-600' : ''
										}`}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={child.icon} />
									</svg>
									<span>{child.name}</span>
								</Link>
							))}
						</div>
					)}
				</div>
			);
		}

		return (
			<Link
				key={item.name}
				to={item.href}
				className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
					? 'bg-blue-100 text-blue-700'
					: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
					}`}
				onClick={() => setIsMobileMenuOpen(false)}
			>
				<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
				</svg>
				<span>{item.name}</span>
			</Link>
		);
	};

	return (
		<nav ref={navRef} className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					{/* Logo and Brand */}
					<div className="flex items-center">
						<Link to={dashboardUrl} className="flex items-center space-x-3">
							<div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
								<svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
								</svg>
							</div>
							<span className="text-xl font-bold text-gray-900">Mess Management</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-4">
						{loading ? (
							<div className="flex items-center space-x-4">
								<LoadingSpinner size="sm" />
								<span className="text-sm text-gray-500">Loading...</span>
							</div>
						) : (
							navItems.map(renderNavItem)
						)}

						{/* User Menu */}
						<div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
							<div className="flex items-center space-x-2">
								<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
									<svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
								<div className="text-sm">
									<div className="font-medium text-gray-900">{user?.name || user?.phone}</div>
									<div className="text-gray-500">{getUserRole()}</div>
								</div>
							</div>

							<button
								onClick={handleLogout}
								className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
							>
								<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								<span>Logout</span>
							</button>
						</div>
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden flex items-center">
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
						>
							{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation */}
			{isMobileMenuOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
						{!loading && navItems.map(renderMobileNavItem)}

						{/* Mobile User Menu */}
						<div className="pt-4 border-t border-gray-200">
							<div className="flex items-center space-x-3 px-3 py-2">
								<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
									<svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
								<div className="text-sm">
									<div className="font-medium text-gray-900">{user?.name || user?.phone}</div>
									<div className="text-gray-500">{getUserRole()}</div>
								</div>
							</div>

							<button
								onClick={handleLogout}
								className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
							>
								<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								<span>Logout</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navigation; 