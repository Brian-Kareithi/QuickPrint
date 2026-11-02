const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Public address of this web app, encoded into shop QR codes. Set NEXT_PUBLIC_APP_URL to
 * something a customer's phone can reach (LAN IP or the deployed domain) - "localhost"
 * only works on the machine running the app.
 */
export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/+$/, '');
  return typeof window !== 'undefined' ? window.location.origin : '';
}

const authHeader = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function errorMessage(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  const msg = body?.message;
  return (Array.isArray(msg) ? msg.join(', ') : msg) || `HTTP ${res.status}`;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) throw new Error(await errorMessage(res));

  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { email: string; password: string; name: string; phone?: string; accountType?: 'CUSTOMER' | 'OWNER' }) =>
      request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<any>('/auth/me'),
  },
  shops: {
    create: (data: { name: string; description?: string; email?: string; phone?: string; address?: string }) =>
      request<any>('/shops', { method: 'POST', body: JSON.stringify(data) }),
    mine: () => request<any[]>('/shops'),
    bySlug: (slug: string) => request<any>(`/shops/slug/${slug}`),
    byId: (id: string) => request<any>(`/shops/${id}`),
    update: (id: string, data: any) =>
      request<any>(`/shops/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateBranding: (id: string, data: any) =>
      request<any>(`/shops/${id}/branding`, { method: 'PATCH', body: JSON.stringify(data) }),
    updatePricing: (id: string, data: any) =>
      request<any>(`/shops/${id}/pricing`, { method: 'PATCH', body: JSON.stringify(data) }),
    staff: (id: string) => request<any[]>(`/shops/${id}/staff`),
    addStaff: (id: string, data: { name: string; email: string; password: string; phone?: string }) =>
      request<any>(`/shops/${id}/staff`, { method: 'POST', body: JSON.stringify(data) }),
    removeStaff: (id: string, userId: string) =>
      request<any>(`/shops/${id}/staff/${userId}`, { method: 'DELETE' }),
    updateServices: (id: string, data: any[]) =>
      request<any>(`/shops/${id}/services`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  qrcode: {
    get: (slug: string) =>
      request<{ url: string; qrDataUrl: string; qrSvg: string }>(`/qrcode/${slug}?baseUrl=${encodeURIComponent(getAppUrl())}`),
    poster: (slug: string) => `${API_BASE}/qrcode/${slug}/print-poster?baseUrl=${encodeURIComponent(getAppUrl())}`,
    download: (slug: string) => `${API_BASE}/qrcode/${slug}/poster?baseUrl=${encodeURIComponent(getAppUrl())}`,
  },
  uploads: {
    upload: async (shopId: string, file: File, onProgress?: (pct: number) => void) => {
      const formData = new FormData();
      formData.append('file', file);

      return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/uploads/${shopId}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else {
            let msg = 'Upload failed';
            try { const m = JSON.parse(xhr.responseText).message; msg = Array.isArray(m) ? m.join(', ') : m || msg; } catch {}
            reject(new Error(msg));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });
    },
    list: (shopId: string) => request<any[]>(`/uploads/shop/${shopId}`),
    get: (id: string) => request<any>(`/uploads/${id}`),
    /** Fetch a customer's file (owner only) and open it in a new tab so it can be printed. */
    open: async (id: string) => {
      const win = window.open('', '_blank'); // opened synchronously so popup blockers allow it
      try {
        const res = await fetch(`${API_BASE}/uploads/${id}/download`, { headers: authHeader() });
        if (!res.ok) throw new Error(await errorMessage(res));
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (win) win.location.href = url;
        else window.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
      } catch (err) {
        win?.close();
        throw err;
      }
    },
  },
  pricing: {
    calculate: (shopId: string, items: any[]) =>
      request<any>('/pricing/calculate', {
        method: 'POST',
        body: JSON.stringify({ shopId, items }),
      }),
  },
  orders: {
    create: (data: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    list: (shopId: string, status?: string) =>
      request<any[]>(`/orders/shop/${shopId}${status ? `?status=${status}` : ''}`),
    queue: (shopId: string) => request<{ awaiting: any[]; printing: any[] }>(`/orders/queue/${shopId}`),
    ready: (shopId: string) => request<any[]>(`/orders/ready/${shopId}`),
    completed: (shopId: string) => request<any[]>(`/orders/completed/${shopId}`),
    get: (id: string) => request<any>(`/orders/${id}`),
    mine: () => request<any[]>('/orders/mine'),
    byNumber: (num: string) => request<any>(`/orders/number/${num}`),
    updateStatus: (id: string, status: string) =>
      request<any>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  payments: {
    mpesa: (orderId: string, phone: string, amount: number) =>
      request<any>('/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ orderId, phone, amount }),
      }),
    airtel: (orderId: string, phone: string, amount: number) =>
      request<any>('/payments/airtel/initiate', {
        method: 'POST',
        body: JSON.stringify({ orderId, phone, amount }),
      }),
    card: (orderId: string, amount: number) =>
      request<any>('/payments/card/initiate', {
        method: 'POST',
        body: JSON.stringify({ orderId, amount }),
      }),
    order: (orderId: string) => request<any[]>(`/payments/order/${orderId}`),
  },
  notifications: {
    list: () => request<any[]>('/notifications'),
    markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),
  },
  analytics: {
    dashboard: (shopId: string) => request<any>(`/analytics/dashboard/${shopId}`),
    revenue: (shopId: string, days = 30) => request<any[]>(`/analytics/revenue/${shopId}?days=${days}`),
    orders: (shopId: string, days = 30) => request<any[]>(`/analytics/orders/${shopId}?days=${days}`),
    hours: (shopId: string) => request<any[]>(`/analytics/hours/${shopId}`),
    printer: (shopId: string) => request<any>(`/analytics/printer/${shopId}`),
  },
  admin: {
    stats: () => request<any>('/admin/stats'),
    shops: (page = 1, limit = 50, status?: string) =>
      request<any>(`/admin/shops?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
    suspend: (id: string) => request<any>(`/admin/shops/${id}/suspend`, { method: 'POST' }),
    activate: (id: string) => request<any>(`/admin/shops/${id}/activate`, { method: 'POST' }),
    health: () => request<any>('/admin/health'),
    retention: () => request<any>('/admin/retention'),
  },
};
