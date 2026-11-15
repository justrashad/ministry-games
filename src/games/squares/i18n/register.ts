import { CORE_ES } from '../../../core/i18n/es';
import { registerTranslations } from '../../../core/i18n/i18n';
import { ES } from './es';

// Shared Spanish text first, then Kingdom Squares' own. Imported once, before anything is shown.
registerTranslations('es', CORE_ES);
registerTranslations('es', ES);
