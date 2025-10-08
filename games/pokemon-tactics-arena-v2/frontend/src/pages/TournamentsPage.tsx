import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTournaments, useTournamentBracket } from '../hooks/useGameServices';
import { apiClient } from '../services/apiClient';

const TournamentsPage: React.FC = () => {
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [name, setName] = useState('Tournoi Express');
  const queryClient = useQueryClient();
  const { data: tournaments } = useTournaments();
  const { data: bracket } = useTournamentBracket(selectedTournament ?? '');

  const createMutation = useMutation({
    mutationFn: (payload: { name: string }) => apiClient.createTournament(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => apiClient.joinTournament(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => apiClient.startTournament(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      if (selectedTournament === id) {
        queryClient.invalidateQueries({ queryKey: ['tournaments', id, 'bracket'] });
      }
    },
  });

  return (
    <div className="space-y-6 p-6">
      <Card className="p-6 space-y-3">
        <h1 className="text-2xl font-bold text-slate-800">Tournois</h1>
        <p className="text-sm text-slate-600">
          Créez un tournoi ou rejoignez ceux existants. Les brackets sont générés automatiquement lorsque le tournoi est lancé.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="border border-slate-200 rounded px-3 py-2"
            placeholder="Nom du tournoi"
          />
          <Button onClick={() => createMutation.mutate({ name })} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Création…' : '➕ Créer un tournoi'}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Tournois disponibles</h2>
          {tournaments?.data?.length ? (
            <ul className="space-y-3">
              {tournaments.data.map((tournament: any) => (
                <li key={tournament.id} className="border border-slate-200 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{tournament.name}</p>
                      <p className="text-xs text-slate-500">Format : {tournament.format} • Participants : {tournament.participantsCount}</p>
                      <p className="text-xs text-slate-500">Statut : {tournament.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedTournament(tournament.id);
                          queryClient.invalidateQueries({ queryKey: ['tournaments', tournament.id, 'bracket'] });
                        }}
                      >
                        Voir bracket
                      </Button>
                      <Button
                        onClick={() => joinMutation.mutate(tournament.id)}
                        disabled={joinMutation.isPending}
                      >
                        Rejoindre
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => startMutation.mutate(tournament.id)}
                        disabled={startMutation.isPending}
                      >
                        Démarrer
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Aucun tournoi pour le moment.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Bracket</h2>
          {selectedTournament ? (
            bracket?.data ? (
              <div className="space-y-3 text-sm text-slate-600">
                {Object.entries(bracket.data as Record<string, any[]>).map(([round, matches]) => (
                  <div key={round} className="border border-slate-200 rounded p-3">
                    <p className="font-semibold text-slate-700">Round {round}</p>
                    <ul className="mt-2 space-y-2">
                      {matches.map((match: any) => (
                        <li key={match.id} className="flex justify-between">
                          <span>{match.player1Id ?? 'Bye'} vs {match.player2Id ?? 'Bye'}</span>
                          <span>{match.status === 'COMPLETED' ? `Gagnant : ${match.winnerId ?? 'Bye'}` : 'En attente'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucun bracket disponible pour le moment.</p>
            )
          ) : (
            <p className="text-sm text-slate-500">Sélectionnez un tournoi pour afficher son bracket.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TournamentsPage;
