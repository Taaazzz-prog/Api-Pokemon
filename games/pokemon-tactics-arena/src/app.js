import { fetchBalancedTeam, fetchRandomTeam, fetchEvolutionReadyTeam, takeFirstThree } from './api/pokebuild.js';
import { simulateBattle } from './battle/battle-engine.js';
import { gatherEvolutionCandidates, applyEvolution } from './battle/evolution-manager.js';
import { loadProgress, recordBattle, resetProgress, recordEvolution, grantBonusXP } from './state/progression.js';
import { renderTeam, renderBattleResult, renderLog, resetLog, renderProgress } from './ui/renderers.js';
import { showBattleModal, initBattleModal } from './ui/battle-modal.js';
import { renderEvolutionPanel } from './ui/evolution-panel.js';
import { showToast } from './ui/notifications.js';

const playerContainer = document.getElementById('player-team');
const opponentContainer = document.getElementById('opponent-team');
const progressPanel = document.getElementById('progress-panel');
const evolutionListEl = document.getElementById('evolution-list');
const modePanel = document.getElementById('mode-panel');
const survivalStatusEl = modePanel?.querySelector('[data-mode-status="survival"]');
const tournamentStatusEl = modePanel?.querySelector('[data-mode-status="tournament"]');
const survivalProgressEl = document.getElementById('survival-progress');
const tournamentProgressEl = document.getElementById('tournament-progress');
const survivalStartBtn = document.getElementById('start-survival');
const survivalQuitBtn = document.getElementById('quit-survival');
const tournamentStartBtn = document.getElementById('start-tournament');
const tournamentQuitBtn = document.getElementById('quit-tournament');
const refreshPlayerBtn = document.getElementById('refresh-player');
const recruitEvolutionBtn = document.getElementById('recruit-evolution');
const refreshOpponentBtn = document.getElementById('refresh-opponent');
const startBattleBtn = document.getElementById('start-battle');
const resetLogBtn = document.getElementById('reset-log');
const resetProgressBtn = document.getElementById('reset-progress');
const battleResultEl = document.getElementById('battle-result');
const battleLogEl = document.getElementById('battle-log');

let playerTeam = [];
let opponentTeam = [];
let pendingEvolutions = [];
let progressState = loadProgress();
let currentMode = 'free';
let survivalState = null;
let tournamentState = null;

renderProgress(progressPanel, progressState);
renderModePanel();
renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());

function renderModePanel() {
  // Cette fonction peut être étendue pour gérer l'affichage des modes
  // Pour l'instant, on s'assure juste que les boutons sont synchronisés
  syncModeButtons();
}

function cloneTeam(team) {
  return team.map(pokemon => ({
    ...pokemon,
    stats: { ...pokemon.stats },
    types: [...pokemon.types],
    resistances: [...pokemon.resistances],
    evolutions: [...pokemon.evolutions]
  }));
}

function healTeam(team) {
  return team.map(pokemon => ({
    ...pokemon,
    currentHP: pokemon.maxHP ?? pokemon.stats?.HP ?? 0
  }));
}

async function init() {
  initBattleModal();
  await Promise.all([loadPlayerTeam(), loadOpponentTeam()]);
}

function toggleLoading(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  if (isLoading) {
    button.textContent = 'Chargement...';
    button.classList.add('loading');
  } else {
    button.classList.remove('loading');
    // Restaurer le texte original du bouton
    if (button.id === 'refresh-player') {
      button.textContent = 'Equipe equilibree';
    } else if (button.id === 'recruit-evolution') {
      button.textContent = 'Equipe evolutive';
    } else if (button.id === 'refresh-opponent') {
      button.textContent = 'Nouvelle equipe aleatoire';
    }
  }
}

function syncModeButtons() {
  if (survivalStartBtn) {
    const unlocked = !!progressState.unlockedModes?.survival;
    survivalStartBtn.disabled = !unlocked || currentMode !== 'free';
    survivalStartBtn.title = unlocked ? '' : 'Atteignez le niveau 12 pour débloquer le mode Survie';
    if (survivalStatusEl) {
      survivalStatusEl.textContent = unlocked ? 'Disponible' : 'Verrouillé';
    }
  }
  if (tournamentStartBtn) {
    const unlocked = !!progressState.unlockedModes?.tournament;
    tournamentStartBtn.disabled = !unlocked || currentMode !== 'free';
    tournamentStartBtn.title = unlocked ? '' : 'Atteignez le niveau 20 pour débloquer le mode Tournoi';
    if (tournamentStatusEl) {
      tournamentStatusEl.textContent = unlocked ? 'Disponible' : 'Verrouillé';
    }
  }
}

