import React from 'react';
import Toast from './Toast';

interface Toast {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message?: string;
	duration?: number;
}

interface ToastContainerProps {
	toasts: Toast[];
	onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
	if (toasts.length === 0) return null;

	return (
		<div className="fixed top-4 right-4 z-50 max-w-sm w-full">
			{toasts.map((toast) => (
				<Toast
					key={toast.id}
					{...toast}
					onClose={onClose}
				/>
			))}
		</div>
	);
};

export default ToastContainer; 