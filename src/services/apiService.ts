// API configuration
import { API_BASE_URL } from '@/config';

// Authentication response interface
export interface AuthResponse {
  token: string;
  email: string;
  userId: string;
  fullName: string;
  role: string;
  hotelId: string | null;
}

// Ticket response interface
export interface TicketResponse {
  id: string;
  ticketNumber: string;
  hotelId: string;
  hotelName: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
  isUrgent: boolean;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  slaDeadline: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  images?: Array<{ id: string; storage_path: string; file_name: string }>;
}

// Hotel interface - exported as type to avoid runtime reference
export type Hotel = {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  planId?: string;
}

export interface Plan {
  id: string;
  name: string;
  baseCost: number;
  ticketQuota: number;
  excessTicketCost: number;
  maxTechnicians: number;
  slaHours: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isMandatory?: boolean;
  additionalCost?: number;
}

export interface Technician {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  hotelId: string;
  isActive: boolean;
  specialties?: string[];
  userId?: string;
}

export interface Subscription {
  id: string;
  hotelId: string;
  planId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  exists?: boolean;
  planBaseCost?: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  hotelId?: string;
}

// ============================================
// Interfaces RGPD
// ============================================

export interface GdprConsent {
  id: string;
  userId: string;
  consentType: string; // DATA_PROCESSING, MARKETING, ANALYTICS, THIRD_PARTY
  consented: boolean;
  consentDate: string;
  privacyPolicyVersion: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GdprDataExport {
  userId: string;
  exportDate: string;
  data: {
    profile: User;
    tickets: TicketResponse[];
    payments: Payment[];
    gdprConsents: GdprConsent[];
    auditLogs: AuditLog[];
  };
}

export interface GdprDeletionRequest {
  requestId: string;
  status: string;
  message: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  rejectionReason?: string;
  processedAt?: string;
  processedBy?: string;
  ipAddress?: string;
  confirmationSent: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  hotelId: string;
  hotelName?: string;
  amount: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  paymentDate?: string;
  nextPaymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  actionType: string;
  action?: string;
  entityType: string;
  entityId?: string;
  details?: string;
  description?: string;
  timestamp: string;
  userName?: string;
  userEmail?: string;
  hotelName?: string;
  ipAddress?: string;
  changes?: string | Record<string, unknown>;
}

export interface TicketComment {
  id: string;
  content: string;
  createdAt: string;
  created_at?: string;
  user?: { fullName?: string } | null;
}

export interface ReportData {
  [key: string]: string | number | unknown;
}

// Utilitaire pour headers avec authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    
    // Development mode: add email in header for "dev-token"
    if (token === 'dev-token') {
      try {
        const userDataStr = localStorage.getItem('user_data');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData.email) {
            headers['X-User-Email'] = userData.email;
          }
        }
      } catch (error) {
        console.error('Error parsing user_data for dev-token:', error);
      }
    }
  }
  
  return headers;
};

// Utility for multipart headers without authentication (dev)
const getMultipartHeaders = () => {
  return {};
};

