import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import { useRoster, useArenaStats } from '../hooks/useGameServices';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import starterPackService from '../services/starterPackService';

const DashboardPageNew: React.FC = () => {
  const { user, refreshUser } = useUser();
  const { data: roster, isLoading } = useRoster();
  const { data: arenaStats } = useArenaStats();
  const [needsStarterPack, setNeedsStarterPack] = useState(false);
  const [applyingStarterPack, setApplyingStarterPack] = useState(false);

  useEffect(() => {
    const checkStarterPack = async () => {
      if (!user) return;
      try {
        const status = await starterPackService.getStatus();
        setNeedsStarterPack(status?.hasReceived === false);
      } catch (error) {
        console.error('Starter pack status failed', error);
      }
    };

    checkStarterPack();
  }, [user]);

  const handleApplyStarterPack = async () => {
    try {
      setApplyingStarterPack(true);
      await starterPackService.apply();
      await refreshUser();
      toast.success('🎁 Pack de démarrage appliqué avec succès');
      setNeedsStarterPack(false);
    } catch (error: any) {
      toast.error(error?.message || 'Impossible d\'appliquer le pack de démarrage');
    } finally {
      setApplyingStarterPack(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  const pokemonSample = (roster ?? []).slice(0, 6);
  const totalBattles = arenaStats?.wins && arenaStats?.losses != null ? (arenaStats.wins + arenaStats.losses) : user.stats?.totalBattles ?? 0;
  const totalWins = arenaStats?.wins ?? user.stats?.totalWins ?? 0;
  const winRate = totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Bonjour {user.username} 👋</h1>
        <p className="text-indigo-100">
          Votre hub dresseur rassemble l'état réel de votre progression. Les fonctionnalités avancées seront déverrouillées au fur et à mesure de l'implémentation API.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/roster"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 font-semibold rounded-lg shadow hover:bg-indigo-50"
          >
            📦 Gérer mon roster
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg shadow hover:bg-indigo-400"
          >
            🛒 Ouvrir la boutique
          </Link>
        </div>
      </div>

      {needsStarterPack && (
        <Card className="p-6 border-blue-200 bg-blue-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-blue-800">Pack de démarrage disponible</h2>
              <p className="text-sm text-blue-600">
                Recevez automatiquement les ressources initiales prévues (PokéCredits, PokéGems et starters). Cliquez sur le bouton pour lancer l'opération via l'API.
              </p>
            </div>
            <Button
              onClick={handleApplyStarterPack}
              disabled={applyingStarterPack}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {applyingStarterPack ? 'Application…' : '🎁 Accepter le pack'}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">PokéCredits</h2>
          <p className="text-3xl font-bold text-yellow-600">{user.pokeCredits.toLocaleString()}</p>
          <p className="text-sm text-slate-500 mt-2">Gagnez-en via les missions quotidiennes ou la boutique.</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">PokéGems</h2>
          <p className="text-3xl font-bold text-purple-600">{user.pokeGems}</p>
          <p className="text-sm text-slate-500 mt-2">Devise premium, attribuée par les événements spéciaux.</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Statistiques</h2>
          <p className="text-2xl font-bold text-slate-900">{totalWins} victoires</p>
          <p className="text-sm text-slate-500 mt-2">{totalBattles} combats enregistrés • {winRate}% de winrate</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Derniers Pokémon acquis</h2>
            <p className="text-sm text-slate-500">Les six entrées les plus récentes de votre roster réel.</p>
          </div>
          <Link to="/roster" className="text-indigo-600 hover:underline text-sm font-medium">
            Voir tout
          </Link>
        </div>

        {isLoading ? (
          <div className="py-10">
            <LoadingSpinner />
          </div>
        ) : pokemonSample.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            Aucun Pokémon dans votre roster pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pokemonSample.map((pokemon: any) => (
              <Card key={pokemon.id} className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <img
                    src={pokemon.sprite || '/images/pokemon/unknown.png'}
                    alt={pokemon.name}
                    className="w-14 h-14 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/pokemon/unknown.png';
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{pokemon.name}</p>
                  <p className="text-sm text-slate-500">Niveau {pokemon.level}</p>
                  {pokemon.nickname && (
                    <p className="text-xs text-indigo-600">Surnom : {pokemon.nickname}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">Feuille de route</h2>
        <p className="text-sm text-slate-600 mb-4">
          Les modules Arène, Tournois et Survie seront activés une fois les endpoints dédiés finalisés (cf. <code>workflow.md</code>). Les pages correspondantes affichent actuellement un message d'attente pour éviter toute donnée simulée.
        </p>
        <Button asChild variant="secondary">
          <a href="/workflow.md" target="_blank" rel="noreferrer">
            Consulter le workflow détaillé
          </a>
        </Button>
      </Card>
    </div>
  );
};

export default DashboardPageNew;
