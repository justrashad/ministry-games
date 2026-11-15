import { msg, t } from '../i18n/i18n';
import { useState } from 'react';
import { Database, Volume2 } from 'lucide-react';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS, FC_TIMER_PRESETS, LIMITS, TIMER_PRESETS, normalizeMultipliers } from '../engine/defaults';
import { approximateUsageKB, clearAllAppData, isStorageAvailable } from '../lib/storage';
import { sound } from '../lib/sound';
import { dispatchGame } from '../sync/gameStore';
import { useLibrary } from '../state/libraryStore';
import { replaceSettings, settingsStore, updateSettings, useSettings } from '../state/settingsStore';
import { Button } from '../components/ui/Button';
import { ColorPicker } from '../components/ui/ColorPicker';
import { useConfirm } from '../components/ui/Confirm';
import { NumberField, SelectField } from '../components/ui/Fields';
import { Segmented } from '../components/ui/Segmented';
import { Tabs } from '../components/ui/Tabs';
import { Toggle } from '../components/ui/Toggle';
import { useToast } from '../components/ui/Toast';

type Tab = 'game' | 'rules' | 'timing' | 'audio' | 'visuals' | 'questions' | 'challenge' | 'data';
const TABS: { id: Tab; label: string }[] = [
  { id: 'game', label: msg('Game') },
  { id: 'rules', label: msg('House rules') },
  { id: 'timing', label: msg('Timing') },
  { id: 'audio', label: msg('Audio') },
  { id: 'visuals', label: msg('Visuals') },
  { id: 'questions', label: msg('Questions') },
  { id: 'challenge', label: msg('Final Challenge') },
  { id: 'data', label: msg('Data') },
];

function SecondsPicker({ label, value, presets, onChange, allowOff, offValue = 0 }: { label: string; value: number; presets: readonly number[]; onChange: (v: number) => void; allowOff?: boolean; offValue?: number }) {
  const isPreset = presets.includes(value) || (allowOff && value === offValue);
  const [custom, setCustom] = useState(!isPreset);
  return (
    <div className="space-y-2">
      <p className="field-label">{label}</p>
      <div className="segmented" role="group" aria-label={label}>
        {allowOff && (
          <button type="button" aria-pressed={!custom && value === offValue} onClick={() => { setCustom(false); onChange(offValue); }}>
            {t('Off')}
          </button>
        )}
        {presets.map((p) => (
          <button key={p} type="button" aria-pressed={!custom && value === p} onClick={() => { setCustom(false); onChange(p); }}>
            {p}s
          </button>
        ))}
        <button type="button" aria-pressed={custom} onClick={() => setCustom(true)}>
          {t('Custom')}
        </button>
      </div>
      {custom && (
        <NumberField label={t('Custom seconds')} value={value > 0 ? value : 25} min={LIMITS.timerSeconds.min} max={LIMITS.timerSeconds.max} suffix={t("seconds")} onChange={onChange} className="max-w-xs" />
      )}
    </div>
  );
}

