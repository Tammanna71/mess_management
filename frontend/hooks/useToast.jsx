import { useState, useCallback, useRef } from 'react';

export const useToast = () => {
	const [toasts, setToasts] = useState([]);
	const recentToasts = useRef(new Map());

	const addToast = useCallback((options) => {
		// Prevent duplicate toasts within 2 seconds
		const toastKey = `${options.type}-${options.title}`;
		const now = Date.now();

		if (recentToasts.current.has(toastKey)) {
			const lastTime = recentToasts.current.get(toastKey);
			if (now - lastTime < 2000) {
				return; // Skip duplicate toast
			}
		}

		recentToasts.current.set(toastKey, now);

		const id = Math.random().toString(36).substr(2, 9);
		const toast = {
			id,
			...options,
			onClose: () => { }, // Will be set by ToastContainer
		};

		setToasts(prev => [...prev, toast]);
		return id;
	}, []);

	const removeToast = useCallback((id) => {
		setToasts(prev => prev.filter(toast => toast.id !== id));

		// Clean up old entries from recentToasts to prevent memory leaks
		setTimeout(() => {
			const now = Date.now();
			for (const [key, time] of recentToasts.current.entries()) {
				if (now - time > 5000) { // Keep for 5 seconds
					recentToasts.current.delete(key);
				}
			}
		}, 100);
	}, []);

	const clearAllToasts = useCallback(() => {
		setToasts([]);
	}, []);

	// Convenience methods
	const success = useCallback((title, message, duration) => {
		return addToast({ type: 'success', title, message, duration });
	}, [addToast]);

	const error = useCallback((title, message, duration) => {
		return addToast({ type: 'error', title, message, duration: duration || 7000 });
	}, [addToast]);

	const warning = useCallback((title, message, duration) => {
		return addToast({ type: 'warning', title, message, duration });
	}, [addToast]);

	const info = useCallback((title, message, duration) => {
		return addToast({ type: 'info', title, message, duration });
	}, [addToast]);

	return {
		toasts,
		addToast,
		removeToast,
		clearAllToasts,
		success,
		error,
		warning,
		info,
	};
};