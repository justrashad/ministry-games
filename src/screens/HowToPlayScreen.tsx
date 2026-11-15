import { msg, t } from '../i18n/i18n';
import { Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { navigate } from '../lib/router';
import { HostHelpContent } from './host/HostHelp';

const STEPS = [
  msg('Split into two teams.'),
  msg('The host reads the question.'),
  msg('Teams try to guess the most popular answers.'),
  msg('Correct answers flip over and add their points.'),
  msg('Three answers that aren’t on the board give the other team a chance to steal.'),
  msg('The team with the most points at the end wins.'),
];

export function HowToPlayScreen() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <h1 className="text-3xl font-semibold">{t('How to play')}</h1>
      <section className="panel mt-6">
        <ol className="space-y-3">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-300 font-display text-lg font-bold text-ink" aria-hidden>
                {i + 1}
              </span>
              <p className="pt-1.5 text-lg text-cream">{t(step)}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-night-100">
          {t('The answers and point values are made up for each question set, so you can write your own. The point values are game values, not real survey results.')}
        </p>
      </section>

      <section className="panel mt-4">
        <h2 className="panel-title">{t('The Final Challenge')}</h2>
        <p className="text-night-100">
          {t('After the main game, two players from the winning team can play the Final Challenge. Player 1 answers five quick questions against the clock while Player 2 is out of earshot. Then Player 2 answers the same questions. The host checks the answers, reveals them one by one, and the family tries to reach the target score together.')}
        </p>
      </section>

      <section className="panel mt-4">
        <h2 className="panel-title">{t('Two screens')}</h2>
        <p className="text-night-100">
          {t('Connect a laptop to your TV, open the game screen, and drag that window onto the TV. Keep the host controls on the laptop, or host from a phone: press Use a phone as the remote on the TV and scan the QR code. The phone needs the internet for a moment to find the TV, then the two talk directly.')}
        </p>
      </section>

      <section className="panel mt-4">
        <h2 className="panel-title">{t('For the host')}</h2>
        <HostHelpContent />
      </section>

      <div className="mt-6">
        <Button variant="gold" size="xl" block icon={Play} onClick={() => navigate('/new')}>
          {t('Start a game')}
        </Button>
      </div>
    </div>
  );
}
