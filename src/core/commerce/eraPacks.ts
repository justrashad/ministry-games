import { msg } from '../i18n/msg';
import type { PackInfo } from './packChoices';

/*
 * The four era packs every new title sells, in Bible order. The names and
 * descriptions are shared; each title's server holds its own questions for them.
 */
export const ERA_PACKS: PackInfo[] = [
  { id: 'eden-to-egypt', name: msg('From Eden to Egypt'), description: msg('Genesis: creation, Noah, Abraham, Jacob and Joseph.') },
  { id: 'exodus-to-judges', name: msg('Exodus to the Judges'), description: msg('Moses, the wilderness, Joshua, the judges and Ruth.') },
  { id: 'kings-and-prophets', name: msg('Kings and Prophets'), description: msg('Samuel, David, Solomon, Elijah, Esther, Daniel and more.') },
  { id: 'jesus-and-early-christians', name: msg('Jesus and the Early Christians'), description: msg('The life of Jesus, the apostles and the congregation in Acts.') },
];
