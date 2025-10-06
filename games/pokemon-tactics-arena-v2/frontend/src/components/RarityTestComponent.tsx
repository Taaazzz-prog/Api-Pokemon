import React from 'react';
import { getRarityConfig, rarityConfigs } from '../utils/rarityUtils';

const RarityTestComponent: React.FC = () => {
  // Pokemon factices pour tester les différentes raretés
  const testPokemon = [
    { name: 'Rattata', stats: { hp: 30, attack: 56, defense: 35, spAttack: 25, spDefense: 35, speed: 72 } }, // Total: 253 (common)
    { name: 'Pikachu', stats: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 } }, // Total: 320 (common)
    { name: 'Kadabra', stats: { hp: 40, attack: 35, defense: 30, spAttack: 120, spDefense: 70, speed: 105 } }, // Total: 400 (uncommon)
    { name: 'Charizard', stats: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 } }, // Total: 534 (epic)
    { name: 'Mewtwo', stats: { hp: 106, attack: 110, defense: 90, spAttack: 154, spDefense: 90, speed: 130 } }, // Total: 680 (legendary)
  ];

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Test des Raretés Pokemon</h2>
      
      {/* Affichage des configurations de rareté */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {Object.entries(rarityConfigs).map(([rarity, config]) => (
          <div key={rarity} className={`p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor}`}>
            <div className={`text-center font-bold ${config.textColor}`}>
              {config.label}
            </div>
          </div>
        ))}
      </div>

      {/* Test avec des Pokemon */}
      <div className="grid grid-cols-5 gap-4">
        {testPokemon.map((pokemon) => {
          const config = getRarityConfig(pokemon);
          const totalStats = Object.values(pokemon.stats).reduce((sum, stat) => sum + stat, 0);
          
          return (
            <div key={pokemon.name} className={`p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor}`}>
              <div className="text-center">
                <div className="font-bold">{pokemon.name}</div>
                <div className="text-sm">Stats: {totalStats}</div>
                <div className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${config.bgColor} ${config.textColor}`}>
                  {config.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RarityTestComponent;