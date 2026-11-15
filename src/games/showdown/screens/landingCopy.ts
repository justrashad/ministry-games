import type { Lang } from '../../../core/i18n/i18n';

/*
 * Sales page wording, kept whole per language so each reads naturally rather than
 * being stitched together from fragments. {placeholders} are filled in by the page.
 */
export interface LandingCopy {
  headline: string;
  lede: string;
  tryFree: string;
  seePricing: string;
  badges: string[];
  heroAlt: string;
  buzzerAlt: string;
  howTitle: string;
  videoTitle: string;
  videoLabel: string;
  steps: [string, string][];
  phonesTitle: string;
  phonesBody: string;
  phonesPoints: string[];
  hostAlt: string;
  fcTitle: string;
  fcBody: string;
  fcAlt: string;
  packsTitle: string;
  packsBody: string;
  pricingTitle: string;
  pricingSub: string;
  gameTitle: string;
  gameSub: string;
  gamePoints: string[];
  completeTitle: string;
  completeSub: string;
  completePoints: string[];
  bestValue: string;
  bundleNote: string;
  megaTitle: string;
  megaSub: string;
  megaPoints: string[];
  alreadyBought: string;
  enterKey: string;
  faqTitle: string;
  testimonialsTitle: string;
  giftTitle: string;
  giftBody: string;
  giftCta: string;
  freeTitle: string;
  freeBody: string;
  freeCta: string;
  faq: [string, string][];
  lostKeyQ: string;
  lostKeyA: [string, string, string];
  closingTitle: string;
  closingSub: string;
  haveKey: string;
  offlineNote: string;
}

