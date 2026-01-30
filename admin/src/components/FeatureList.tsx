'use client';

import { useState, useEffect } from 'react';
import { Feature, getFeatures } from '@/lib/api';
import FeatureCard from './FeatureCard';
import FeatureForm from './FeatureForm';

export default function FeatureList() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appFilter, setAppFilter] = useState<string>('');
  const [availableApps, setAvailableApps] = useState<string[]>([]);

  const loadFeatures = async () => {
    try {
      const data = await getFeatures();
      setFeatures(data);
      // Extract unique app IDs
      const apps = [...new Set(data.map(f => f.app_id))].sort();
      setAvailableApps(apps);
    } catch (error) {
      console.error('Failed to load features:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFeature(null);
  };

  const filteredFeatures = features.filter(
    (f) =>
      (f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
       f.app_id.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (appFilter === '' || f.app_id === appFilter)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading features...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex-1 flex gap-4">
          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
          >
            <option value="">All Apps</option>
            {availableApps.map((app) => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Feature
        </button>
      </div>

      {filteredFeatures.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery ? 'No features match your search' : 'No features yet'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first feature
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFeatures.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onUpdate={loadFeatures}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {showForm && (
        <FeatureForm
          feature={editingFeature}
          onClose={handleCloseForm}
          onSave={loadFeatures}
        />
      )}
    </div>
  );
}
