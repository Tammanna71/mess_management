import React, { useState, useEffect } from 'react';

interface ToastProps {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message?: string;
	duration?: number;
	onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
	id,
	type,
	title,
	message,
	duration = 5000,
	onClose
}) => {
	const [isVisible, setIsVisible] = useState(false);
	const [isLeaving, setIsLeaving] = useState(false);

	useEffect(() => {
		// Trigger entrance animation
		const timer = setTimeout(() => setIsVisible(true), 100);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				handleClose();
			}, duration);
			return () => clearTimeout(timer);
		}
	}, [duration]);

	const handleClose = () => {
		setIsLeaving(true);
		setTimeout(() => {
			onClose(id);
		}, 300);
	};

	const getIcon = () => {
		switch (type) {
			case 'success':
				return <span className="text-green-500 text-xl">✓</span>;
			case 'error':
				return <span className="text-red-500 text-xl">✗</span>;
			case 'warning':
				return <span className="text-yellow-500 text-xl">⚠</span>;
			case 'info':
				return <span className="text-blue-500 text-xl">ℹ</span>;
			default:
				return <span className="text-blue-500 text-xl">ℹ</span>;
		}
	};

	const getStyles = () => {
		const baseStyles = "border-l-4 shadow-lg backdrop-blur-sm";
		switch (type) {
			case 'success':
				return `${baseStyles} bg-green-50/90 border-green-500`;
			case 'error':
				return `${baseStyles} bg-red-50/90 border-red-500`;
			case 'warning':
				return `${baseStyles} bg-yellow-50/90 border-yellow-500`;
			case 'info':
				return `${baseStyles} bg-blue-50/90 border-blue-500`;
			default:
				return `${baseStyles} bg-blue-50/90 border-blue-500`;
		}
	};

	return (
		<div
			className={`
        transform transition-all duration-300 ease-in-out mb-4 rounded-lg p-4 ${getStyles()}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'scale-95' : 'scale-100'}
      `}
		>
			<div className="flex items-start">
				<div className="flex-shrink-0">
					{getIcon()}
				</div>
				<div className="ml-3 flex-1">
					<h4 className="text-sm font-semibold text-gray-900">{title}</h4>
					{message && (
						<p className="mt-1 text-sm text-gray-700">{message}</p>
					)}
				</div>
				<button
					onClick={handleClose}
					className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
				>
					<span className="text-xl">×</span>
				</button>
			</div>
		</div>
	);
};

export default Toast; 