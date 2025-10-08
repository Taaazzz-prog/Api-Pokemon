import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FeaturePlaceholder from '../components/FeaturePlaceholder';
import { useArenaStats, useArenaRankings, useArenaHistory } from '../hooks/useGameServices';
import { apiClient } from '../services/apiClient';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ArenaPageNew: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: stats } = useArenaStats();
  const { data: rankings } = useArenaRankings(10);
  const { data: history } = useArenaHistory();

  const queueMutation = useMutation({
    mutationFn: () => apiClient.joinArenaQueue(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arena', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['arena', 'history'] });
    },
  });

  return (
    <div className="space-y-6 p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-slate-800">Arène</h1>
        <p className="text-sm text-slate-600">
          Lancez un duel rapide contre un adversaire IA. Les résultats mettent à jour vos statistiques et le classement global.
        </p>
        <Button
          className="mt-4"
          onClick={() => queueMutation.mutate()}
          disabled={queueMutation.isPending}
        >
          {queueMutation.isPending ? 'Match en cours…' : '⚔️ Lancer un combat rapide'}
        </Button>
        {queueMutation.isSuccess && (
          <p className="mt-3 text-sm text-emerald-600">Combat enregistré ! consultez l’historique ci-dessous.</p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Mes statistiques</h2>
          {stats ? (
            <ul className="space-y-2 text-sm text-slate-600">
              <li><strong>Victoires :</strong> {stats.wins}</li>
              <li><strong>Défaites :</strong> {stats.losses}</li>
              <li><strong>Taux de victoire :</strong> {stats.winRate}%</li>
              <li><strong>Crédits cumulés :</strong> {stats.rewardCredits}</li>
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Aucune donnée pour le moment.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Classement</h2>
          {rankings?.data?.rankings?.length ? (
            <ul className="space-y-2 text-sm text-slate-600">
              {rankings.data.rankings.map((entry: any) => (
                <li key={entry.userId} className="flex justify-between border-b border-slate-100 pb-1">
                  <span>#{entry.rank} {entry.username}</span>
                  <span>{entry.wins}V / {entry.losses}D</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Classement non disponible.</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Historique récent</h2>
        {history?.data?.length ? (
          <ul className="space-y-2 text-sm text-slate-600">
            {history.data.map((match: any) => (
              <li key={match.id} className="flex justify-between border-b border-slate-100 pb-1">
                <span>{new Date(match.createdAt).toLocaleString('fr-FR')}</span>
                <span>{match.result === 'WIN' ? 'Victoire' : match.result === 'LOSS' ? 'Défaite' : 'Égalité'} contre {match.opponentName}</span>
                <span>+{match.rewardCredits} crédits</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Aucun combat enregistré pour le moment.</p>
        )}
      </Card>

      <FeaturePlaceholder
        title="Classements temps réel à venir"
        description="Lorsque le matchmaking multijoueur sera disponible, cette page permettra de rejoindre des files en direct."
      />
    </div>
  );
};

export default ArenaPageNew;
