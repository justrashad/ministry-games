import { langStore, t } from '../i18n/i18n';
import { useMemo, useState } from 'react';
import { MonitorPlay, Play, Settings as SettingsIcon } from 'lucide-react';
import type { TeamConfig } from '../types';
import { LIMITS } from '../engine/defaults';
import { createGame, summarizeSet } from '../engine/createGame';
import { navigate, openGameScreen } from '../lib/router';
import { sound } from '../lib/sound';
import { dispatchGame, getGameState } from '../sync/gameStore';
import { useLibrary } from '../state/libraryStore';
import { recentQuestionIds } from '../state/historyStore';
import { useRemoteStatus } from '../sync/remote';
import { useGameUnlocked } from '../commerce/licenseStore';
import { createDemoGame } from '../commerce/demo';
import { BuyButton } from '../components/BuyButton';
import { settingsStore, updateSettings, useSettings } from '../state/settingsStore';
import { Button } from '../components/ui/Button';
import { ColorPicker } from '../components/ui/ColorPicker';
import { useConfirm } from '../components/ui/Confirm';
import { useToast } from '../components/ui/Toast';
import { Segmented } from '../components/ui/Segmented';
import { Toggle } from '../components/ui/Toggle';

export function NewGameScreen() {
  const settings = useSettings();
  const { sets } = useLibrary();
  const confirm = useConfirm();
  const toast = useToast();
  // Untouched default names follow the chosen language ("Team 1" / "Equipo 1").
  const defaultName = (name: string, i: 0 | 1) => (name === `Team ${i + 1}` ? t(i === 0 ? 'Team 1' : 'Team 2') : name);
  const [teams, setTeams] = useState<[TeamConfig, TeamConfig]>(() => [
    { ...settings.teams[0], name: defaultName(settings.teams[0].name, 0) },
    { ...settings.teams[1], name: defaultName(settings.teams[1].name, 1) },
  ]);
  const [setId, setSetId] = useState(() => (sets.some((s) => s.id === settings.questions.activeSetId) ? settings.questions.activeSetId : sets[0]?.id) ?? '');
  const remote = useRemoteStatus();
  const unlocked = useGameUnlocked();
  const asRemote = remote.role === 'remote';
  const [openScreen, setOpenScreen] = useState(true);
  const set = sets.find((s) => s.id === setId);
  const summary = useMemo(() => (set ? summarizeSet(set) : null), [set]);
  const { rules } = settings;

  const updateTeam = (i: 0 | 1, patch: Partial<TeamConfig>) => setTeams((prev) => (i === 0 ? [{ ...prev[0], ...patch }, prev[1]] : [prev[0], { ...prev[1], ...patch }]));

  const start = async () => {
    if (!unlocked) {
      await startDemo();
      return;
    }
    if (!set) {
      toast.show(t('Choose a question set first.'), 'error');
      return;
    }
    const existing = getGameState();
    if (existing && existing.phase !== 'gameOver') {
      const ok = await confirm({ title: t('Replace the current game?'), message: t('The game in progress will end without being saved to history.'), confirmLabel: t('Start new game') });
      if (!ok) return;
    }
    const cleaned: [TeamConfig, TeamConfig] = [
      { ...teams[0], name: teams[0].name.trim() || t('Team 1') },
      { ...teams[1], name: teams[1].name.trim() || t('Team 2') },
    ];
    updateSettings('teams', cleaned);
    updateSettings('questions', { activeSetId: set.id });
    const result = createGame({ settings: settingsStore.get(), set, teams: cleaned, recentQuestionIds: recentQuestionIds(settingsStore.get().questions.avoidRecentGames) });
    if (!result.ok) {
      toast.show(result.error, 'error');
      return;
    }
    void sound.unlock();
    dispatchGame({ type: 'NEW_GAME', game: result.game });
    if (openScreen && !asRemote && !openGameScreen()) toast.show(t('Your browser blocked the game screen window. Use “Open game screen” on the host page.'), 'error');
    navigate('/host');
  };

  const startDemo = async () => {
    const existing = getGameState();
    if (existing && existing.phase !== 'gameOver') {
      const ok = await confirm({ title: t('Replace the current game?'), message: t('The game in progress will end.'), confirmLabel: t('Start the demo') });
      if (!ok) return;
    }
    const cleaned: [TeamConfig, TeamConfig] = [
      { ...teams[0], name: teams[0].name.trim() || t('Team 1') },
      { ...teams[1], name: teams[1].name.trim() || t('Team 2') },
    ];
    updateSettings('teams', cleaned);
    const result = createDemoGame(settingsStore.get(), cleaned, langStore.get());
    if (!result.ok) {
      toast.show(result.error, 'error');
      return;
    }
    void sound.unlock();
    dispatchGame({ type: 'NEW_GAME', game: result.game });
    if (openScreen && !asRemote && !openGameScreen()) toast.show(t('Your browser blocked the game screen window. Use “Open game screen” on the host page.'), 'error');
    navigate('/host');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6">
      <h1 className="text-3xl font-semibold">{unlocked ? t('New game') : t('Free demo')}</h1>
      <p className="mt-1 text-night-200">
        {unlocked ? t('Name your teams, choose the questions, and you’re ready.') : t('Play one full round with sample questions: reveals, strikes, steals and buzzers included.')}
      </p>
      {!unlocked && (
        <div className="panel mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-night-100">{t('The full game adds more rounds, the final round, the Final Challenge, the starter set and your own questions.')}</p>
          <BuyButton entitlement="game" size="md" />
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {([0, 1] as const).map((i) => (
          <section key={i} className="panel space-y-4" aria-labelledby={`team-${i}-title`}>
            <h2 id={`team-${i}-title`} className="panel-title !mb-0">
              {t('Team {n}', { n: i + 1 })}
            </h2>
            <div>
              <label htmlFor={`team-${i}-name`} className="field-label">
                {t('Team name')}
              </label>
              <input id={`team-${i}-name`} className="input" value={teams[i].name} maxLength={LIMITS.teamName} onChange={(e) => updateTeam(i, { name: e.target.value })} />
            </div>
            <ColorPicker label={t('Team color')} value={teams[i].color} onChange={(color) => updateTeam(i, { color })} disabledColor={teams[i === 0 ? 1 : 0].color} />
          </section>
        ))}
      </div>

      {unlocked && (<>
      <section className="panel mt-4 space-y-4" aria-labelledby="questions-title">
        <h2 id="questions-title" className="panel-title !mb-0">
          {t('Questions')}
        </h2>
        {sets.length === 0 ? (
          <div className="rounded-xl bg-night-950/40 p-4">
            <p className="text-night-100">{t("You don't have any question sets yet.")}</p>
            <Button className="mt-3" variant="gold" onClick={() => navigate('/questions')}>
              {t('Create or restore a question set')}
            </Button>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="set-select" className="field-label">
                {t('Question set')}
              </label>
              <select id="set-select" className="input" value={setId} onChange={(e) => setSetId(e.target.value)}>
                {sets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.questions.length})
                  </option>
                ))}
              </select>
              {summary && (
                <p className="field-help">
                  {t('{n} round questions, {f} final round, {c} Final Challenge.', { n: summary.regular, f: summary.final, c: summary.finalChallenge })}
                  {summary.regular < rules.rounds && ` ${t('This game has {n} rounds, so some questions may come from the final round pool or the game may end early.', { n: rules.rounds })}`}
                </p>
              )}
            </div>
            <Segmented
              label={t('Question order')}
              value={settings.questions.order}
              options={[
                { value: 'shuffle', label: t('Shuffle') },
                { value: 'inOrder', label: t('In order') },
              ]}
              onChange={(order) => updateSettings('questions', { order })}
            />
          </>
        )}
      </section>

      <section className="panel mt-4" aria-labelledby="rules-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="rules-title" className="panel-title !mb-0">
            {t('House rules')}
          </h2>
          <Button variant="subtle" size="sm" icon={SettingsIcon} onClick={() => navigate('/settings')}>
            {t('Change rules')}
          </Button>
        </div>
        <ul className="mt-2 grid gap-1 text-sm text-night-100 sm:grid-cols-2">
          <li>
            {t('{n} rounds at {list}', { n: rules.rounds, list: rules.multipliers.map((m) => `${m}×`).join(', ') })}
          </li>
          <li>{rules.finalRound.enabled ? t('Final round at {n}×', { n: rules.finalRound.multiplier }) : t('No final round')}</li>
          <li>{t('{n} strikes before a steal', { n: rules.maxStrikes })}</li>
          <li>{rules.stealAward === 'allPoints' ? t('Steal wins all round points') : t("Steal wins only that answer's points")}</li>
          <li>{settings.timer.enabled ? t('Timer {n}s', { n: settings.timer.defaultSeconds }) : t('Timer off')}</li>
          <li>{settings.finalChallenge.enabled ? t('Final Challenge on, target {n}', { n: settings.finalChallenge.targetScore }) : t('Final Challenge off')}</li>
        </ul>
      </section>
      </>)}

      <div className="mt-6 space-y-3">
        {asRemote ? (
          <p className="panel !py-3 text-sm text-night-100">{t('This phone is the remote. The game will appear on the TV as soon as you start.')}</p>
        ) : (
        <div className="panel !py-2">
          <Toggle
            checked={openScreen}
            onChange={setOpenScreen}
            label={t('Open the game screen in a new window')}
            description={t('Drag that window to your TV. This page becomes your host controls.')}
          />
        </div>
        )}
        <Button variant="gold" size="xl" block icon={openScreen && !asRemote ? MonitorPlay : Play} onClick={start} disabled={unlocked && !set}>
          {unlocked ? t('Start game') : t('Start the free demo')}
        </Button>
      </div>
    </div>
  );
}
