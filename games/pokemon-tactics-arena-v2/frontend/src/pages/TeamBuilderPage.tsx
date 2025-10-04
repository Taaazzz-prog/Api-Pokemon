import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pokemonGameService, type Pokemon } from '../services/pokemonGameService';
import { toast } from 'react-hot-toast';

interface TeamBuilderPageProps {
  className?: string;
}

interface TeamSlot {
  id: number;
  pokemon?: Pokemon;
  position: 'front' | 'middle' | 'back';
}

const TeamBuilderPage: React.FC<TeamBuilderPageProps> = ({ className = '' }) => {
  const queryClient = useQueryClient();
  
  // État de l'équipe (3 slots : avant, milieu, arrière)
  const [team, setTeam] = useState<TeamSlot[]>([
    { id: 1, position: 'front' },
    { id: 2, position: 'middle' },
    { id: 3, position: 'back' }
  ]);
  
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('Mon Équipe');
  const [filterType, setFilterType] = useState<string>('all');

  // Récupère les Pokemon disponibles (roster du joueur)
  const { data: availablePokemon = [], isLoading } = useQuery({
    queryKey: ['player-roster'],
    queryFn: async () => {
      // Simulation d'un roster basé sur nos vraies données
      const allPokemon = await pokemonGameService.getAllPokemon();
      return allPokemon.slice(0, 12); // Simule que le joueur possède 12 Pokemon
    }
  });

  // Récupère les types Pokemon
  const { data: pokemonTypes = [] } = useQuery({
    queryKey: ['pokemon-types'],
    queryFn: () => pokemonGameService.getPokemonTypes()
  });

  // Mutation pour sauvegarder l'équipe
  const saveTeamMutation = useMutation({
    mutationFn: async () => {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'Équipe sauvegardée avec succès !' };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['player-teams'] });
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde de l\'équipe');
    }
  });

  // Ajouter un Pokemon à l'équipe
  const addPokemonToTeam = (pokemon: Pokemon, slotId: number) => {
    setTeam(prevTeam => 
      prevTeam.map(slot => 
        slot.id === slotId ? { ...slot, pokemon } : slot
      )
    );
    setSelectedPokemon(null);
    setSelectedSlot(null);
    toast.success(`${pokemon.name} ajouté à l'équipe !`);
  };

  // Retirer un Pokemon de l'équipe
  const removePokemonFromTeam = (slotId: number) => {
    const slot = team.find(s => s.id === slotId);
    if (slot?.pokemon) {
      setTeam(prevTeam => 
        prevTeam.map(s => 
          s.id === slotId ? { ...s, pokemon: undefined } : s
        )
      );
      toast.success(`${slot.pokemon.name} retiré de l'équipe`);
    }
  };

  // Sauvegarder l'équipe
  const handleSaveTeam = () => {
    const teamPokemon = team.filter(slot => slot.pokemon);
    if (teamPokemon.length === 0) {
      toast.error('Votre équipe doit contenir au moins un Pokemon');
      return;
    }
    
    saveTeamMutation.mutate();
  };

  // Calculer les stats totales de l'équipe
  const getTeamStats = () => {
    const teamPokemon = team.filter(slot => slot.pokemon).map(slot => slot.pokemon!);
    if (teamPokemon.length === 0) {
      return { totalPower: 0, avgLevel: 0, typeCount: 0 };
    }

    const totalPower = teamPokemon.reduce((sum, pokemon) => 
      sum + pokemon.hp + pokemon.attack + pokemon.defense + 
      pokemon.specialAttack + pokemon.specialDefense + pokemon.speed, 0
    );

    const uniqueTypes = new Set(teamPokemon.flatMap(p => p.types.map(t => t.name)));
    
    return {
      totalPower,
      avgLevel: Math.round(totalPower / teamPokemon.length),
      typeCount: uniqueTypes.size
    };
  };

  // Filtrer les Pokemon disponibles
  const filteredPokemon = availablePokemon.filter(pokemon => {
    if (filterType === 'all') return true;
    return pokemon.types.some(type => type.name === filterType);
  });

  const teamStats = getTeamStats();

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de votre roster...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚔️ Formation d'Équipe</h1>
          <p className="text-gray-600">Composez votre équipe tactique pour les combats</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section Formation d'Équipe */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Formation Tactique</h2>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 max-w-xs"
                  placeholder="Nom de l'équipe"
                />
              </div>

              {/* Terrain de Combat */}
              <div className="bg-gradient-to-b from-green-100 to-green-200 rounded-lg p-6 mb-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-green-800">Terrain de Combat</h3>
                  <p className="text-sm text-green-600">Organisez votre formation (Front → Milieu → Arrière)</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {team.map((slot) => (
                    <div key={slot.id} className="relative">
                      <div className="text-center mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {slot.position === 'front' ? 'Avant' : 
                           slot.position === 'middle' ? 'Milieu' : 'Arrière'}
                        </span>
                      </div>
                      
                      <div 
                        className={`
                          aspect-square border-2 border-dashed rounded-lg p-4 transition-all duration-200
                          ${slot.pokemon 
                            ? 'border-purple-300 bg-white shadow-md' 
                            : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
                          }
                          ${selectedSlot === slot.id ? 'ring-2 ring-purple-500' : ''}
                          cursor-pointer
                        `}
                        onClick={() => {
                          if (!slot.pokemon) {
                            setSelectedSlot(slot.id);
                          }
                        }}
                      >
                        {slot.pokemon ? (
                          <div className="h-full flex flex-col">
                            {/* Image Pokemon */}
                            <div className="flex-1 relative">
                              <img
                                src={slot.pokemon.image}
                                alt={slot.pokemon.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/api/placeholder/100/100';
                                }}
                              />
                              
                              {/* Bouton supprimer */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePokemonFromTeam(slot.id);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                ❌
                              </button>
                            </div>
                            
                            {/* Info Pokemon */}
                            <div className="mt-2 text-center">
                              <p className="font-medium text-sm text-gray-800">{slot.pokemon.name}</p>
                              <div className="flex justify-center gap-1 mt-1">
                                {slot.pokemon.types.map(type => (
                                  <span
                                    key={type.id}
                                    className="px-1 py-0.5 rounded text-xs text-white"
                                    style={{ backgroundColor: type.color }}
                                  >
                                    {type.frenchName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <span className="text-2xl mb-2">➕</span>
                            <span className="text-sm">Ajouter un Pokemon</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistiques de l'équipe */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Statistiques de l'Équipe</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-lg mr-1">⚡</span>
                      <span className="text-sm font-medium text-gray-600">Puissance</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{teamStats.totalPower}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-lg mr-1">🛡️</span>
                      <span className="text-sm font-medium text-gray-600">Niveau Moyen</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{teamStats.avgLevel}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-lg mr-1">🔥</span>
                      <span className="text-sm font-medium text-gray-600">Types Uniques</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{teamStats.typeCount}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleSaveTeam}
                  disabled={saveTeamMutation.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">✅</span>
                  {saveTeamMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder l\'Équipe'}
                </button>
                
                <button
                  onClick={() => {
                    setTeam(prev => prev.map(slot => ({ ...slot, pokemon: undefined })));
                    toast.success('Équipe réinitialisée');
                  }}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Section Pokemon Disponibles */}
          <div className="space-y-6">
            
            {/* Filtre par type */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtrer par Type</h3>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tous les types</option>
                {pokemonTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.frenchName} ({type.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Liste des Pokemon */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center mb-4">
                <span className="text-lg mr-2">👥</span>
                <h3 className="text-lg font-semibold text-gray-800">Votre Roster</h3>
                <span className="ml-auto text-sm text-gray-500">
                  {filteredPokemon.length} Pokemon
                </span>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredPokemon.map(pokemon => {
                  const isInTeam = team.some(slot => slot.pokemon?.id === pokemon.id);
                  
                  return (
                    <div
                      key={pokemon.id}
                      className={`
                        p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                        ${isInTeam 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-200 bg-white hover:border-purple-300'
                        }
                        ${selectedSlot && !isInTeam ? 'hover:bg-purple-50' : ''}
                      `}
                      onClick={() => {
                        if (selectedSlot && !isInTeam) {
                          addPokemonToTeam(pokemon, selectedSlot);
                        } else if (!isInTeam) {
                          setSelectedPokemon(pokemon);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <img
                          src={pokemon.image}
                          alt={pokemon.name}
                          className="w-12 h-12 object-contain mr-3"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/50/50';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{pokemon.name}</p>
                          <div className="flex gap-1 mt-1">
                            {pokemon.types.map(type => (
                              <span
                                key={type.id}
                                className="px-2 py-0.5 rounded text-xs text-white"
                                style={{ backgroundColor: type.color }}
                              >
                                {type.frenchName}
                              </span>
                            ))}
                          </div>
                        </div>
                        {isInTeam && (
                          <div className="text-purple-600 font-medium text-sm">
                            En équipe
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de sélection de slot */}
        {selectedPokemon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Où placer {selectedPokemon.name} ?</h3>
              <div className="space-y-3">
                {team.map(slot => (
                  <button
                    key={slot.id}
                    disabled={!!slot.pokemon}
                    onClick={() => {
                      if (!slot.pokemon) {
                        addPokemonToTeam(selectedPokemon, slot.id);
                      }
                    }}
                    className={`
                      w-full p-3 rounded-lg border text-left transition-colors
                      ${slot.pokemon 
                        ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700'
                      }
                    `}
                  >
                    <div className="font-medium capitalize">
                      Position {slot.position === 'front' ? 'Avant' : 
                                 slot.position === 'middle' ? 'Milieu' : 'Arrière'}
                    </div>
                    {slot.pokemon && (
                      <div className="text-sm text-gray-500">
                        Occupé par {slot.pokemon.name}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedPokemon(null)}
                className="w-full mt-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Aide pour la sélection de slot */}
        {selectedSlot && (
          <div className="fixed bottom-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg">
            <p className="text-sm">
              Cliquez sur un Pokemon pour l'ajouter à la position{' '}
              <strong>
                {team.find(s => s.id === selectedSlot)?.position === 'front' ? 'Avant' :
                 team.find(s => s.id === selectedSlot)?.position === 'middle' ? 'Milieu' : 'Arrière'}
              </strong>
            </p>
            <button
              onClick={() => setSelectedSlot(null)}
              className="text-xs underline mt-1"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamBuilderPage;