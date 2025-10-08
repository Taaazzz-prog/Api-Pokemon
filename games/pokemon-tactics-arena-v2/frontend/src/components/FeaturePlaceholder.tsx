import React from 'react';

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

const FeaturePlaceholder: React.FC<FeaturePlaceholderProps> = ({ title, description, actions }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-10">
    <div className="text-6xl">🚧</div>
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
      <p className="text-slate-600 max-w-xl mx-auto">{description}</p>
    </div>
    {actions}
  </div>
);

export default FeaturePlaceholder;
