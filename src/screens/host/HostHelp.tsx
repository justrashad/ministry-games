import { msg, t } from '../../i18n/i18n';
import { Modal } from '../../components/ui/Modal';

export const SHORTCUTS: [keys: string, action: string][] = [
  ['1 – 9', msg('Correct: reveal that answer and add its points (during a steal, awards the steal)')],
  ['Shift + 1 – 9', msg('Show that answer without points')],
  ['X', msg('Strike')],
  ['Z', msg('Undo strike (or cancel a steal)')],
  ['S', msg('Start the steal')],
  ['B', msg('Open the face-off buzzers again')],
  ['[ and ]', msg('Team 1 or Team 2 is playing')],
  ['Q', msg('Show the question')],
  ['R', msg('Reveal the next hidden answer')],
  ['T', msg('Start or pause the timer')],
  ['N', msg('Next round')],
  ['P', msg('Pause or resume the game')],
];

export function HostHelpContent() {
  return (
    <div className="space-y-5 text-night-100">
      <section>
        <h3 className="mb-2 text-lg font-semibold">{t('Running a round')}</h3>
        <dl className="space-y-3">
          <div>
            <dt className="font-bold text-cream">{t('Correct answer')}</dt>
            <dd>{t('Tap Correct next to the answer. It flips on the TV and its points go into the round points.')}</dd>
          </div>
          <div>
            <dt className="font-bold text-cream">{t('Strike')}</dt>
            <dd>{t("Use when the playing team gives an answer that isn't on the board.")}</dd>
          </div>
          <div>
            <dt className="font-bold text-cream">{t('Steal')}</dt>
            <dd>
              {t('After the last strike, the other team gets one guess. If they find an answer, tap it on the board to award the steal. If they miss, tap Steal missed and the round points go to the team that was playing.')}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-cream">{t('End round')}</dt>
            <dd>
              {t('Award the round to a team to bank the round points times the multiplier. Remaining answers can then be revealed, automatically or one at a time, depending on your house rules.')}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-cream">{t('Show without points')}</dt>
            <dd>{t('The eye button flips an answer for everyone to see without scoring it. Handy at the end of a round.')}</dd>
          </div>
        </dl>
      </section>
      <section>
        <h3 className="mb-2 text-lg font-semibold">{t('Face-off buzzers')}</h3>
        <p>
          {t("When the question appears, the buzzers open. Team captains buzz from their phones (choose Team buzzer after connecting), or press A for Team 1 and L for Team 2 on the TV computer's keyboard. The first buzz wins control. You can still pick a team yourself at any time.")}
        </p>
      </section>
      <section>
        <h3 className="mb-2 text-lg font-semibold">{t('House rules')}</h3>
        <p>{t('Strikes, rounds, multipliers, how steals are scored, and the final round are all adjustable in Settings. Changes apply to the next new game.')}</p>
      </section>
      <section>
        <h3 className="mb-2 text-lg font-semibold">{t('Keyboard shortcuts')}</h3>
        <table className="w-full text-sm">
          <tbody>
            {SHORTCUTS.map(([k, a]) => (
              <tr key={k} className="border-t border-white/10">
                <td className="whitespace-nowrap py-1.5 pr-4">
                  <span className="kbd">{k}</span>
                </td>
                <td className="py-1.5">{t(a)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export function HostHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={t('Host help')} width={620}>
      <HostHelpContent />
    </Modal>
  );
}