function prepareTeam(team) {
  return takeFirstThree(team).map(pokemon => ({
    ...pokemon,
    currentHP: pokemon.stats?.HP ?? 0,
    maxHP: pokemon.stats?.HP ?? 0,
  }));
}

async function loadPlayerTeam() {
  toggleLoading(refreshPlayerBtn, true);
  try {
    const team = await fetchBalancedTeam();
    playerTeam = prepareTeam(team);
    pendingEvolutions = await gatherEvolutionCandidates(playerTeam, progressState);
    renderTeam(playerContainer, playerTeam);
    renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
  } catch (error) {
    console.error(error);
    battleResultEl.textContent = `Erreur lors du chargement de votre equipe : ${error.message}`;
    battleResultEl.classList.remove('is-player', 'is-opponent');
  } finally {
    toggleLoading(refreshPlayerBtn, false);
  }
}

async function loadEvolutionTeam() {
  toggleLoading(recruitEvolutionBtn, true);
  try {
    const team = await fetchEvolutionReadyTeam(progressState.unlockedGenerations);
    if (!team.length) {
      showToast('Impossible de trouver une equipe evolutive, nouvelle equipe equilibree.', 'warning');
      await loadPlayerTeam();
      return;
    }
    playerTeam = prepareTeam(team);
    pendingEvolutions = await gatherEvolutionCandidates(playerTeam, progressState);
    renderTeam(playerContainer, playerTeam);
    renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
    showToast('Equipe evolutive recrutee.', 'info');
  } catch (error) {
    console.error(error);
    showToast(`Erreur lors du recrutement : ${error.message}`, 'error');
  } finally {
    toggleLoading(recruitEvolutionBtn, false);
  }
}

async function loadOpponentTeam() {
  toggleLoading(refreshOpponentBtn, true);
  try {
    const team = await fetchRandomTeam();
    opponentTeam = prepareTeam(team);
    renderTeam(opponentContainer, opponentTeam);
  } catch (error) {
    console.error(error);
    battleResultEl.textContent = `Erreur lors du chargement de l equipe adverse : ${error.message}`;
    battleResultEl.classList.remove('is-player', 'is-opponent');
  } finally {
    toggleLoading(refreshOpponentBtn, false);
  }
}

async function ensurePlayerTeam() {
  if (!playerTeam.length) {
    await loadPlayerTeam();
  }
}

function createOpponentSignature(team) {
  return team.map(pokemon => pokemon.id ?? pokemon.name ?? '').sort().join('-');
}

function applyBattleResult(battle, context, label) {
  const prevXp = progressState.xp;
  const { state, events } = recordBattle(progressState, battle.outcome, battle.turns, context);
  progressState = state;
  renderProgress(progressPanel, progressState);
  syncModeButtons();
  events.forEach(evt => showToast(evt, 'info'));
  const xpEarned = progressState.xp - prevXp;
  if (xpEarned !== 0) {
    const outcomes = { player: label ?? 'Victoire', opponent: label ?? 'Defaite', draw: label ?? 'Match nul' };
    const variants = { player: 'success', opponent: 'error', draw: 'warning' };
    const key = battle.outcome ?? 'draw';
    showToast(`${outcomes[key]} : +${xpEarned} XP`, variants[key] ?? 'info');
  }
  return xpEarned;
}

