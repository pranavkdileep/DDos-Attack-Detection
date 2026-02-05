import { type Incident, type TrafficData, type PaginatedResponse, type IncidentReport } from '../types';

const API_BASE = 'http://localhost:5000/api';

const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('chat_dashboard_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const login = async (username: string, password: string): Promise<{ user: string; token: string }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return await res.json();
};

export const fetchIncidents = async (page: number, pageSize: number): Promise<PaginatedResponse<Incident>> => {
    const res = await fetch(`${API_BASE}/incidents?page=${page}&pageSize=${pageSize}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return await res.json();
};

export const fetchTrafficData = async (incidentId: string, page: number, pageSize: number): Promise<PaginatedResponse<TrafficData>> => {
    const encodedId = encodeURIComponent(incidentId);
    const res = await fetch(`${API_BASE}/incidents/${encodedId}/traffic?page=${page}&pageSize=${pageSize}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch traffic');
    return await res.json();
};

export const aiPredictThreat = async (incidentId: string): Promise<{ score: number; label: string }> => {
    const encodedId = encodeURIComponent(incidentId);
    const res = await fetch(`${API_BASE}/incidents/${encodedId}/ai-predict`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to predict threat');
    return await res.json();
};

export const fetchIncidentReport = async (incidentId: string): Promise<IncidentReport> => {
    const encodedId = encodeURIComponent(incidentId);
    const res = await fetch(`${API_BASE}/incidents/${encodedId}/report`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch report');
    return await res.json();
};

export const saveIncidentReport = async (incidentId: string, content: string): Promise<void> => {
    const encodedId = encodeURIComponent(incidentId);
    await fetch(`${API_BASE}/incidents/${encodedId}/report`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content })
    });
};

export const generateAutoReport = async (incidentId: string): Promise<string> => {
    const encodedId = encodeURIComponent(incidentId);
    const res = await fetch(`${API_BASE}/incidents/${encodedId}/auto-report`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return await res.json();
};
