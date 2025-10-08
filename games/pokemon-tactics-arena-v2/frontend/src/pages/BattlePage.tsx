import React from 'react';
import { Link } from 'react-router-dom';
import FeaturePlaceholder from '../components/FeaturePlaceholder';

const BattlePage: React.FC = () => {
  return (
    <div className="p-6">
      <FeaturePlaceholder
        title="Simulation de combat en préparation"
        description="Le moteur de combat utilisera bientôt les données réelles du backend. En attendant, composez votre équipe depuis le roster pour vous tenir prêt."
        actions={(
          <Link
            to="/team-builder"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            ⚙️ Ouvrir le builder d'équipe
          </Link>
        )}
      />
    </div>
  );
};

export default BattlePage;