async function startBattle() {
  if (!playerTeam.length || !opponentTeam.length) {
    battleResultEl.textContent = 'Chargez les deux equipes avant de lancer le combat.';
    battleResultEl.classList.remove('is-player', 'is-opponent');
    return;
  }

  startBattleBtn.disabled = true;
  battleResultEl.classList.remove('is-player', 'is-opponent');

  const opponentSignature = createOpponentSignature(opponentTeam);
  const initialPlayer = cloneTeam(playerTeam);
  const initialOpponent = cloneTeam(opponentTeam);
  const battle = simulateBattle(cloneTeam(playerTeam), cloneTeam(opponentTeam));

  await showBattleModal({
    title: 'Match libre',
    playerInitial: initialPlayer,
    opponentInitial: initialOpponent,
    playerFinal: battle.player,
    opponentFinal: battle.opponent,
    log: battle.log,
    outcome: battle.outcome,
  });

  resetLog(battleLogEl);
  renderLog(battleLogEl, battle.log);
  renderBattleResult(battleResultEl, battle.outcome, battle.turns);

  applyBattleResult(battle, { opponentSignature });

  playerTeam = healTeam(battle.player);
  opponentTeam = healTeam(battle.opponent);

  if (battle.outcome === 'player') {
    await handlePostVictoryEvolutions();
  } else {
    pendingEvolutions = [];
    renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
  }

  renderTeam(playerContainer, playerTeam);
  renderTeam(opponentContainer, opponentTeam);

  startBattleBtn.disabled = false;
  setTimeout(() => {
    loadOpponentTeam().catch(error => {
      console.error(error);
      showToast(`Erreur lors du rechargement de l equipe adverse : ${error.message}`, 'error');
    });
  }, 800);
}

async function handlePostVictoryEvolutions() {
  pendingEvolutions = await gatherEvolutionCandidates(playerTeam, progressState);
  if (pendingEvolutions.length === 0) {
    renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
    return;
  }
  showToast(`${pendingEvolutions.length} evolution(s) disponibles !`, 'warning');
  renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
}

async function startSurvivalMode() {
  if (!progressState.unlockedModes?.survival) {
    showToast('Mode Survie non debloque.', 'warning');
    return;
  }
  await ensurePlayerTeam();
  survivalStartBtn.disabled = true;
  tournamentStartBtn.disabled = true;
  startBattleBtn.disabled = true;
  resetBattleView();
  showToast('Mode Survie : affrontez 3 vagues successives !', 'info');

  let wave = 1;
  const totalWaves = 3;
  let survivorTeam = cloneTeam(playerTeam);
  let survived = true;

  while (wave <= totalWaves) {
    const opponent = prepareTeam(await fetchRandomTeam());
    const signature = createOpponentSignature(opponent);
    const initialPlayer = cloneTeam(survivorTeam);
    const initialOpponent = cloneTeam(opponent);
    const battle = simulateBattle(cloneTeam(survivorTeam), cloneTeam(opponent));

    await showBattleModal({
      title: `Survie – Vague ${wave}`,
      playerInitial: initialPlayer,
      opponentInitial: initialOpponent,
      playerFinal: battle.player,
      opponentFinal: battle.opponent,
      log: battle.log,
      outcome: battle.outcome,
    });

    renderLog(battleLogEl, [`--- Vague ${wave} ---`]);
    renderLog(battleLogEl, battle.log);
    renderBattleResult(battleResultEl, battle.outcome, battle.turns);
    applyBattleResult(battle, { opponentSignature: signature, mode: 'survival' }, `Survie vague ${wave}`);

    if (battle.outcome !== 'player') {
      showToast(`Mode Survie : echec à la vague ${wave}.`, 'error');
      survived = false;
      break;
    }

    survivorTeam = healTeam(battle.player);
    pendingEvolutions = await gatherEvolutionCandidates(survivorTeam, progressState);
    renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
    wave += 1;
  }

  playerTeam = survivorTeam;
  renderTeam(playerContainer, playerTeam);
  await loadOpponentTeam();

  if (survived) {
    const bonus = grantBonusXP(progressState, 150, 'Bonus Survie !');
    progressState = bonus.state;
    renderProgress(progressPanel, progressState);
    syncModeButtons();
    bonus.events.forEach(evt => showToast(evt, 'success'));
    showToast('Mode Survie : toutes les vagues vaincues !', 'success');
  }

  startBattleBtn.disabled = false;
  syncModeButtons();
}

