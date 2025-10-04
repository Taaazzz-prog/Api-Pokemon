import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { pokemonGameService, type Pokemon } from '../services/pokemonGameService';
import { toast } from 'react-hot-toast';

interface BattlePageProps {
  className?: string;
}

interface BattleState {
  playerTeam: Pokemon[];
  enemyTeam: Pokemon[];
  currentPlayerPokemon: Pokemon | null;
  currentEnemyPokemon: Pokemon | null;
  battlePhase: 'preparation' | 'battle' | 'victory' | 'defeat';
  turn: 'player' | 'enemy';
  battleLog: string[];
  playerHp: number;
  enemyHp: number;
}

interface BattleAction {
  type: 'attack' | 'defend' | 'item' | 'switch';
  pokemon?: Pokemon;
  damage?: number;
}

const BattlePage: React.FC<BattlePageProps> = ({ className = '' }) => {
  // État du combat
  const [battleState, setBattleState] = useState<BattleState>({
    playerTeam: [],
    enemyTeam: [],
    currentPlayerPokemon: null,
    currentEnemyPokemon: null,
    battlePhase: 'preparation',
    turn: 'player',
    battleLog: [],
    playerHp: 100,
    enemyHp: 100
  });

  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Récupère les Pokemon disponibles pour former une équipe
  const { data: availablePokemon = [] } = useQuery({
    queryKey: ['battle-pokemon'],
    queryFn: async () => {
      const allPokemon = await pokemonGameService.getAllPokemon();
      return allPokemon.slice(0, 6); // Équipe de 6 Pokemon max
    }
  });

  // Simulation d'un combat
  const battleMutation = useMutation({
    mutationFn: async (action: BattleAction) => {
      // Simulation de l'action de combat
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let damage = 0;
      let logMessage = '';
      
      switch (action.type) {
        case 'attack':
          damage = Math.floor(Math.random() * 30) + 10;
          logMessage = `${battleState.currentPlayerPokemon?.name} attaque et inflige ${damage} dégâts !`;
          break;
        case 'defend':
          damage = Math.floor(Math.random() * 10) + 5;
          logMessage = `${battleState.currentPlayerPokemon?.name} se défend et réduit les dégâts de ${damage} points !`;
          break;
        default:
          logMessage = 'Action inconnue';
      }
      
      return { damage, logMessage, action };
    },
    onSuccess: (result) => {
      handleBattleResult(result);
    },
    onError: () => {
      toast.error('Erreur pendant le combat');
    }
  });

  // Initialisation de l'équipe du joueur
  useEffect(() => {
    if (availablePokemon.length > 0 && battleState.playerTeam.length === 0) {
      const playerTeam = availablePokemon.slice(0, 3);
      const enemyTeam = availablePokemon.slice(3, 6);
      
      setBattleState(prev => ({
        ...prev,
        playerTeam,
        enemyTeam,
        currentPlayerPokemon: playerTeam[0],
        currentEnemyPokemon: enemyTeam[0],
        battlePhase: 'battle'
      }));
    }
  }, [availablePokemon, battleState.playerTeam.length]);

  // Gérer le résultat d'une action de combat
  const handleBattleResult = (result: { damage: number; logMessage: string; action: BattleAction }) => {
    setBattleState(prev => {
      const newState = { ...prev };
      
      // Mettre à jour les logs
      newState.battleLog = [...prev.battleLog.slice(-4), result.logMessage];
      
      // Appliquer les dégâts selon l'action
      if (result.action.type === 'attack') {
        newState.enemyHp = Math.max(0, prev.enemyHp - result.damage);
      } else if (result.action.type === 'defend') {
        // La défense réduit les dégâts du prochain tour ennemi
      }
      
      // Vérifier les conditions de victoire
      if (newState.enemyHp <= 0) {
        newState.battlePhase = 'victory';
        newState.battleLog.push('🎉 Victoire ! Vous avez gagné le combat !');
        toast.success('Victoire !');
      } else {
        // Tour de l'ennemi (simulation)
        const enemyDamage = Math.floor(Math.random() * 25) + 5;
        newState.playerHp = Math.max(0, prev.playerHp - enemyDamage);
        newState.battleLog.push(`${prev.currentEnemyPokemon?.name} attaque et inflige ${enemyDamage} dégâts !`);
        
        if (newState.playerHp <= 0) {
          newState.battlePhase = 'defeat';
          newState.battleLog.push('💀 Défaite ! Vous avez perdu le combat...');
          toast.error('Défaite...');
        }
      }
      
      return newState;
    });
    
    setSelectedAction(null);
  };

  // Exécuter une action de combat
  const executeAction = (actionType: string) => {
    if (battleState.battlePhase !== 'battle' || battleMutation.isPending) return;
    
    setSelectedAction(actionType);
    setIsAnimating(true);
    
    setTimeout(() => setIsAnimating(false), 1000);
    
    const action: BattleAction = {
      type: actionType as 'attack' | 'defend' | 'item' | 'switch'
    };
    
    battleMutation.mutate(action);
  };

  // Redémarrer le combat
  const restartBattle = () => {
    if (availablePokemon.length > 0) {
      const playerTeam = availablePokemon.slice(0, 3);
      const enemyTeam = availablePokemon.slice(3, 6);
      
      setBattleState({
        playerTeam,
        enemyTeam,
        currentPlayerPokemon: playerTeam[0],
        currentEnemyPokemon: enemyTeam[0],
        battlePhase: 'battle',
        turn: 'player',
        battleLog: ['Le combat commence !'],
        playerHp: 100,
        enemyHp: 100
      });
    }
  };

  if (!battleState.currentPlayerPokemon || !battleState.currentEnemyPokemon) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6 ${className}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Préparation du combat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚔️ Combat Pokemon</h1>
          <p className="text-gray-600">Affrontez vos adversaires dans des combats tactiques</p>
        </div>

        {/* Terrain de Combat */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Pokemon Joueur */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">Votre Pokemon</h3>
              <div className={`relative ${isAnimating && selectedAction === 'attack' ? 'animate-bounce' : ''}`}>
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <img
                    src={battleState.currentPlayerPokemon.image}
                    alt={battleState.currentPlayerPokemon.name}
                    className="w-32 h-32 object-contain mx-auto mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/128/128';
                    }}
                  />
                  <h4 className="font-bold text-lg text-gray-800">{battleState.currentPlayerPokemon.name}</h4>
                  <div className="flex justify-center gap-1 mt-2">
                    {battleState.currentPlayerPokemon.types.map(type => (
                      <span
                        key={type.id}
                        className="px-2 py-1 rounded text-xs text-white"
                        style={{ backgroundColor: type.color }}
                      >
                        {type.frenchName}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Barre de vie du joueur */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">PV</span>
                    <span className="text-sm font-medium text-gray-600">{battleState.playerHp}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        battleState.playerHp > 60 ? 'bg-green-500' :
                        battleState.playerHp > 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${battleState.playerHp}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone de Combat Central */}
            <div className="flex flex-col justify-center items-center">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">VS</h3>
                <div className="text-6xl animate-pulse">⚡</div>
              </div>
              
              {/* Statut du Combat */}
              <div className="bg-gray-100 rounded-lg p-4 w-full">
                <div className="text-center">
                  {battleState.battlePhase === 'battle' && (
                    <p className="text-lg font-semibold text-gray-700">
                      {battleState.turn === 'player' ? 'Votre tour !' : 'Tour de l\'adversaire...'}
                    </p>
                  )}
                  {battleState.battlePhase === 'victory' && (
                    <p className="text-lg font-semibold text-green-600">🎉 Victoire !</p>
                  )}
                  {battleState.battlePhase === 'defeat' && (
                    <p className="text-lg font-semibold text-red-600">💀 Défaite...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pokemon Ennemi */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Pokemon Ennemi</h3>
              <div className={`relative ${isAnimating && selectedAction !== 'attack' ? 'animate-shake' : ''}`}>
                <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                  <img
                    src={battleState.currentEnemyPokemon.image}
                    alt={battleState.currentEnemyPokemon.name}
                    className="w-32 h-32 object-contain mx-auto mb-2 transform scale-x-[-1]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/128/128';
                    }}
                  />
                  <h4 className="font-bold text-lg text-gray-800">{battleState.currentEnemyPokemon.name}</h4>
                  <div className="flex justify-center gap-1 mt-2">
                    {battleState.currentEnemyPokemon.types.map(type => (
                      <span
                        key={type.id}
                        className="px-2 py-1 rounded text-xs text-white"
                        style={{ backgroundColor: type.color }}
                      >
                        {type.frenchName}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Barre de vie de l'ennemi */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">PV</span>
                    <span className="text-sm font-medium text-gray-600">{battleState.enemyHp}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        battleState.enemyHp > 60 ? 'bg-green-500' :
                        battleState.enemyHp > 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${battleState.enemyHp}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions de Combat */}
        {battleState.battlePhase === 'battle' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Actions de Combat</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => executeAction('attack')}
                disabled={battleMutation.isPending}
                className="p-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex flex-col items-center"
              >
                <span className="text-2xl mb-2">⚔️</span>
                <span>Attaquer</span>
              </button>
              
              <button
                onClick={() => executeAction('defend')}
                disabled={battleMutation.isPending}
                className="p-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex flex-col items-center"
              >
                <span className="text-2xl mb-2">🛡️</span>
                <span>Défendre</span>
              </button>
              
              <button
                disabled={true}
                className="p-4 bg-gray-400 text-white font-medium rounded-lg flex flex-col items-center cursor-not-allowed"
              >
                <span className="text-2xl mb-2">🎒</span>
                <span>Objets</span>
                <span className="text-xs">(Bientôt)</span>
              </button>
              
              <button
                disabled={true}
                className="p-4 bg-gray-400 text-white font-medium rounded-lg flex flex-col items-center cursor-not-allowed"
              >
                <span className="text-2xl mb-2">🔄</span>
                <span>Changer</span>
                <span className="text-xs">(Bientôt)</span>
              </button>
            </div>
          </div>
        )}

        {/* Journal de Combat */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Journal de Combat</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
            {battleState.battleLog.length === 0 ? (
              <p className="text-gray-500 text-center">Le combat va commencer...</p>
            ) : (
              <div className="space-y-2">
                {battleState.battleLog.map((message, index) => (
                  <p key={index} className="text-sm text-gray-700">
                    {message}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions de Fin de Combat */}
        {(battleState.battlePhase === 'victory' || battleState.battlePhase === 'defeat') && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mb-6">
                {battleState.battlePhase === 'victory' ? (
                  <div>
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Félicitations !</h3>
                    <p className="text-gray-600">Vous avez remporté ce combat !</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-6xl mb-4">😔</div>
                    <h3 className="text-2xl font-bold text-red-600 mb-2">Défaite</h3>
                    <p className="text-gray-600">Ne vous découragez pas, réessayez !</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={restartBattle}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  🔄 Nouveau Combat
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  🏠 Retour au Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattlePage;