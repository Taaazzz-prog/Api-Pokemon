import React from 'react';
import FeaturePlaceholder from '../components/FeaturePlaceholder';

const TeamFormationPage: React.FC = () => (
  <div className="p-6">
    <FeaturePlaceholder
      title="Formation rapide"
      description="La formation rapide de line-up sera réactivée lorsque le builder d'équipe sera synchronisé avec les données roster."
    />
  </div>
);

export default TeamFormationPage;
