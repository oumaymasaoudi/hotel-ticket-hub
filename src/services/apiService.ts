// Configuration de l'API
import { API_BASE_URL } from '@/config';

// Interface pour la réponse d'authentification
export interface AuthResponse {
  token: string;
  email: string;
  userId: string;
  fullName: string;
  role: string;
  hotelId: string | null;
}

// Interface pour la réponse de ticket
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

export interface Hotel {
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
  isActive: boolean;
  role?: string;
  specialties?: string[];
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

// Utilitaire pour headers sans authentification (dev)
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Utilitaire pour headers multipart sans authentification (dev)
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
      // ✅ Récupérer le message d'erreur du backend
      let errorMessage = 'Erreur de connexion';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // Le backend retourne du JSON
          const errorJson = await response.json();
          errorMessage = errorJson.message || errorJson.error || 'Email ou mot de passe incorrect';
        } else {
          // Le backend retourne du texte brut
          const errorText = await response.text();
          errorMessage = errorText || 'Email ou mot de passe incorrect';
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
      const errorText = await response.text();
      throw new Error('Registration failed');
    }

    const data = await response.json();
    return data;
  },

  logout() {
    // Désactivé pour le développement
  },

  // Hotels
  async getActiveHotels(): Promise<Hotel[]> {
    const response = await fetch(`${API_BASE_URL}/hotels/public`);

    if (!response.ok) {
      throw new Error('Failed to fetch hotels');
    }

    return response.json();
  },

  // ✅ SuperAdmin - Récupérer tous les hôtels
  async getAllHotels(): Promise<Hotel[]> {
    const response = await fetch(`${API_BASE_URL}/hotels`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.assign('/login');
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

  // ✅ Récupérer l'abonnement actuel d'un hôtel
  async getHotelSubscription(hotelId: string): Promise<Subscription> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/hotel/${hotelId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }

    return response.json();
  },

  // ✅ Créer une session Stripe Checkout
  async createStripeCheckoutSession(hotelId: string, planId: string): Promise<{ sessionId: string; url: string }> {
    const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session?hotelId=${hotelId}&planId=${planId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
      const errorMessage = error.error || error.message || 'Failed to create checkout session';

      // Message d'erreur plus clair pour les clés API invalides
      if (errorMessage.includes('Invalid API Key') || errorMessage.includes('sk_test_your_secret_key_here')) {
        throw new Error('Clé API Stripe non configurée. Veuillez configurer vos clés Stripe dans application.properties et redémarrer le backend.');
      }

      throw new Error(errorMessage);
    }

    return response.json();
  },

  // ✅ Créer un nouvel hôtel (SuperAdmin)
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

  // ✅ Récupérer tous les plans d'abonnement
  async getAllPlans(): Promise<Plan[]> {
    const response = await fetch(`${API_BASE_URL}/plans`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }

    return response.json();
  },

  // ✅ Statistiques des plans
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

  // ✅ Créer une nouvelle catégorie
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

  // ✅ Logs d'audit
  async getAllAuditLogs(): Promise<AuditLog[]> {
    const response = await fetch(`${API_BASE_URL}/audit-logs/all`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.assign('/login');
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

    // Ajouter les données du ticket comme JSON
    formData.append('ticket', new Blob([JSON.stringify(ticketData)], {
      type: 'application/json'
    }));

    // Ajouter les images si présentes
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
      // Essayer de récupérer le message d'erreur du backend
      let errorMessage = 'Impossible de créer le ticket';
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
      window.location.assign('/login');
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

    // Désactivé pour le développement : pas de gestion de session
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
    const response = await fetch(
      `${API_BASE_URL}/tickets/${ticketId}/status?userId=${userId}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, technicianId }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update ticket status');
    }

    return response.json();
  },

  // ✅ SuperAdmin - Récupérer tous les tickets
  async getAllTickets(): Promise<TicketResponse[]> {
    const response = await fetch(`${API_BASE_URL}/tickets/all`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    return response.json();
  },

  // ✅ SuperAdmin - Récupérer tous les utilisateurs
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  // ✅ Admin - Récupérer les techniciens d'un hôtel
  async getTechniciansByHotel(hotelId: string): Promise<Technician[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/hotel/${hotelId}/technicians`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.assign('/login');
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
      // Gérer les erreurs de connexion réseau
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('Le serveur backend n\'est pas accessible. Vérifiez qu\'il est démarré sur http://localhost:8080');
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // ✅ Admin - Créer un nouveau technicien
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
      window.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de la création du technicien');
    }

    return response.json();
  },

  // ✅ Admin - Modifier un technicien
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
      window.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de la modification du technicien');
    }

    return response.json();
  },

  // ✅ Admin - Supprimer un technicien
  async deleteTechnician(technicianId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/technicians/${technicianId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de la suppression du technicien');
    }
  },

  // ✅ Commentaires sur tickets
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.assign('/login');
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
      window.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de l\'ajout du commentaire');
    }

    return response.json();
  },

  // ✅ SuperAdmin - Récupérer les paiements en retard
  async getOverduePayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments/overdue`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch overdue payments');
    }

    return response.json();
  },

  // ✅ Récupérer tous les paiements (pour SuperAdmin)
  async getAllPayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments/all`, {
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.assign('/login');
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch all payments');
    }

    return response.json();
  },

  // ✅ Rapports - Mensuel pour un hôtel
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

  // ✅ Rapports - Hebdomadaire pour un hôtel
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

  // ✅ Rapports - Quotidien pour un hôtel
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

  // ✅ Rapports - Global (SuperAdmin uniquement)
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
};
