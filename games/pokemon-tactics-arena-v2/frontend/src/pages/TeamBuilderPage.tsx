import React from 'react';
import { Link } from 'react-router-dom';
import FeaturePlaceholder from '../components/FeaturePlaceholder';

const TeamBuilderPage: React.FC = () => {
  return (
    <div className="p-6">
      <FeaturePlaceholder
        title="Builder d'équipe à finaliser"
        description="L'éditeur d'équipe sera raccroché aux nouvelles routes roster dès l'implémentation des API de composition. Les Pokémon présents dans votre roster resteront accessibles."
        actions={(
          <Link
            to="/roster"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
          >
            📦 Consulter mon roster
          </Link>
        )}
      />
    </div>
  );
};

export default TeamBuilderPage;
