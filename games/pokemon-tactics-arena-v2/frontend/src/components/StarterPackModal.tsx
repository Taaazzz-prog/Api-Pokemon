import React, { useState } from 'react';
import { StarterPackResult } from '../services/starterPackService';
import { Pokemon } from '../services/realPokemonData';
import { getRarityBorderClasses, getRarityConfig } from '../utils/rarityUtils';
import Button from './ui/Button';
import Card from './ui/Card';

interface StarterPackModalProps {
  isOpen: boolean;
  starterPack: StarterPackResult | null;
  onAccept: () => Promise<void>;
  onClose: () => void;
}

const StarterPackModal: React.FC<StarterPackModalProps> = ({
  isOpen,
  starterPack,
  onAccept,
  onClose
}) => {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept();
    } finally {
      setIsAccepting(false);
    }
  };

  const getRarityColor = (pokemon: Pokemon) => {
    const config = getRarityConfig(pokemon);
    return `${config.borderColor} ${config.bgColor}`;
  };

  const getRarityBadgeColor = (pokemon: Pokemon) => {
    const config = getRarityConfig(pokemon);
    return `${config.bgColor} ${config.textColor}`;
  };

  if (!starterPack) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎁</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Pack de Démarrage
                </h2>
                <p className="text-lg text-gray-600">
                  Bienvenue dans l'arène Pokémon ! Voici votre équipe de démarrage.
                </p>
              </div>

              {/* Message spécial */}
              <div className="mb-6">
                <Card className="p-4 text-center bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                  <p className="text-lg font-medium text-gray-800">
                    {starterPack.message}
                  </p>
                </Card>
              </div>

              {/* Pokemon Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {starterPack.pokemon.map((pokemon) => (
                  <div key={pokemon.id}>
                    <Card className={`p-4 text-center border-2 ${getRarityColor(pokemon)}`}>
                      {/* Image Pokemon */}
                      <div className="relative mb-3">
                        <img 
                          src={pokemon.image || '/images/pokemon/unknown.png'} 
                          alt={pokemon.name}
                          className="w-20 h-20 mx-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/images/pokemon/unknown.png';
                          }}
                        />
                        {/* Badge Rareté */}
                        <div className={`absolute -top-2 -right-2 px-2 py-1 text-xs font-bold rounded-full ${getRarityBadgeColor(pokemon)}`}>
                          {pokemon.rarity.toUpperCase()}
                        </div>
                        {/* Badge Légendaire */}
                        {pokemon.isLegendary && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <span className="text-2xl">✨</span>
                          </div>
                        )}
                      </div>

                      {/* Nom Pokemon */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {pokemon.name}
                      </h3>

                      {/* Types */}
                      <div className="flex flex-wrap justify-center gap-1 mb-3">
                        {pokemon.types.map((type, typeIndex) => (
                          <span
                            key={typeIndex}
                            className={`px-2 py-1 text-xs font-medium rounded-full type-${type.frenchName?.toLowerCase() || type.name?.toLowerCase()}`}
                          >
                            {type.frenchName || type.name}
                          </span>
                        ))}
                      </div>

                      {/* Stats de base */}
                      <div className="text-sm text-gray-600">
                        <div className="grid grid-cols-2 gap-1">
                          <div>HP: {pokemon.hp}</div>
                          <div>ATT: {pokemon.attack}</div>
                          <div>DEF: {pokemon.defense}</div>
                          <div>VIT: {pokemon.speed}</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Bonus inclus */}
              <div className="mb-6">
                <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                    🎉 Bonus de Démarrage Inclus !
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">💰</span>
                      <span className="font-medium">+500 Crédits</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">💎</span>
                      <span className="font-medium">+5 Gemmes</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">⭐</span>
                      <span className="font-medium">Équipe Niveau 5</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isAccepting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Acceptation...</span>
                    </div>
                  ) : (
                    '🎯 Accepter l\'équipe de démarrage'
                  )}
                </Button>
              </div>

              {/* Note informative */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>
                  Cette équipe de démarrage unique ne peut être obtenue qu'une seule fois.
                  Profitez-en pour commencer votre aventure Pokémon !
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StarterPackModal;