// API Service
export const apiService = {
  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // Get error message from backend
      let errorMessage = 'Connection error';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // Backend returns JSON
          const errorJson = await response.json();
          errorMessage = errorJson.message || errorJson.error || 'Email or password incorrect';
        } else {
          // Backend returns plain text
          const errorText = await response.text();
          errorMessage = errorText || 'Email or password incorrect';
        }
      } catch (parseError) {
        errorMessage = 'Email or password incorrect';
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  },

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    hotelId?: string;
    role?: string;
    specialties?: string[];
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorJson = await response.json();
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
      } catch (parseError) {
        // Use default message if parsing fails
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  },

  logout() {
    // Disabled for development
  },

  // Hotels
  async getActiveHotels(): Promise<Hotel[]> {
    const response = await fetch(`${API_BASE_URL}/hotels/public`);

    if (!response.ok) {
      throw new Error('Failed to fetch hotels');
    }

    return response.json();
  },

  // SuperAdmin - Get all hotels
  async getAllHotels(): Promise<Hotel[]> {
    const response = await fetch(`${API_BASE_URL}/hotels`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch hotels');
    }

    return response.json();
  },

  async getHotelById(id: string): Promise<Hotel> {
    const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hotel');
    }

    return response.json();
  },

  // Get current hotel subscription
  async getHotelSubscription(hotelId: string): Promise<Subscription> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/hotel/${hotelId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }

    return response.json();
  },

  // Create Stripe Checkout session
  async createStripeCheckoutSession(hotelId: string, planId: string): Promise<{ sessionId: string; url: string }> {
    const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session?hotelId=${hotelId}&planId=${planId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
      const errorMessage = error.error || error.message || 'Failed to create checkout session';

      // Clearer error message for invalid API keys
      if (errorMessage.includes('Invalid API Key') || errorMessage.includes('sk_test_your_secret_key_here')) {
        throw new Error('Clé API Stripe non configurée. Veuillez configurer vos clés Stripe dans application.properties et redémarrer le backend.');
      }

      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Create new hotel (SuperAdmin)
  async createHotel(hotelData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    zipCode?: string;
    planId: string;
  }): Promise<Hotel> {
    const response = await fetch(`${API_BASE_URL}/hotels`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hotelData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create hotel' }));
      throw new Error(error.message || 'Failed to create hotel');
    }

    return response.json();
  },

  // Get all subscription plans
  async getAllPlans(): Promise<Plan[]> {
    const response = await fetch(`${API_BASE_URL}/plans`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }

    return response.json();
  },

  // Plan statistics
  async getPlanStatistics(): Promise<{
    total: number;
    avgPrice: number;
    avgQuota: number;
    avgSla: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/plans/statistics`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plan statistics');
    }

    return response.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/categories/public`);

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  },

  // Create new category
  async createCategory(category: {
    name: string;
    icon?: string;
    color?: string;
    isMandatory?: boolean;
    additionalCost?: number;
  }): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create category' }));
      throw new Error(error.error || error.message || 'Failed to create category');
    }

    return response.json();
  },

  // Audit logs
  async getAllAuditLogs(): Promise<AuditLog[]> {
    const response = await fetch(`${API_BASE_URL}/audit-logs/all`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }

    return response.json();
  },

  // Tickets
  async createTicket(ticketData: {
    hotelId: string;
    categoryId: string;
    clientEmail: string;
    clientPhone?: string;
    description: string;
    isUrgent?: boolean;
  }, images?: File[]): Promise<TicketResponse> {
    const formData = new FormData();

    // Add ticket data as JSON
    formData.append('ticket', new Blob([JSON.stringify(ticketData)], {
      type: 'application/json'
    }));

    // Add images if present
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await fetch(`${API_BASE_URL}/tickets/public`, {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData,
    });

    if (!response.ok) {
      // Try to get error message from backend
      let errorMessage = 'Failed to create ticket';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorJson = await response.json();
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
      } catch (parseError) {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async addImagesToTicket(ticketId: string, images: File[]): Promise<TicketResponse> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/images`, {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload images' }));
      throw new Error(error.message || 'Failed to upload images');
    }

    return response.json();
  },

  async deleteTicketImage(ticketId: string, imageId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/images/${imageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete image' }));
      throw new Error(error.message || error.error || 'Failed to delete image');
    }
  },

  async getTicketByNumber(ticketNumber: string): Promise<TicketResponse> {
    const response = await fetch(`${API_BASE_URL}/tickets/public/${ticketNumber}`);

    if (!response.ok) {
      throw new Error('Failed to fetch ticket');
    }

    return response.json();
  },

  async getTicketsByEmail(email: string): Promise<TicketResponse[]> {
    const response = await fetch(`${API_BASE_URL}/tickets/public/email/${email}`);

    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    return response.json();
  },

  async getTicketsByHotel(hotelId: string): Promise<TicketResponse[]> {
    const response = await fetch(`${API_BASE_URL}/tickets/hotel/${hotelId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    return response.json();
  },

  async getTicketsByTechnician(technicianId: string): Promise<TicketResponse[]> {
    const response = await fetch(`${API_BASE_URL}/tickets/technician/${technicianId}`, {
      headers: getAuthHeaders(),
    });

    // Disabled for development: no session management
    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    return response.json();
  },

  async updateTicketStatus(
    ticketId: string,
    status: string,
    userId: string,
    technicianId?: string
  ): Promise<TicketResponse> {
    const headers = getAuthHeaders();
    headers['Content-Type'] = 'application/json';
    
    const response = await fetch(
      `${API_BASE_URL}/tickets/${ticketId}/status?userId=${userId}`,
      {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ status, technicianId }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to update ticket status: ${errorText}`);
    }

    return response.json();
  },

  // SuperAdmin - Get all tickets
  async getAllTickets(): Promise<TicketResponse[]> {
    const response = await fetch(`${API_BASE_URL}/tickets/all`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    return response.json();
  },

  // SuperAdmin - Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  // Admin - Get technicians for a hotel
  async getTechniciansByHotel(hotelId: string): Promise<Technician[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/hotel/${hotelId}/technicians`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        globalThis.location.assign('/login');
        throw new Error('Session expirée');
      }

      if (!response.ok) {
        // Si c'est une erreur de connexion, donner un message plus clair
        if (response.status === 0 || response.type === 'opaque') {
          throw new Error('Le serveur backend n\'est pas accessible. Vérifiez qu\'il est démarré sur http://localhost:8080');
        }
        throw new Error('Erreur lors de la récupération des techniciens');
      }

      return response.json();
    } catch (error: unknown) {
      // Handle network connection errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('Le serveur backend n\'est pas accessible. Vérifiez qu\'il est démarré sur http://localhost:8080');
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // Admin - Create new technician
  async createTechnician(technicianData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    hotelId: string;
  }): Promise<Technician> {
    const response = await fetch(`${API_BASE_URL}/users/technicians`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(technicianData),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de la création du technicien');
    }

    return response.json();
  },

  // Admin - Update technician
  async updateTechnician(technicianId: string, technicianData: {
    email?: string;
    fullName?: string;
    phone?: string;
    password?: string;
    isActive?: boolean;
  }): Promise<Technician> {
    const response = await fetch(`${API_BASE_URL}/users/technicians/${technicianId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(technicianData),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de la modification du technicien');
    }

    return response.json();
  },

  // Admin - Delete technician
  async deleteTechnician(technicianId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/technicians/${technicianId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de la suppression du technicien');
    }
  },

  // Ticket comments
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des commentaires');
    }

    return response.json();
  },

  async addTicketComment(ticketId: string, content: string, userId: string): Promise<TicketComment> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, userId }),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de l\'ajout du commentaire');
    }

    return response.json();
  },

  // SuperAdmin - Get overdue payments
  async getOverduePayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments/overdue`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch overdue payments');
    }

    return response.json();
  },

  // Get all payments (for SuperAdmin)
  async getAllPayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments/all`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      globalThis.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch all payments');
    }

    return response.json();
  },

  // Reports - Monthly for a hotel
  async getMonthlyReport(hotelId: string, year?: number, month?: number): Promise<ReportData> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const response = await fetch(`${API_BASE_URL}/reports/hotel/${hotelId}/monthly?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch monthly report');
    }

    return response.json();
  },

  // Reports - Weekly for a hotel
  async getWeeklyReport(hotelId: string, startDate?: string): Promise<ReportData> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);

    const response = await fetch(`${API_BASE_URL}/reports/hotel/${hotelId}/weekly?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch weekly report');
    }

    return response.json();
  },

  // Reports - Daily for a hotel
  async getDailyReport(hotelId: string, date?: string): Promise<ReportData> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const response = await fetch(`${API_BASE_URL}/reports/hotel/${hotelId}/daily?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch daily report');
    }

    return response.json();
  },

  // Reports - Global (SuperAdmin only)
  async getGlobalReport(startDate?: string, endDate?: string): Promise<ReportData> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/reports/global?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch global report');
    }

    return response.json();
  },

  // ============================================
  // GDPR - Compliance and Data Protection
  // ============================================

  // Consentement RGPD
  async recordGdprConsent(consentType: string, consented: boolean): Promise<GdprConsent> {
    try {
      console.log('recordGdprConsent called:', { consentType, consented });
      
      const headers = getAuthHeaders();
      headers['Content-Type'] = 'application/json';
      
      const response = await fetch(`${API_BASE_URL}/gdpr/consent`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ consentType, consented }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Failed to record GDPR consent';
        try {
          const errorText = await response.text();
          console.log('Error response text:', errorText);
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || `Erreur ${response.status}: ${response.statusText}`;
            }
          }
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      console.log('Response text length:', text.length);
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
      }

      try {
        const data = JSON.parse(text);
        console.log('Parsed consent data:', data);
        return data;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // If JSON is malformed, try to return minimal object
        throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in recordGdprConsent:', error);
      throw error;
    }
  },

  async getUserConsents(): Promise<GdprConsent[]> {
    const response = await fetch(`${API_BASE_URL}/gdpr/consent`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch GDPR consents';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `Erreur ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Get available consents by role
  async getAvailableConsents(): Promise<{ role: string; availableConsents: Array<{ id: string; label: string; description: string; required: boolean }> }> {
    try {
      const response = await fetch(`${API_BASE_URL}/gdpr/available-consents`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch available consents';
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || `Erreur ${response.status}: ${response.statusText}`;
            }
          }
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      console.log('Response text:', text);
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
      }

      try {
        const data = JSON.parse(text);
        console.log('Parsed data:', data);
        return data;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', text);
        throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in getAvailableConsents:', error);
      throw error;
    }
  },

  // Export personal data
  async exportUserData(): Promise<GdprDataExport> {
    try {
      const response = await fetch(`${API_BASE_URL}/gdpr/export`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to export user data';
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || `Erreur ${response.status}: ${response.statusText}`;
            }
          }
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Pour les gros fichiers JSON, utiliser text() puis parse
      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
      }

      try {
        const data = JSON.parse(text);
        return data;
      } catch (parseError) {
        console.error('JSON parse error in export:', parseError);
        // If JSON is too large, try to download directly
        throw new Error(`Erreur lors du parsing des données exportées. Le fichier est peut-être trop volumineux.`);
      }
    } catch (error) {
      console.error('Error in exportUserData:', error);
      throw error;
    }
  },

  // Deletion request (Right to be forgotten)
  async requestDataDeletion(): Promise<GdprDeletionRequest> {
    const response = await fetch(`${API_BASE_URL}/gdpr/deletion-request`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to request data deletion' }));
      throw new Error(error.message || 'Failed to request data deletion');
    }

    return response.json();
  },

  // Admin: Liste des demandes de suppression
  async getAllDeletionRequests(): Promise<GdprDeletionRequest[]> {
    const response = await fetch(`${API_BASE_URL}/gdpr/deletion-requests`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch deletion requests');
    }

    return response.json();
  },

  // Admin: Traiter une demande de suppression
  async processDeletionRequest(requestId: string): Promise<{ message: string; requestId: string }> {
    const response = await fetch(`${API_BASE_URL}/gdpr/deletion-requests/${requestId}/process`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to process deletion request');
    }

    return response.json();
  },
};
