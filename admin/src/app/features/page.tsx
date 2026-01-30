import FeatureList from '@/components/FeatureList';

export default function FeaturesPage() {
  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feature Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create, edit, and manage your feature toggles
        </p>
      </div>
      <FeatureList />
    </div>
  );
}
