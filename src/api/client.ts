const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(email: string, username: string, password: string) {
    const data = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  async updateProfile(username: string) {
    return this.request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Tracks
  async getTracks() {
    return this.request<{ tracks: any[] }>('/tracks');
  }

  async uploadTrack(file: File, metadata: any) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      if (metadata[key] !== undefined) {
        formData.append(key, metadata[key]);
      }
    });

    const response = await fetch(`${this.baseUrl}/tracks/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async updateTrack(id: string, updates: any) {
    return this.request<{ track: any }>(`/tracks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTrack(id: string) {
    return this.request<{ message: string }>(`/tracks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleLikeTrack(id: string) {
    return this.request<{ track: any }>(`/tracks/${id}/like`, {
      method: 'POST',
    });
  }

  async recordPlay(id: string, durationPlayed: number) {
    return this.request<{ message: string }>(`/tracks/${id}/play`, {
      method: 'POST',
      body: JSON.stringify({ durationPlayed }),
    });
  }

  // Playlists
  async getPlaylists() {
    return this.request<{ playlists: any[] }>('/playlists');
  }

  async createPlaylist(name: string, description?: string, isPublic?: boolean) {
    return this.request<{ playlist: any }>('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name, description, isPublic }),
    });
  }

  async getPlaylist(id: string) {
    return this.request<{ playlist: any; tracks: any[] }>(`/playlists/${id}`);
  }

  async updatePlaylist(id: string, updates: any) {
    return this.request<{ playlist: any }>(`/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePlaylist(id: string) {
    return this.request<{ message: string }>(`/playlists/${id}`, {
      method: 'DELETE',
    });
  }

  async addTrackToPlaylist(playlistId: string, trackId: string) {
    return this.request<{ message: string }>(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ trackId }),
    });
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string) {
    return this.request<{ message: string }>(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
    });
  }

  // Settings
  async getSettings() {
    return this.request<{ settings: any }>('/settings');
  }

  async updateSettings(settings: any) {
    return this.request<{ settings: any }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async resetSettings() {
    return this.request<{ settings: any }>('/settings/reset', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
