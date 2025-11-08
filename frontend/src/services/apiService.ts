const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

class ApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  async put<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text);
  }

  async delete(endpoint: string, token?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  async getCurrentUser(token: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    sectorId: string;
    supervisorId: string;
    createdAt: string;
    updatedAt: string;
  } | null> {
    return this.get('/auth/me', token);
  }

  async refreshToken(refreshToken: string) {
    return this.post('/auth/refresh', { refreshToken });
  }

  async logout(token: string) {
    return this.post('/auth/logout', {}, token);
  }

  // Profile endpoints
  async getProfiles(token?: string) {
    return this.get<Array<any>>('/profiles', token);
  }

  async getProfileById(id: string, token?: string) {
    return this.get<any>(`/profiles/${id}`, token);
  }

  async getProfilesByRole(role: string, token?: string) {
    return this.get<Array<any>>(`/profiles/role/${role}`, token);
  }

  async getProfilesBySupervisor(supervisorId: string, token?: string) {
    return this.get<Array<any>>(`/profiles/supervisor/${supervisorId}`, token);
  }

  async createProfile(profile: any, token?: string) {
    return this.post<any>('/profiles', profile, token);
  }

  async updateProfile(id: string, profile: any, token?: string) {
    return this.put<any>(`/profiles/${id}`, profile, token);
  }

  async deleteProfile(id: string, token?: string) {
    return this.delete(`/profiles/${id}`, token);
  }

  // Visit endpoints
  async getVisits(token?: string) {
    return this.get<Array<any>>('/visits', token);
  }

  async getVisitById(id: string, token?: string) {
    return this.get<any>(`/visits/${id}`, token);
  }

  async getVisitsByDelegate(delegateId: string, token?: string) {
    return this.get<Array<any>>(`/visits/delegate/${delegateId}`, token);
  }

  async getVisitsByDoctor(doctorId: string, token?: string) {
    return this.get<Array<any>>(`/visits/doctor/${doctorId}`, token);
  }

  async getVisitsByStatus(status: string, token?: string) {
    return this.get<Array<any>>(`/visits/status/${status}`, token);
  }

  async createVisit(visit: any, token?: string) {
    return this.post<any>('/visits', visit, token);
  }

  async updateVisit(id: string, visit: any, token?: string) {
    return this.put<any>(`/visits/${id}`, visit, token);
  }

  async deleteVisit(id: string, token?: string) {
    return this.delete(`/visits/${id}`, token);
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }
}

export const apiService = new ApiService();
