import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useSurvivalStatus, useSurvivalHistory } from '../hooks/useGameServices';
import { apiClient } from '../services/apiClient';

const SurvivalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: status } = useSurvivalStatus();
  const { data: history } = useSurvivalHistory();
  const [wave, setWave] = useState(1);

  const startMutation = useMutation({
    mutationFn: () => apiClient.startSurvivalRun([]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survival', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['survival', 'history'] });
    },
  });

  const progressMutation = useMutation({
    mutationFn: () => {
      if (!status?.data?.id) {
        throw new Error('Aucune run active');
      }
      return apiClient.updateSurvivalRun(status.data.id, { wave, rewards: [] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survival', 'status'] });
    },
  });

  const finishMutation = useMutation({
    mutationFn: () => {
      if (!status?.data?.id) {
        throw new Error('Aucune run active');
      }
      return apiClient.finishSurvivalRun(status.data.id, { waves: wave, score: wave * 100, rewards: [] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survival', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['survival', 'history'] });
    },
  });

  const activeRun = status?.data ?? null;

  return (
    <div className="space-y-6 p-6">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Mode Survie</h1>
        <p className="text-sm text-slate-600">
          Affrontez des vagues successives d’adversaires IA. Chaque vague augmente votre score et vos récompenses.
        </p>

        {!activeRun ? (
          <Button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
            {startMutation.isPending ? 'Démarrage…' : '🚀 Commencer une run'}
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Run active depuis {new Date(activeRun.startedAt).toLocaleString('fr-FR')}</p>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600" htmlFor="wave">Vague atteinte</label>
              <input
                id="wave"
                type="number"
                min={activeRun.currentWave}
                value={wave}
                onChange={(event) => setWave(Number(event.target.value))}
                className="w-24 border border-slate-200 rounded px-2 py-1"
              />
              <Button onClick={() => progressMutation.mutate()} disabled={progressMutation.isPending} variant="secondary">
                {progressMutation.isPending ? 'Mise à jour…' : '📈 Mettre à jour'}
              </Button>
              <Button onClick={() => finishMutation.mutate()} disabled={finishMutation.isPending} variant="destructive">
                {finishMutation.isPending ? 'Finalisation…' : '🏁 Terminer la run'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Historique</h2>
        {history?.data?.length ? (
          <ul className="space-y-2 text-sm text-slate-600">
            {history.data.map((run: any) => (
              <li key={run.id} className="flex justify-between border-b border-slate-100 pb-1">
                <span>{new Date(run.startedAt).toLocaleDateString('fr-FR')}</span>
                <span>{run.status === 'COMPLETED' ? `Vagues : ${run.maxWave}` : 'En cours'}</span>
                <span>{run.score} pts</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Aucune run enregistrée.</p>
        )}
      </Card>
    </div>
  );
};

export default SurvivalPage;