export const LANDING_COPY: Record<Lang, LandingCopy> = {
  en: {
    headline: 'Family worship game night, on your TV.',
    lede: 'Two teams race to find the most popular answers to Bible-centered survey questions. Buzz in from your phones, steal the points, and finish with a two-player Final Challenge.',
    tryFree: 'Try one round free',
    seePricing: 'See pricing',
    badges: ['One-time purchase', 'No accounts', 'Works offline', '{days}-day refunds'],
    heroAlt: 'The Ministry Showdown board on a TV: two team scores, a Bible question, and answers flipping over.',
    buzzerAlt: 'A team buzzer on a phone.',
    videoTitle: 'See it in action',
    videoLabel: 'A 40-second look at Ministry Showdown: a team buzzes in from a phone, answers flip on the board, three strikes lead to a steal, and the Final Challenge reaches its target.',
    howTitle: 'Ready in two minutes',
    steps: [
      ['Put it on the TV', 'Open Ministry Showdown on the laptop connected to your TV. No download or account needed.'],
      ['Host from your phone', 'Scan the code on the TV. Your phone becomes the remote, and team captains can use theirs as buzzers.'],
      ['Play!', 'Buzz in, guess the top answers, dodge three strikes, steal the points, and crown a winner.'],
    ],
    phonesTitle: 'Everyone plays from their phones',
    phonesBody: 'The host runs the whole show from a phone: reveal answers, give strikes, award points. Team captains race on phone buzzers, and in the Final Challenge each player types privately on their own phone.',
    phonesPoints: ['First buzz wins control, with a chime on the TV', 'No peeking: phones only show what each person should see', 'No phones? It works with just a laptop and keyboard too'],
    hostAlt: 'The host controls on a phone: the answer board with Correct buttons, strikes and steal.',
    fcTitle: 'A Final Challenge worth cheering for',
    fcBody: 'After the main game, two players from the winning team answer five quick questions against the clock. Then the answers flip one by one while everyone watches the total climb toward the target.',
    fcAlt: "The Final Challenge reveal on the TV, with both players' answers and the total score.",
    packsTitle: '{n} question packs, and counting',
    packsBody: 'A 32-question starter set comes with the game. Add themed packs ({q} more questions), or write your own and share them with other families by link. New to the Bible? Start with the beginner friendly packs.',
    pricingTitle: 'Simple, one-time pricing',
    pricingSub: "No subscriptions. No ads. Refunds within {days} days if it's not for you.",
    gameTitle: 'The game',
    gameSub: 'Everything you need to play',
    gamePoints: ['Full game with all rounds and the Final Challenge', '32-question starter set', 'Write and share your own questions', 'Phone remote and buzzers'],
    completeTitle: 'Complete Edition',
    completeSub: 'The game plus every pack',
    completePoints: ['Everything in the game', 'All {n} question packs available today'],
    bestValue: 'Best value',
    bundleNote: 'Bundles include every pack available on the day you buy. Packs released later are sold separately.',
    megaTitle: 'Mega Pack',
    megaSub: 'For families who own the game',
    megaPoints: ['All {n} question packs available today', 'Or buy single packs from the Store'],
    alreadyBought: 'Already bought?',
    enterKey: 'Enter your key',
    faqTitle: 'Questions families ask',
    testimonialsTitle: 'What families are saying',
    giftTitle: 'A gift families remember',
    giftBody: 'Perfect for newlyweds, a family new to the congregation, or someone you study with. Buy it, then print a card with a QR code that unlocks the game on their TV.',
    giftCta: 'Make a gift card',
    freeTitle: 'Free printable',
    freeBody: 'Five survey questions as printable host cards. Play on paper tonight, no screen needed.',
    freeCta: 'Get the free printable',
    faq: [
      ['What do I need to play?', 'A laptop or computer connected to your TV (or just the laptop screen) and a web browser. Phones are optional: use them as the host remote and buzzers if you like.'],
      ['Do I need an account?', "No. You buy once, get a license key by email, and paste it into the game. That's it."],
      ['Does it work without internet?', 'Yes. Once your key is activated, the game plays offline. The internet is only needed to activate a key and for a moment when connecting phones.'],
      ['How many devices can I use?', "Each key works on a few devices at once, such as your TV laptop and your phone. Guests who join from their phones as buzzers or players don't need a key."],
      ['Is it good for young children or people new to the Bible?', 'Yes. The Little Ones pack has simple questions for young children, and the Bible Basics, Famous Bible Stories and Everyday Values packs need no Bible background.'],
      ['Can I write my own questions?', 'Yes. Create as many question sets as you like, share them with other families by link, or print host cards to play from paper.'],
      ["What if it's not right for us?", 'Email {email} within {days} days of purchase for a full refund.'],
      ['Is this an official product?', "No. Ministry Showdown is an independent game designed for family worship. It is not produced by, affiliated with, or endorsed by Jehovah's Witnesses or the Watch Tower Bible and Tract Society."],
    ],
    lostKeyQ: 'I lost my license key. What now?',
    lostKeyA: ['Look up your order at', "Lemon Squeezy's My Orders page", 'using the email address you bought with; your key is on the order. Or email {email}.'],
    closingTitle: 'Bring the family together tonight',
    closingSub: 'Play a full round free. No sign-up, no card.',
    haveKey: 'I have a key',
    offlineNote: 'Once activated, it works even without internet.',
  },
  es: {
    headline: 'Noche de juego para la adoración en familia, en tu televisor.',
    lede: 'Dos equipos compiten por encontrar las respuestas más populares a preguntas de encuesta basadas en la Biblia. Presionen el timbre desde sus teléfonos, róbense los puntos y terminen con un Desafío final para dos jugadores.',
    tryFree: 'Prueba una ronda gratis',
    seePricing: 'Ver precios',
    badges: ['Pago único', 'Sin cuentas', 'Funciona sin internet', 'Reembolso en {days} días'],
    heroAlt: 'El tablero de Ministry Showdown en un televisor: los puntos de dos equipos, una pregunta bíblica y respuestas que se voltean.',
    buzzerAlt: 'Un timbre de equipo en un teléfono.',
    videoTitle: 'Míralo en acción',
    videoLabel: 'Un vistazo de 40 segundos a Ministry Showdown: un equipo toca el timbre desde un teléfono, las respuestas se voltean en el tablero, tres fallas llevan a un robo y el Desafío final alcanza su meta.',
    howTitle: 'Listo en dos minutos',
    steps: [
      ['Ponlo en el televisor', 'Abre Ministry Showdown en la laptop conectada a tu televisor. No tienes que descargar nada ni crear una cuenta.'],
      ['Presenta desde tu teléfono', 'Escanea el código que aparece en el televisor. Tu teléfono se convierte en el control, y los capitanes pueden usar los suyos como timbres.'],
      ['¡A jugar!', 'Presionen el timbre, adivinen las respuestas principales, eviten las tres fallas, róbense los puntos y coronen al ganador.'],
    ],
    phonesTitle: 'Todos juegan desde su teléfono',
    phonesBody: 'El presentador dirige todo el juego desde un teléfono: revela respuestas, marca fallas y da los puntos. Los capitanes compiten con timbres en sus teléfonos, y en el Desafío final cada jugador escribe sus respuestas en privado en su propio teléfono.',
    phonesPoints: ['El primero en presionar el timbre gana el control, con un sonido en el televisor', 'Sin trampas: cada teléfono muestra solo lo que esa persona debe ver', '¿No hay teléfonos? También funciona solo con una laptop y un teclado'],
    hostAlt: 'Los controles del presentador en un teléfono: el tablero con botones de Correcta, fallas y robo.',
    fcTitle: 'Un Desafío final para celebrar',
    fcBody: 'Después del juego principal, dos jugadores del equipo ganador responden cinco preguntas rápidas contra el reloj. Luego las respuestas se voltean una por una mientras todos ven cómo el total se acerca a la meta.',
    fcAlt: 'La revelación del Desafío final en el televisor, con las respuestas de ambos jugadores y el puntaje total.',
    packsTitle: '{n} paquetes de preguntas, y más en camino',
    packsBody: 'El juego incluye un paquete inicial de 32 preguntas. Agrega paquetes temáticos ({q} preguntas más) o escribe las tuyas y compártelas con otras familias mediante un enlace. ¿Eres nuevo en la Biblia? Empieza con los paquetes para principiantes.',
    pricingTitle: 'Precios sencillos, un solo pago',
    pricingSub: 'Sin suscripciones. Sin anuncios. Te devolvemos tu dinero dentro de {days} días si no es para ti.',
    gameTitle: 'El juego',
    gameSub: 'Todo lo que necesitas para jugar',
    gamePoints: ['El juego completo con todas las rondas y el Desafío final', 'Paquete inicial de 32 preguntas', 'Escribe y comparte tus propias preguntas', 'Control desde el teléfono y timbres'],
    completeTitle: 'Edición completa',
    completeSub: 'El juego más todos los paquetes',
    completePoints: ['Todo lo que incluye el juego', 'Los {n} paquetes de preguntas disponibles hoy'],
    bestValue: 'Mejor valor',
    bundleNote: 'Los paquetes combinados incluyen todos los paquetes disponibles el día de tu compra. Los paquetes que salgan después se venden por separado.',
    megaTitle: 'Megapaquete',
    megaSub: 'Para familias que ya tienen el juego',
    megaPoints: ['Los {n} paquetes de preguntas disponibles hoy', 'O compra paquetes individuales en la Tienda'],
    alreadyBought: '¿Ya lo compraste?',
    enterKey: 'Ingresa tu clave',
    faqTitle: 'Preguntas que hacen las familias',
    testimonialsTitle: 'Lo que dicen las familias',
    giftTitle: 'Un regalo que las familias recuerdan',
    giftBody: 'Ideal para recién casados, una familia nueva en la congregación o alguien con quien estudias. Cómpralo y luego imprime una tarjeta con un código QR que desbloquea el juego en su televisor.',
    giftCta: 'Crear una tarjeta de regalo',
    freeTitle: 'Imprimible gratis',
    freeBody: 'Cinco preguntas de encuesta en tarjetas para el presentador. Jueguen en papel esta noche, sin pantalla.',
    freeCta: 'Descargar el imprimible gratis',
    faq: [
      ['¿Qué necesito para jugar?', 'Una laptop o computadora conectada a tu televisor (o solo la pantalla de la laptop) y un navegador web. Los teléfonos son opcionales: úsalos como control del presentador y como timbres, si quieres.'],
      ['¿Necesito crear una cuenta?', 'No. Compras una sola vez, recibes una clave de licencia por correo electrónico y la pegas en el juego. Eso es todo.'],
      ['¿Funciona sin internet?', 'Sí. Una vez activada tu clave, el juego funciona sin conexión. Solo necesitas internet para activar la clave y por un momento al conectar los teléfonos.'],
      ['¿En cuántos dispositivos puedo usarlo?', 'Cada clave funciona en varios dispositivos a la vez, como la laptop del televisor y tu teléfono. Los invitados que se unen desde su teléfono como timbres o jugadores no necesitan clave.'],
      ['¿Es bueno para niños pequeños o personas que no conocen mucho la Biblia?', 'Sí. El paquete Para los pequeños tiene preguntas sencillas para niños, y los paquetes Lo básico de la Biblia, Relatos bíblicos famosos y Valores de todos los días no requieren conocimientos bíblicos.'],
      ['¿Puedo escribir mis propias preguntas?', 'Sí. Crea todos los grupos de preguntas que quieras, compártelos con otras familias mediante un enlace o imprime tarjetas para el presentador y juega en papel.'],
      ['¿Y si no es para nosotros?', 'Escribe a {email} dentro de los {days} días posteriores a la compra y te devolvemos todo tu dinero.'],
      ['¿Es un producto oficial?', 'No. Ministry Showdown es un juego independiente diseñado para la adoración en familia. No es producido por los testigos de Jehová ni por la Watch Tower Bible and Tract Society, ni está afiliado a ellos ni cuenta con su respaldo.'],
    ],
    lostKeyQ: 'Perdí mi clave de licencia. ¿Qué hago?',
    lostKeyA: ['Busca tu pedido en', 'la página My Orders de Lemon Squeezy', 'con el correo electrónico que usaste al comprar; tu clave aparece en el pedido. O escribe a {email}.'],
    closingTitle: 'Reúne a la familia esta noche',
    closingSub: 'Juega una ronda completa gratis. Sin registrarte y sin tarjeta.',
    haveKey: 'Tengo una clave',
    offlineNote: 'Una vez activado, funciona incluso sin internet.',
  },
};