export function SettingsScreen() {
  const settings = useSettings();
  const { sets } = useLibrary();
  const [tab, setTab] = useState<Tab>('game');
  const confirm = useConfirm();
  const toast = useToast();
  const { rules } = settings;
  const setRules = (patch: Partial<Settings['rules']>) => updateSettings('rules', patch);
  const setFinalRound = (patch: Partial<Settings['rules']['finalRound']>) => setRules({ finalRound: { ...rules.finalRound, ...patch } });

  const panel = () => {
    switch (tab) {
      case 'game':
        return (
          <div className="space-y-6">
            <p className="panel-hint">{t('Default team names and colors for new games. You can also change them on the New game screen or during play.')}</p>
            {([0, 1] as const).map((i) => (
              <div key={i} className="space-y-3 rounded-2xl bg-night-950/40 p-4">
                <div>
                  <label htmlFor={`def-team-${i}`} className="field-label">
                    {t('Team {n} name', { n: i + 1 })}
                  </label>
                  <input
                    id={`def-team-${i}`}
                    className="input"
                    maxLength={LIMITS.teamName}
                    defaultValue={settings.teams[i].name}
                    onBlur={(e) => {
                      const teams: Settings['teams'] = [{ ...settings.teams[0] }, { ...settings.teams[1] }];
                      teams[i].name = e.target.value;
                      updateSettings('teams', teams);
                    }}
                  />
                </div>
                <ColorPicker
                  label={`Team ${i + 1} color`}
                  value={settings.teams[i].color}
                  disabledColor={settings.teams[i === 0 ? 1 : 0].color}
                  onChange={(color) => {
                    const teams: Settings['teams'] = [{ ...settings.teams[0] }, { ...settings.teams[1] }];
                    teams[i].color = color;
                    updateSettings('teams', teams);
                  }}
                />
              </div>
            ))}
          </div>
        );
      case 'rules':
        return (
          <div className="space-y-6">
            <p className="panel-hint">{t('House rules apply when the next game starts.')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label={t('Number of rounds')} value={rules.rounds} min={LIMITS.rounds.min} max={LIMITS.rounds.max} onChange={(rounds) => setRules({ rounds, multipliers: normalizeMultipliers(rules.multipliers, rounds) })} />
              <NumberField label={t('Strikes before a steal')} value={rules.maxStrikes} min={LIMITS.strikes.min} max={LIMITS.strikes.max} onChange={(maxStrikes) => setRules({ maxStrikes })} />
            </div>
            <div>
              <p className="field-label">{t('Round multipliers')}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {rules.multipliers.map((m, i) => (
                  <NumberField
                    key={`${i}-${rules.rounds}`}
                    label={`Round ${i + 1}`}
                    value={m}
                    min={LIMITS.multiplier.min}
                    max={LIMITS.multiplier.max}
                    suffix="×"
                    onChange={(value) => setRules({ multipliers: rules.multipliers.map((x, j) => (j === i ? value : x)) })}
                  />
                ))}
              </div>
            </div>
            <Segmented
              label={t('A successful steal wins')}
              value={rules.stealAward}
              options={[
                { value: 'allPoints', label: t('All round points') },
                { value: 'answerOnly', label: "Only that answer's points" },
              ]}
              onChange={(stealAward) => setRules({ stealAward })}
            />
            <div className="divide-y divide-white/10">
              <Toggle checked={rules.revealRemainingOnRoundEnd} onChange={(v) => setRules({ revealRemainingOnRoundEnd: v })} label={t('Reveal remaining answers when a round ends')} description={t('Off lets you flip them one at a time.')} />
              <Toggle
                checked={rules.faceoffBuzzers}
                onChange={(v) => setRules({ faceoffBuzzers: v })}
                label={t('Face-off buzzers')}
                description={t('When a question appears, the first team to buzz (phone buzzer, or A and L on the TV keyboard) gets to play. The host can always choose instead.')}
              />
              <Toggle checked={rules.allowNegativeScores} onChange={(v) => setRules({ allowNegativeScores: v })} label={t('Allow scores below zero')} description={t('Usually off, so a team never drops under zero.')} />
            </div>
            <div className="space-y-4 rounded-2xl bg-night-950/40 p-4">
              <Toggle checked={rules.finalRound.enabled} onChange={(enabled) => setFinalRound({ enabled })} label={t('Final round')} description={t('A big-point round after the regular rounds, with its own look.')} />
              {rules.finalRound.enabled && (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <NumberField label={t('Final round questions')} value={rules.finalRound.questionCount} min={LIMITS.finalRoundQuestions.min} max={LIMITS.finalRoundQuestions.max} onChange={(questionCount) => setFinalRound({ questionCount })} />
                    <NumberField label={t('Final round multiplier')} value={rules.finalRound.multiplier} min={LIMITS.multiplier.min} max={LIMITS.multiplier.max} suffix="×" onChange={(multiplier) => setFinalRound({ multiplier })} />
                    <NumberField label={t('Answers shown')} value={rules.finalRound.answerLimit} min={LIMITS.answerLimit.min} max={LIMITS.answerLimit.max} help={t('Extra answers are left off the board.')} onChange={(answerLimit) => setFinalRound({ answerLimit })} />
                  </div>
                  <SecondsPicker label={t('Final round timer')} value={rules.finalRound.timerSeconds} presets={[20, 30, 45]} allowOff onChange={(timerSeconds) => setFinalRound({ timerSeconds })} />
                  <Segmented
                    label={t('Reveal final round answers')}
                    value={rules.finalRound.revealMode}
                    options={[
                      { value: 'individual', label: t('One at a time') },
                      { value: 'simultaneous', label: t('All at once') },
                    ]}
                    onChange={(revealMode) => setFinalRound({ revealMode })}
                  />
                </>
              )}
            </div>
          </div>
        );
      case 'timing':
        return (
          <div className="space-y-6">
            <Toggle checked={settings.timer.enabled} onChange={(enabled) => updateSettings('timer', { enabled })} label={t('Timer for each round')} description={t('The host starts, pauses and resets it. It shows on the TV.')} />
            {settings.timer.enabled && <SecondsPicker label={t('Default time')} value={settings.timer.defaultSeconds} presets={TIMER_PRESETS} onChange={(defaultSeconds) => updateSettings('timer', { defaultSeconds })} />}
            <p className="panel-hint">{t('The Final Challenge clock is set on the Final Challenge tab. The final round timer is under House rules.')}</p>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-6">
            <Toggle checked={settings.audio.enabled} onChange={(enabled) => updateSettings('audio', { enabled })} label={t('Sound effects')} description={sound.isSupported() ? t('Simple original tones. The game works the same with sound off.') : t('This browser does not support sound.')} disabled={!sound.isSupported()} />
            <div>
              <label htmlFor="volume" className="field-label">
                {t('Volume: {n}%', { n: Math.round(settings.audio.volume * 100) })}
              </label>
              <input
                id="volume"
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(settings.audio.volume * 100)}
                onChange={(e) => {
                  updateSettings('audio', { volume: Number(e.target.value) / 100 });
                  sound.setVolume(Number(e.target.value) / 100);
                }}
                className="w-full max-w-md accent-gold-300"
                disabled={!settings.audio.enabled}
              />
            </div>
            <Button
              variant="ghost"
              icon={Volume2}
              disabled={!settings.audio.enabled}
              onClick={async () => {
                await sound.unlock();
                sound.setVolume(settings.audio.volume);
                sound.play('correct');
              }}
            >
              {t('Test sound')}
            </Button>
          </div>
        );
      case 'visuals':
        return (
          <div className="space-y-6">
            <div className="divide-y divide-white/10">
              <Toggle checked={settings.visuals.animations} onChange={(animations) => updateSettings('visuals', { animations })} label={t('Animations')} description={t('Card flips, strike stamps and transitions.')} />
              <Toggle checked={settings.visuals.celebrations} onChange={(celebrations) => updateSettings('visuals', { celebrations })} label={t('Celebration effects')} description={t('Confetti after a steal, at the end of the game, and when the Final Challenge target is reached.')} />
              <Toggle checked={settings.visuals.showHiddenPoints} onChange={(showHiddenPoints) => updateSettings('visuals', { showHiddenPoints })} label={t('Show point values on hidden answers')} description={t('Gives players a hint of how popular each answer is.')} />
            </div>
            <Segmented
              label={t('Reduced motion')}
              value={settings.visuals.motion}
              options={[
                { value: 'system', label: t('Follow device') },
                { value: 'reduced', label: t('Always reduce') },
                { value: 'full', label: t('Full motion') },
              ]}
              onChange={(motion) => updateSettings('visuals', { motion })}
            />
          </div>
        );
      case 'questions':
        return (
          <div className="space-y-6">
            <SelectField
              label={t('Default question set')}
              value={settings.questions.activeSetId ?? ''}
              onChange={(value) => updateSettings('questions', { activeSetId: value || null })}
              options={[{ value: '', label: t('First set in the list') }, ...sets.map((s) => ({ value: s.id, label: s.name }))]}
            />
            <Segmented
              label={t('Question order')}
              value={settings.questions.order}
              options={[
                { value: 'shuffle', label: t('Shuffle') },
                { value: 'inOrder', label: t('In order') },
              ]}
              onChange={(order) => updateSettings('questions', { order })}
            />
            <Toggle checked={settings.questions.avoidRepeats} onChange={(avoidRepeats) => updateSettings('questions', { avoidRepeats })} label={t("Don't repeat questions in a game")} description={t('When a set runs out, the game ends. Turn off to reuse questions.')} />
            <NumberField
              label={t('Save recently played questions for later')}
              value={settings.questions.avoidRecentGames}
              min={0}
              max={20}
              suffix={t('recent games')}
              help={t('Questions from this many recent games go to the back of the deck, so repeat nights feel fresh. They are still used if the set runs short. 0 turns this off.')}
              onChange={(avoidRecentGames) => updateSettings('questions', { avoidRecentGames })}
              className="max-w-sm"
            />
          </div>
        );
      case 'challenge':
        return (
          <div className="space-y-6">
            <Toggle
              checked={settings.finalChallenge.enabled}
              onChange={(enabled) => updateSettings('finalChallenge', { enabled })}
              label={t('Offer the Final Challenge after the game')}
              description={t('Uses questions marked “Use for Final Challenge” in the chosen set.')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label={t('Questions')} value={settings.finalChallenge.questionCount} min={LIMITS.fcQuestions.min} max={LIMITS.fcQuestions.max} onChange={(questionCount) => updateSettings('finalChallenge', { questionCount })} />
              <NumberField label={t('Target score')} value={settings.finalChallenge.targetScore} min={LIMITS.target.min} max={LIMITS.target.max} suffix={t("points")} onChange={(targetScore) => updateSettings('finalChallenge', { targetScore })} />
            </div>
            <SecondsPicker label={t('Player 1 time')} value={settings.finalChallenge.player1Seconds} presets={FC_TIMER_PRESETS} onChange={(player1Seconds) => updateSettings('finalChallenge', { player1Seconds })} />
            <SecondsPicker label={t('Player 2 time')} value={settings.finalChallenge.player2Seconds} presets={FC_TIMER_PRESETS} onChange={(player2Seconds) => updateSettings('finalChallenge', { player2Seconds })} />
            <Segmented
              label={t('When Player 2 gives the same answer as Player 1')}
              value={settings.finalChallenge.duplicatePolicy}
              options={[
                { value: 'countBoth', label: t('Count it for both') },
                { value: 'secondScoresZero', label: t('Player 2 scores zero') },
              ]}
              onChange={(duplicatePolicy) => updateSettings('finalChallenge', { duplicatePolicy })}
            />
          </div>
        );
      case 'data':
        return <DataPanel onReset={async () => {
          const ok = await confirm({ title: t('Reset all settings?'), message: t('House rules, timing, audio and visual settings go back to their defaults. Questions and history are kept.'), confirmLabel: t('Reset settings') });
          if (ok) {
            replaceSettings({ ...DEFAULT_SETTINGS, questions: { ...DEFAULT_SETTINGS.questions, activeSetId: settingsStore.get().questions.activeSetId } });
            toast.show(t('Settings reset'));
          }
        }} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6">
      <h1 className="text-3xl font-semibold">{t('Settings')}</h1>
      <p className="mb-5 text-night-200">{t('Saved automatically in this browser.')}</p>
      <Tabs label={t('Settings sections')} idPrefix="settings" tabs={TABS} active={tab} onChange={setTab} />
      <section className="panel mt-4" role="tabpanel" id={`settings-panel-${tab}`} aria-labelledby={`settings-tab-${tab}`}>
        {panel()}
      </section>
    </div>
  );
}

function DataPanel({ onReset }: { onReset: () => void }) {
  const confirm = useConfirm();
  const toast = useToast();
  const available = isStorageAvailable();
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl bg-night-950/40 p-4">
        <Database className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" aria-hidden />
        <div className="text-sm text-night-100">
          <p className="font-bold text-cream">{t('Your data stays on this device')}</p>
          <p>
            {t("Question sets, settings, the game in progress, and game history are stored in this browser's local storage. They are never sent to a server. The only thing sent anywhere is a license key and a short device name when you activate or re-check a purchase.")}{' '}
            {t('To move questions to another computer, export a question set and import it there.')}
          </p>
          <p className="mt-2 text-night-200">{available ? t('Using about {n} KB.', { n: approximateUsageKB() }) : t('This browser is blocking storage, so nothing will be saved after the page closes.')}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={onReset}>
          {t('Reset settings')}
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            const ok = await confirm({ title: t('End the current game?'), message: t('The game in progress is cleared from both screens without being saved to history.'), confirmLabel: t('Clear game') });
            if (ok) {
              dispatchGame({ type: 'CLEAR_GAME' });
              toast.show(t('Game cleared'));
            }
          }}
        >
          {t('Clear current game')}
        </Button>
        <Button
          variant="danger"
          onClick={async () => {
            const ok = await confirm({
              title: t('Erase everything?'),
              message: t('All question sets, settings, history and the current game will be deleted from this browser. Export any question sets you want to keep first.'),
              confirmLabel: t('Erase all data'),
            });
            if (ok) {
              dispatchGame({ type: 'CLEAR_GAME' });
              clearAllAppData();
              window.location.hash = '/';
              window.location.reload();
            }
          }}
        >
          {t('Erase all data')}
        </Button>
      </div>
    </div>
  );
}
