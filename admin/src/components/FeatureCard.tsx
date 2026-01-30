'use client';

import { Feature, updateFeature, deleteFeature } from '@/lib/api';

interface FeatureCardProps {
  feature: Feature;
  onUpdate: () => void;
  onEdit: (feature: Feature) => void;
}

export default function FeatureCard({ feature, onUpdate, onEdit }: FeatureCardProps) {
  const handleToggle = async () => {
    try {
      await updateFeature(feature.id, { enabled: !feature.enabled });
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle feature:', error);
      alert('Failed to toggle feature');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${feature.name}"?`)) return;
    try {
      await deleteFeature(feature.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete feature:', error);
      alert('Failed to delete feature');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                feature.enabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {feature.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 font-mono">{feature.app_id} / {feature.key}</p>
          {feature.description && (
            <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            feature.enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              feature.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Rollout</span>
          <div className="mt-1">
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${feature.rollout_percentage}%` }}
                />
              </div>
              <span className="ml-2 text-gray-900 font-medium">{feature.rollout_percentage}%</span>
            </div>
          </div>
        </div>
        <div>
          <span className="text-gray-500">Start Date</span>
          <p className="mt-1 text-gray-900">{formatDate(feature.start_date)}</p>
        </div>
        <div>
          <span className="text-gray-500">End Date</span>
          <p className="mt-1 text-gray-900">{formatDate(feature.end_date)}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => onEdit(feature)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
