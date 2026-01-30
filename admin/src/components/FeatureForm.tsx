'use client';

import { useState, useEffect } from 'react';
import { Feature, FeatureCreate, createFeature, updateFeature } from '@/lib/api';

interface FeatureFormProps {
  feature?: Feature | null;
  onClose: () => void;
  onSave: () => void;
}

export default function FeatureForm({ feature, onClose, onSave }: FeatureFormProps) {
  const [formData, setFormData] = useState<FeatureCreate>({
    app_id: '',
    key: '',
    name: '',
    description: '',
    enabled: false,
    start_date: null,
    end_date: null,
    rollout_percentage: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (feature) {
      setFormData({
        app_id: feature.app_id,
        key: feature.key,
        name: feature.name,
        description: feature.description,
        enabled: feature.enabled,
        start_date: feature.start_date,
        end_date: feature.end_date,
        rollout_percentage: feature.rollout_percentage,
      });
    }
  }, [feature]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (feature) {
        await updateFeature(feature.id, formData);
      } else {
        await createFeature(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return '';
    return dateStr.slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            {feature ? 'Edit Feature' : 'Create Feature'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">App ID</label>
            <input
              type="text"
              required
              value={formData.app_id}
              onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
              placeholder="com.example.myapp"
              disabled={!!feature}
            />
            <p className="mt-1 text-xs text-gray-500">Application identifier (e.g., com.example.myapp)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Key</label>
            <input
              type="text"
              required
              pattern="^[a-z][a-z0-9_]*$"
              title="Lowercase letters, numbers, and underscores. Must start with a letter."
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
              placeholder="dark_mode"
            />
            <p className="mt-1 text-xs text-gray-500">Unique identifier (e.g., dark_mode)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
              placeholder="Dark Mode"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
              placeholder="Enable dark mode theme"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
              Enabled
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rollout Percentage: {formData.rollout_percentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.rollout_percentage}
              onChange={(e) => setFormData({ ...formData, rollout_percentage: parseInt(e.target.value) })}
              className="mt-1 block w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date (Optional)</label>
            <input
              type="datetime-local"
              value={formatDateForInput(formData.start_date ?? null)}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
            <input
              type="datetime-local"
              value={formatDateForInput(formData.end_date ?? null)}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : feature ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
