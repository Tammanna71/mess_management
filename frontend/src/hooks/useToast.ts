import { useState, useCallback } from 'react';

interface Toast {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message?: string;
	duration?: number;
}

export const useToast = () => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = useCallback((type: Toast['type'], title: string, message = '', duration = 5000) => {
		const id = Date.now().toString();
		const newToast: Toast = { id, type, title, message, duration };
		
		setToasts(prev => [...prev, newToast]);
		
		// Auto-remove toast after duration
		setTimeout(() => {
			removeToast(id);
		}, duration);
	}, []);

	const removeToast = useCallback((id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id));
	}, []);

	const success = useCallback((title: string, message = '') => {
		addToast('success', title, message);
	}, [addToast]);

	const error = useCallback((title: string, message = '') => {
		addToast('error', title, message);
	}, [addToast]);

	const warning = useCallback((title: string, message = '') => {
		addToast('warning', title, message);
	}, [addToast]);

	const info = useCallback((title: string, message = '') => {
		addToast('info', title, message);
	}, [addToast]);

	return {
		toasts,
		removeToast,
		success,
		error,
		warning,
		info
	};
};
