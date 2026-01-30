const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Feature {
  id: string;
  app_id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  start_date: string | null;
  end_date: string | null;
  rollout_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface FeatureCreate {
  app_id: string;
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  rollout_percentage?: number;
}

export interface FeatureUpdate {
  app_id?: string;
  key?: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  rollout_percentage?: number;
}

export async function getFeatures(appId?: string): Promise<Feature[]> {
  const url = appId
    ? `${API_URL}/api/admin/features?app_id=${encodeURIComponent(appId)}`
    : `${API_URL}/api/admin/features`;
  const res = await fetch(url, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch features');
  return res.json();
}

export async function getFeature(id: string): Promise<Feature> {
  const res = await fetch(`${API_URL}/api/admin/features/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch feature');
  return res.json();
}

export async function createFeature(feature: FeatureCreate): Promise<Feature> {
  const res = await fetch(`${API_URL}/api/admin/features`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feature),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to create feature');
  }
  return res.json();
}

export async function updateFeature(id: string, update: FeatureUpdate): Promise<Feature> {
  const res = await fetch(`${API_URL}/api/admin/features/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to update feature');
  }
  return res.json();
}

export async function deleteFeature(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/features/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete feature');
}
