import { AuthTokens } from '../types';

class AuthService {
	private readonly ACCESS_TOKEN_KEY = 'access_token';
	private readonly REFRESH_TOKEN_KEY = 'refresh_token';

	setTokens(tokens: AuthTokens): void {
		localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access);
		localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh);
	}

	getTokens(): AuthTokens | null {
		const access = localStorage.getItem(this.ACCESS_TOKEN_KEY);
		const refresh = localStorage.getItem(this.REFRESH_TOKEN_KEY);

		if (access && refresh) {
			return { access, refresh };
		}

		return null;
	}

	clearTokens(): void {
		localStorage.removeItem(this.ACCESS_TOKEN_KEY);
		localStorage.removeItem(this.REFRESH_TOKEN_KEY);
	}

	getAccessToken(): string | null {
		return localStorage.getItem(this.ACCESS_TOKEN_KEY);
	}

	getRefreshToken(): string | null {
		return localStorage.getItem(this.REFRESH_TOKEN_KEY);
	}

	isAuthenticated(): boolean {
		return !!this.getAccessToken();
	}
}

export const authService = new AuthService(); 