async function startTournamentMode() {
  if (!progressState.unlockedModes?.tournament) {
    showToast('Mode Tournoi non debloque.', 'warning');
    return;
  }
  await ensurePlayerTeam();
  tournamentStartBtn.disabled = true;
  survivalStartBtn.disabled = true;
  startBattleBtn.disabled = true;
  resetBattleView();
  showToast('Tournoi : trois manches a remporter !', 'info');

  const stages = [
    { label: 'Quart de finale', fetcher: fetchRandomTeam },
    { label: 'Demi-finale', fetcher: fetchBalancedTeam },
    { label: 'Finale', fetcher: () => fetchEvolutionReadyTeam(progressState.unlockedGenerations) },
  ];

  let champion = true;
  let teamInTournament = cloneTeam(playerTeam);

  for (const stage of stages) {
    const opponent = prepareTeam(await stage.fetcher());
    const signature = createOpponentSignature(opponent);
    const initialPlayer = cloneTeam(teamInTournament);
    const initialOpponent = cloneTeam(opponent);
    const battle = simulateBattle(cloneTeam(teamInTournament), cloneTeam(opponent));

    await showBattleModal({
      title: stage.label,
      playerInitial: initialPlayer,
      opponentInitial: initialOpponent,
      playerFinal: battle.player,
      opponentFinal: battle.opponent,
      log: battle.log,
      outcome: battle.outcome,
    });

    renderLog(battleLogEl, [`=== ${stage.label} ===`]);
    renderLog(battleLogEl, battle.log);
    renderBattleResult(battleResultEl, battle.outcome, battle.turns);
    applyBattleResult(battle, { opponentSignature: signature, mode: 'tournament' }, stage.label);

    if (battle.outcome !== 'player') {
      showToast(`${stage.label} perdue.`, 'error');
      champion = false;
      break;
    }

    teamInTournament = healTeam(battle.player);
    pendingEvolutions = await gatherEvolutionCandidates(teamInTournament, progressState);
    renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
  }

  playerTeam = teamInTournament;
  renderTeam(playerContainer, playerTeam);
  await loadOpponentTeam();

  if (champion) {
    const bonus = grantBonusXP(progressState, 250, 'Bonus Tournoi !');
    progressState = bonus.state;
    renderProgress(progressPanel, progressState);
    syncModeButtons();
    bonus.events.forEach(evt => showToast(evt, 'success'));
    showToast('🏆 Tournoi remporte !', 'success');
  }

  startBattleBtn.disabled = false;
  syncModeButtons();
}

function handleResetProgress() {
  progressState = resetProgress();
  renderProgress(progressPanel, progressState);
  syncModeButtons();
  pendingEvolutions = [];
  renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
  resetBattleView();
  showToast('Progression reinitialisee.', 'warning');
}

function resetBattleView() {
  resetLog(battleLogEl);
  battleResultEl.textContent = '';
  battleResultEl.classList.remove('is-player', 'is-opponent');
  renderTeam(playerContainer, playerTeam);
  renderTeam(opponentContainer, opponentTeam);
}

function buildEvolutionHandlers() {
  return {
    onAccept: handleEvolutionAccept,
    onSkip: handleEvolutionSkip,
    onEmpty: () => {},
  };
}

function handleEvolutionAccept(candidate) {
  const evolutionResult = applyEvolution(playerTeam, candidate);
  if (!evolutionResult) {
    return;
  }
  const { state, events } = recordEvolution(progressState, evolutionResult);
  progressState = state;
  renderProgress(progressPanel, progressState);
  syncModeButtons();
  events.forEach(evt => showToast(evt, 'info'));
  showToast(evolutionResult.message, 'success');

  pendingEvolutions = pendingEvolutions.filter(item => item.key !== candidate.key);
  renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
  renderTeam(playerContainer, playerTeam);
}

function handleEvolutionSkip(candidate) {
  pendingEvolutions = pendingEvolutions.filter(item => item.key !== candidate.key);
  renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
  showToast(`${candidate.previousName} reste en ${candidate.previousName}.`, 'info');
}

