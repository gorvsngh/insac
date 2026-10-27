import { EventSettings, User, Registration, Payment, Abstract, DashboardStats } from '../types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string> || {}),
    },
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg) as Error & { errors?: Array<{ field: string; message: string; msg?: string }>; status?: number };
    error.errors = data.errors;
    error.status = response.status;
    throw error;
  }

  return data as T;
}

export const api = {
  // Auth
  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
    institution?: string;
    department?: string;
    designation?: string;
    participantCategory?: string;
    consentGiven: boolean;
  }): Promise<{ success: boolean; message: string; user: User }> {
    return fetchJson(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        confirmPassword: payload.confirmPassword || payload.password,
      }),
    });
  },

  async login(payload: { email: string; password: string }): Promise<{ success: boolean; message: string; user: User }> {
    return fetchJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE}/auth/logout`, {
      method: 'POST',
    });
  },

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    return fetchJson(`${API_BASE}/auth/me`);
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  // Public Settings & Template
  async getPublicSettings(): Promise<{ success: boolean; settings: EventSettings }> {
    return fetchJson(`${API_BASE}/settings/public`);
  },

  getTemplateDownloadUrl(): string {
    return `${API_BASE}/settings/template/download`;
  },

  // Registration
  async createRegistration(payload: {
    category: string;
    institution?: string;
    department?: string;
    designation?: string;
    remarks?: string;
  }): Promise<{ success: boolean; message: string; registration: Registration }> {
    return fetchJson(`${API_BASE}/registrations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMyRegistration(): Promise<{ success: boolean; registration: Registration | null; feeSnapshot?: number }> {
    return fetchJson(`${API_BASE}/registrations/my`);
  },

  // Payment
  async submitPayment(payload: {
    registrationRef?: string;
    payerUpiId: string;
    transactionId: string;
    paymentMethod?: 'upi' | 'cash' | 'bank_transfer';
    amountPaid?: number;
    paymentDate?: string;
    receiptNumber?: string;
    transferReference?: string;
    transferDate?: string;
    remarks?: string;
  }): Promise<{ success: boolean; message: string; payment: Payment }> {
    return fetchJson(`${API_BASE}/payments`, {
      method: 'POST',
      body: JSON.stringify({
        paymentMethod: 'upi',
        ...payload,
      }),
    });
  },

  async getMyPayment(): Promise<{ success: boolean; payment: Payment | null }> {
    return fetchJson(`${API_BASE}/payments/my`);
  },

  // Abstract
  async submitAbstract(formData: FormData): Promise<{ success: boolean; message: string; abstract: Abstract }> {
    return fetchJson(`${API_BASE}/abstracts`, {
      method: 'POST',
      body: formData,
    });
  },

  async getMyAbstract(): Promise<{ success: boolean; abstract: Abstract | null }> {
    return fetchJson(`${API_BASE}/abstracts/my`);
  },

  async updateMyAbstract(formData: FormData): Promise<{ success: boolean; message: string; abstract: Abstract }> {
    return fetchJson(`${API_BASE}/abstracts/my`, {
      method: 'PUT',
      body: formData,
    });
  },

  // Admin Endpoints
  async getDashboardStats(): Promise<{ success: boolean; stats: DashboardStats }> {
    return fetchJson(`${API_BASE}/settings/admin/stats`);
  },

  async getAdminSettings(): Promise<{ success: boolean; settings: EventSettings }> {
    return fetchJson(`${API_BASE}/settings`);
  },

  async updateSettings(settings: Partial<EventSettings>): Promise<{ success: boolean; message: string; settings: EventSettings }> {
    return fetchJson(`${API_BASE}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async uploadTemplate(formData: FormData): Promise<{ success: boolean; message: string; filename: string }> {
    return fetchJson(`${API_BASE}/settings/template`, {
      method: 'POST',
      body: formData,
    });
  },

  async getAdminRegistrations(params: { page?: number; limit?: number; status?: string; category?: string; search?: string } = {}): Promise<{
    success: boolean;
    registrations: Registration[];
    pagination: { total: number; page: number; pages: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status) query.set('status', params.status);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    return fetchJson(`${API_BASE}/registrations?${query.toString()}`);
  },

  async confirmRegistration(id: string): Promise<{ success: boolean; message: string; registration: Registration }> {
    return fetchJson(`${API_BASE}/registrations/${id}/confirm`, {
      method: 'PATCH',
    });
  },

  async getAdminPayments(params: { page?: number; limit?: number; status?: string; method?: string; search?: string } = {}): Promise<{
    success: boolean;
    payments: Payment[];
    pagination: { total: number; page: number; pages: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status) query.set('status', params.status);
    if (params.method) query.set('method', params.method);
    if (params.search) query.set('search', params.search);
    return fetchJson(`${API_BASE}/payments?${query.toString()}`);
  },

  async verifyPayment(id: string): Promise<{ success: boolean; message: string; payment: Payment }> {
    return fetchJson(`${API_BASE}/payments/${id}/verify`, {
      method: 'PATCH',
    });
  },

  async rejectPayment(id: string, reason: string): Promise<{ success: boolean; message: string; payment: Payment }> {
    return fetchJson(`${API_BASE}/payments/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason: reason }),
    });
  },

  async getAdminAbstracts(params: { page?: number; limit?: number; status?: string; theme?: string; search?: string } = {}): Promise<{
    success: boolean;
    abstracts: Abstract[];
    pagination: { total: number; page: number; pages: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status) query.set('status', params.status);
    if (params.theme) query.set('theme', params.theme);
    if (params.search) query.set('search', params.search);
    return fetchJson(`${API_BASE}/abstracts?${query.toString()}`);
  },

  async reviewAbstract(id: string, payload: {
    status: 'accepted' | 'rejected' | 'revision_requested' | 'under_review';
    reviewNotes?: string;
    revisionComments?: string;
  }): Promise<{ success: boolean; message: string; abstract: Abstract }> {
    return fetchJson(`${API_BASE}/abstracts/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  getAbstractAttachmentUrl(id: string): string {
    return `${API_BASE}/abstracts/${id}/attachment`;
  },

  getExportCsvUrl(): string {
    return `${API_BASE}/registrations/export/csv`;
  },
};
