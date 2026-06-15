import api from './api';

export interface AuthResponse {
  token: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  roles: string[];
}

export const authService = {
  async login(username: string, password: String): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signin', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async getProfile(): Promise<any> {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateProfile(profileData: any): Promise<any> {
    const response = await api.put('/user/profile', profileData);
    // Update stored user info if necessary
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  },

  async getAllUsersAdmin(): Promise<any[]> {
    const response = await api.get<any[]>('/user/admin/all');
    return response.data;
  },

  async register(username: string, password: String): Promise<string> {
    const response = await api.post<string>('/auth/signup', { username, password });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