async function initiateBattle() {
  if (!playerTeam.length || !opponentTeam.length) {
    showToast('Equipes non chargées', 'warning');
    return;
  }

  startBattleBtn.disabled = true;
  try {
    const signature = createOpponentSignature(opponentTeam);
    const initialPlayer = cloneTeam(playerTeam);
    const initialOpponent = cloneTeam(opponentTeam);
    const battle = simulateBattle(cloneTeam(playerTeam), cloneTeam(opponentTeam));

    await showBattleModal({
      title: 'Combat',
      playerInitial: initialPlayer,
      opponentInitial: initialOpponent,
      playerFinal: battle.player,
      opponentFinal: battle.opponent,
      log: battle.log,
      outcome: battle.outcome,
    });

    renderLog(battleLogEl, battle.log);
    renderBattleResult(battleResultEl, battle.outcome, battle.turns);
    applyBattleResult(battle, { opponentSignature: signature, mode: 'free' });

    playerTeam = healTeam(battle.player);
    pendingEvolutions = await gatherEvolutionCandidates(playerTeam, progressState);
    renderTeam(playerContainer, playerTeam);
    renderEvolutionPanel(evolutionListEl, pendingEvolutions, buildEvolutionHandlers());
  } finally {
    startBattleBtn.disabled = false;
  }
}

if (refreshPlayerBtn) refreshPlayerBtn.addEventListener('click', loadPlayerTeam);
if (recruitEvolutionBtn) recruitEvolutionBtn.addEventListener('click', loadEvolutionTeam);
if (refreshOpponentBtn) refreshOpponentBtn.addEventListener('click', loadOpponentTeam);
if (startBattleBtn) {
  startBattleBtn.addEventListener('click', () => {
    initiateBattle().catch(error => {
      console.error(error);
      battleResultEl.textContent = `Erreur pendant le combat : ${error.message}`;
      battleResultEl.classList.remove('is-player', 'is-opponent');
      startBattleBtn.disabled = false;
    });
  });
}
if (survivalStartBtn) {
  survivalStartBtn.addEventListener('click', () => {
    startSurvivalMode().finally(() => {
      if (startBattleBtn) startBattleBtn.disabled = false;
      syncModeButtons();
    });
  });
}
if (tournamentStartBtn) {
  tournamentStartBtn.addEventListener('click', () => {
    startTournamentMode().finally(() => {
      if (startBattleBtn) startBattleBtn.disabled = false;
      syncModeButtons();
    });
  });
}
if (resetLogBtn) resetLogBtn.addEventListener('click', resetBattleView);
if (resetProgressBtn) resetProgressBtn.addEventListener('click', handleResetProgress);

// Ajouter un bouton pour corriger les paliers manqués
function addRecalculateButton() {
  const recalculateBtn = document.createElement('button');
  recalculateBtn.textContent = 'Corriger paliers';
  recalculateBtn.className = 'btn btn-secondary';
  recalculateBtn.title = 'Recalcule et corrige les déblocages manqués';
  recalculateBtn.style.marginLeft = '10px';
  
  if (resetProgressBtn && resetProgressBtn.parentNode) {
    resetProgressBtn.parentNode.insertBefore(recalculateBtn, resetProgressBtn.nextSibling);
  }

  recalculateBtn.addEventListener('click', () => {
    import('./state/progression.js').then(module => {
      const currentLevel = progressState.level;
      const beforeGenerations = [...(progressState.unlockedGenerations || [])];
      const beforeModes = {...(progressState.unlockedModes || {})};
      
      // Forcer le recalcul
      progressState = module.loadProgress();
      
      const afterGenerations = [...(progressState.unlockedGenerations || [])];
      const afterModes = {...(progressState.unlockedModes || {})};
      
      // Vérifier les changements
      const genChanged = JSON.stringify(beforeGenerations) !== JSON.stringify(afterGenerations);
      const modeChanged = JSON.stringify(beforeModes) !== JSON.stringify(afterModes);
      
      if (genChanged || modeChanged) {
        renderProgress(progressPanel, progressState);
        syncModeButtons();
        
        let message = 'Correction appliquée !';
        if (genChanged) {
          message += ` Générations: ${afterGenerations.map(g => `Gen ${g}`).join(', ')}`;
        }
        if (modeChanged) {
          const modes = [];
          if (afterModes.survival) modes.push('Survie');
          if (afterModes.tournament) modes.push('Tournoi');
          message += ` Modes: ${modes.length ? modes.join(', ') : 'Aucun'}`;
        }
        
        showToast(message, 'success');
      } else {
        showToast('Aucune correction nécessaire', 'info');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  addRecalculateButton();
});
