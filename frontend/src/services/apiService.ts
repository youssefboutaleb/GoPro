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

  // Doctor endpoints
  async getDoctors(token?: string) {
    return this.get<Array<any>>('/doctors', token);
  }

  async getDoctorById(id: string, token?: string) {
    return this.get<any>(`/doctors/${id}`, token);
  }

  async getDoctorsByBrick(brickId: string, token?: string) {
    return this.get<Array<any>>(`/doctors/brick/${brickId}`, token);
  }

  async createDoctor(doctor: any, token?: string) {
    return this.post<any>('/doctors', doctor, token);
  }

  async updateDoctor(id: string, doctor: any, token?: string) {
    return this.put<any>(`/doctors/${id}`, doctor, token);
  }

  async deleteDoctor(id: string, token?: string) {
    return this.delete(`/doctors/${id}`, token);
  }

  // Product endpoints
  async getProducts(token?: string) {
    return this.get<Array<any>>('/products', token);
  }

  async getProductById(id: string, token?: string) {
    return this.get<any>(`/products/${id}`, token);
  }

  async getProductsByTherapeuticClass(therapeuticClass: string, token?: string) {
    return this.get<Array<any>>(`/products/therapeutic-class/${therapeuticClass}`, token);
  }

  async createProduct(product: any, token?: string) {
    return this.post<any>('/products', product, token);
  }

  async updateProduct(id: string, product: any, token?: string) {
    return this.put<any>(`/products/${id}`, product, token);
  }

  async deleteProduct(id: string, token?: string) {
    return this.delete(`/products/${id}`, token);
  }

  // Action Plan endpoints
  async getActionPlans(token?: string) {
    return this.get<Array<any>>('/action-plans', token);
  }

  async getActionPlanById(id: string, token?: string) {
    return this.get<any>(`/action-plans/${id}`, token);
  }

  async getActionPlansByCreatedBy(createdBy: string, token?: string) {
    return this.get<Array<any>>(`/action-plans/created-by/${createdBy}`, token);
  }

  async getActionPlansByType(type: string, token?: string) {
    return this.get<Array<any>>(`/action-plans/type/${type}`, token);
  }

  async createActionPlan(actionPlan: any, token?: string) {
    return this.post<any>('/action-plans', actionPlan, token);
  }

  async updateActionPlan(id: string, actionPlan: any, token?: string) {
    return this.put<any>(`/action-plans/${id}`, actionPlan, token);
  }

  async deleteActionPlan(id: string, token?: string) {
    return this.delete(`/action-plans/${id}`, token);
  }

  // Sector endpoints
  async getSectors(token?: string) {
    return this.get<Array<any>>('/sectors', token);
  }

  async getSectorById(id: string, token?: string) {
    return this.get<any>(`/sectors/${id}`, token);
  }

  async createSector(sector: any, token?: string) {
    return this.post<any>('/sectors', sector, token);
  }

  async updateSector(id: string, sector: any, token?: string) {
    return this.put<any>(`/sectors/${id}`, sector, token);
  }

  async deleteSector(id: string, token?: string) {
    return this.delete(`/sectors/${id}`, token);
  }

  // Brick endpoints
  async getBricks(token?: string) {
    return this.get<Array<any>>('/bricks', token);
  }

  async getBrickById(id: string, token?: string) {
    return this.get<any>(`/bricks/${id}`, token);
  }

  async getBricksBySector(sectorId: string, token?: string) {
    return this.get<Array<any>>(`/bricks/sector/${sectorId}`, token);
  }

  async createBrick(brick: any, token?: string) {
    return this.post<any>('/bricks', brick, token);
  }

  async updateBrick(id: string, brick: any, token?: string) {
    return this.put<any>(`/bricks/${id}`, brick, token);
  }

  async deleteBrick(id: string, token?: string) {
    return this.delete(`/bricks/${id}`, token);
  }

  // Sales endpoints
  async getSales(token?: string) {
    return this.get<Array<any>>('/sales', token);
  }

  async getSalesById(id: string, token?: string) {
    return this.get<any>(`/sales/${id}`, token);
  }

  async getSalesBySalesPlan(salesPlanId: string, token?: string) {
    return this.get<Array<any>>(`/sales/sales-plan/${salesPlanId}`, token);
  }

  async createSales(sales: any, token?: string) {
    return this.post<any>('/sales', sales, token);
  }

  async updateSales(id: string, sales: any, token?: string) {
    return this.put<any>(`/sales/${id}`, sales, token);
  }

  async deleteSales(id: string, token?: string) {
    return this.delete(`/sales/${id}`, token);
  }

  // Sales Plan endpoints
  async getSalesPlans(token?: string) {
    return this.get<Array<any>>('/sales-plans', token);
  }

  async getSalesPlanById(id: string, token?: string) {
    return this.get<any>(`/sales-plans/${id}`, token);
  }

  async getSalesPlansByDelegate(delegateId: string, token?: string) {
    return this.get<Array<any>>(`/sales-plans/delegate/${delegateId}`, token);
  }

  async createSalesPlan(salesPlan: any, token?: string) {
    return this.post<any>('/sales-plans', salesPlan, token);
  }

  async updateSalesPlan(id: string, salesPlan: any, token?: string) {
    return this.put<any>(`/sales-plans/${id}`, salesPlan, token);
  }

  async deleteSalesPlan(id: string, token?: string) {
    return this.delete(`/sales-plans/${id}`, token);
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }
}

export const apiService = new ApiService();
