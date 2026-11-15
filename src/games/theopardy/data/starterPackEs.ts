import { clue, type CluePack } from './clueBuilder';

/*
 * Paquete inicial en español neutro de Latinoamérica. Los ids son los mismos del
 * paquete en inglés (starterPack.ts): cada pista de aquí traduce la del mismo id.
 * Las citas indican el texto bíblico en que se basa la respuesta; no se copia el texto.
 */

const KINGS = 'Reyes de Israel y de Judá';
const PROPHETS = 'Profetas';
const WOMEN = 'Mujeres de la Biblia';
const JESUS = 'La vida de Jesús';
const APOSTLES = 'Los apóstoles';
const PLACES = 'Lugares bíblicos';
const ANIMALS = 'Animales de la Biblia';
const EXODUS = 'Moisés y el Éxodo';
const BOOKS = 'Libros de la Biblia';
const NUMBERS = 'Números de la Biblia';
const FAMILY = 'Lazos de familia';
const EARLY = 'Los primeros cristianos';
const FINAL = 'Ronda final';

export const STARTER_PACK_ES: CluePack = {
  id: 'starter',
  name: 'Paquete inicial',
  description: 'Doce categorías para toda la familia, desde relatos muy conocidos hasta temas de estudio más profundo.',
  clues: [
    clue('st-kings-1', KINGS, 1, 'Cuando era un joven pastor venció al gigante Goliat, y más tarde llegó a ser rey.', 'David', '1 Samuel 17:49, 50'),
    clue('st-kings-2', KINGS, 2, 'Este hijo de David le pidió a Jehová sabiduría para juzgar al pueblo en vez de pedir riquezas.', 'Salomón', '1 Reyes 3:9-11'),
    clue('st-kings-3', KINGS, 3, 'El primer rey de Israel, un hombre alto de la tribu de Benjamín.', 'Saúl', '1 Samuel 9:1, 2; 10:1'),
    clue('st-kings-4', KINGS, 4, 'Empezó a reinar en Judá a los ocho años. Durante su reinado se encontró en el templo el libro de la Ley.', 'Josías', '2 Reyes 22:1, 8'),
    clue('st-kings-5', KINGS, 5, 'Mientras este rey gobernaba Judá, un ángel mató a 185.000 soldados asirios en una sola noche.', 'Ezequías', '2 Reyes 19:15, 35'),

    clue('st-prophets-1', PROPHETS, 1, 'Pasó tres días y tres noches dentro de un pez enorme.', 'Jonás', 'Jonás 1:17'),
    clue('st-prophets-2', PROPHETS, 2, 'Lo echaron a un foso de leones porque siguió orándole a Jehová.', 'Daniel', 'Daniel 6:10, 16'),
    clue('st-prophets-3', PROPHETS, 3, 'Un carro de fuego y caballos de fuego lo separaron de Eliseo, y subió en una tempestad de viento.', 'Elías', '2 Reyes 2:11'),
    clue('st-prophets-4', PROPHETS, 4, 'Jehová le dijo a este profeta que se casara con una mujer llamada Gómer.', 'Oseas', 'Oseas 1:2, 3'),
    clue('st-prophets-5', PROPHETS, 5, 'En una visión vio una llanura llena de huesos secos que volvieron a la vida.', 'Ezequiel', 'Ezequiel 37:1-10'),

    clue('st-women-1', WOMEN, 1, 'La madre de Jesús.', 'María', 'Lucas 1:30, 31'),
    clue('st-women-2', WOMEN, 2, 'Esta mujer de Moab no quiso separarse de su suegra, Noemí.', 'Rut', 'Rut 1:16, 17'),
    clue('st-women-3', WOMEN, 3, 'Esta reina arriesgó la vida al presentarse ante el rey sin haber sido llamada, para salvar a su pueblo.', 'Ester', 'Ester 4:16; 5:1, 2'),
    clue('st-women-4', WOMEN, 4, 'En Jericó escondió en su azotea a dos espías israelitas.', 'Rahab', 'Josué 2:1, 6'),
    clue('st-women-5', WOMEN, 5, 'Esta profetisa juzgaba a Israel sentada debajo de una palmera, y fue con Barac a la batalla.', 'Débora', 'Jueces 4:4-9'),

    clue('st-jesus-1', JESUS, 1, 'El pueblo donde nació Jesús.', 'Belén', 'Mateo 2:1'),
    clue('st-jesus-2', JESUS, 2, 'Bautizó a Jesús en el río Jordán.', 'Juan el Bautista', 'Mateo 3:13', ['Juan', 'Juan el Bautizante']),
    clue('st-jesus-3', JESUS, 3, 'En un banquete de boda en Caná, Jesús hizo su primer milagro al convertir agua en esto.', 'Vino', 'Juan 2:1-11'),
    clue('st-jesus-4', JESUS, 4, 'Jesús resucitó a este amigo cuando ya llevaba cuatro días en la tumba.', 'Lázaro', 'Juan 11:17, 43, 44'),
    clue('st-jesus-5', JESUS, 5, 'El lugar donde Jesús oró, con sus discípulos cerca, la noche en que lo arrestaron.', 'Getsemaní', 'Mateo 26:36'),

    clue('st-apostles-1', APOSTLES, 1, 'Bajó de la barca y caminó sobre el agua hacia Jesús.', 'Pedro', 'Mateo 14:29', ['Simón Pedro', 'Cefas']),
    clue('st-apostles-2', APOSTLES, 2, 'Traicionó a Jesús por 30 piezas de plata.', 'Judas Iscariote', 'Mateo 26:14-16', ['Judas']),
    clue('st-apostles-3', APOSTLES, 3, 'Estaba sentado en la oficina de impuestos cuando Jesús lo llamó para que fuera su seguidor.', 'Mateo', 'Mateo 9:9', ['Leví']),
    clue('st-apostles-4', APOSTLES, 4, 'Dijo que no creería que Jesús había sido resucitado a menos que viera y tocara las marcas de los clavos.', 'Tomás', 'Juan 20:24, 25'),
    clue('st-apostles-5', APOSTLES, 5, 'Lo eligieron por sorteo para ocupar el lugar de Judas Iscariote.', 'Matías', 'Hechos 1:26'),

    clue('st-places-1', PLACES, 1, 'El jardín donde vivieron al principio Adán y Eva.', 'Edén', 'Génesis 2:8', ['El jardín de Edén', 'El jardín del Edén']),
    clue('st-places-2', PLACES, 2, 'Las murallas de esta ciudad se desplomaron después de que Israel marchó alrededor de ella durante siete días.', 'Jericó', 'Josué 6:15, 20'),
    clue('st-places-3', PLACES, 3, 'La montaña donde Moisés recibió los Diez Mandamientos.', 'El monte Sinaí', 'Éxodo 19:20; 31:18', ['Sinaí', 'Monte Sinaí', 'Horeb', 'Monte Horeb']),
    clue('st-places-4', PLACES, 4, 'En esta ciudad se llamó cristianos por primera vez a los discípulos.', 'Antioquía', 'Hechos 11:26', ['Antioquía de Siria']),
    clue('st-places-5', PLACES, 5, 'El apóstol Juan estaba en esta isla cuando recibió la Revelación.', 'Patmos', 'Apocalipsis 1:9'),

    clue('st-animals-1', ANIMALS, 1, 'En el jardín de Edén, este animal le habló a Eva.', 'Una serpiente', 'Génesis 3:1', ['Serpiente', 'La serpiente', 'Una culebra']),
    clue('st-animals-2', ANIMALS, 2, 'Esta ave volvió al arca de Noé con una hoja de olivo.', 'Una paloma', 'Génesis 8:11', ['Paloma', 'La paloma']),
    clue('st-animals-3', ANIMALS, 3, 'Estas aves le llevaban pan y carne a Elías mientras estaba junto al valle de Kerit.', 'Cuervos', '1 Reyes 17:3-6', ['Los cuervos']),
    clue('st-animals-4', ANIMALS, 4, 'Este animal le habló a Balaam después de que él lo golpeó tres veces.', 'Una burra', 'Números 22:28', ['Burra', 'Un burro', 'Una asna', 'Un asno']),
    clue('st-animals-5', ANIMALS, 5, 'Sansón atrapó 300 de estos animales y les ató antorchas entre las colas.', 'Zorros', 'Jueces 15:4', ['Zorras']),

    clue('st-exodus-1', EXODUS, 1, 'Cuando era bebé lo pusieron en una canasta entre los juncos del río Nilo.', 'Moisés', 'Éxodo 2:3-10'),
    clue('st-exodus-2', EXODUS, 2, 'El hermano de Moisés, que habló por él ante el faraón.', 'Aarón', 'Éxodo 4:14-16; 7:1, 2'),
    clue('st-exodus-3', EXODUS, 3, 'Jehová dividió este mar para que Israel cruzara por suelo seco.', 'El mar Rojo', 'Éxodo 14:21, 22', ['Mar Rojo']),
    clue('st-exodus-4', EXODUS, 4, 'El alimento que Jehová le dio a Israel durante 40 años en el desierto.', 'Maná', 'Éxodo 16:31, 35', ['El maná']),
    clue('st-exodus-5', EXODUS, 5, 'El suegro de Moisés, que le aconsejó elegir hombres capaces para que lo ayudaran a juzgar al pueblo.', 'Jetró', 'Éxodo 18:1, 17-21', ['Reuel']),

    clue('st-books-1', BOOKS, 1, 'El primer libro de la Biblia.', 'Génesis'),
    clue('st-books-2', BOOKS, 2, 'El último libro de la Biblia.', 'Apocalipsis', undefined, ['Revelación']),
    clue('st-books-3', BOOKS, 3, 'Este libro de la Biblia es una colección de 150 canciones.', 'Salmos', undefined, ['Salmo', 'El libro de los Salmos']),
    clue('st-books-4', BOOKS, 4, 'El libro que viene justo después de los cuatro Evangelios.', 'Hechos', undefined, ['Hechos de los Apóstoles']),
    clue('st-books-5', BOOKS, 5, 'El libro más corto de las Escrituras Hebreas, con un solo capítulo.', 'Abdías'),

    clue('st-numbers-1', NUMBERS, 1, 'La cantidad de apóstoles que eligió Jesús.', '12', 'Lucas 6:13', ['Doce']),
    clue('st-numbers-2', NUMBERS, 2, 'La cantidad de días y noches que llovió al comienzo del Diluvio.', '40', 'Génesis 7:12', ['Cuarenta']),
    clue('st-numbers-3', NUMBERS, 3, 'La cantidad de personas que sobrevivieron al Diluvio en el arca.', '8', '1 Pedro 3:20', ['Ocho']),
    clue('st-numbers-4', NUMBERS, 4, 'La cantidad de piedras lisas que David escogió del arroyo antes de enfrentarse a Goliat.', '5', '1 Samuel 17:40', ['Cinco']),
    clue('st-numbers-5', NUMBERS, 5, 'La cantidad de hombres que Gedeón tenía con él cuando fue contra el campamento de Madián.', '300', 'Jueces 7:7', ['Trescientos']),

    clue('st-family-1', FAMILY, 1, 'El primer hijo de Adán y Eva.', 'Caín', 'Génesis 4:1'),
    clue('st-family-2', FAMILY, 2, 'El hijo al que Jacob más quería, a quien le regaló una túnica especial.', 'José', 'Génesis 37:3'),
    clue('st-family-3', FAMILY, 3, 'El primogénito de los gemelos de Isaac y Rebeca.', 'Esaú', 'Génesis 25:24, 25'),
    clue('st-family-4', FAMILY, 4, 'La madre del profeta Samuel.', 'Ana', '1 Samuel 1:20'),
    clue('st-family-5', FAMILY, 5, 'La abuela de Timoteo, recordada por su fe.', 'Loida', '2 Timoteo 1:5'),

    clue('st-early-1', EARLY, 1, 'El nombre por el que se conocía al apóstol Pablo cuando perseguía a la congregación.', 'Saulo', 'Hechos 8:3; 13:9', ['Saulo de Tarso']),
    clue('st-early-2', EARLY, 2, 'Lo mataron a pedradas después de dar un testimonio valiente ante el Sanedrín.', 'Esteban', 'Hechos 6:12, 15; 7:59, 60'),
    clue('st-early-3', EARLY, 3, 'También llamada Dorcas, esta discípula de Jope fue resucitada por Pedro.', 'Tabita', 'Hechos 9:36-41'),
    clue('st-early-4', EARLY, 4, 'Un oficial del ejército en Cesarea. Pedro fue enviado a su casa, y él y los de su casa se bautizaron.', 'Cornelio', 'Hechos 10:1, 24, 48'),
    clue('st-early-5', EARLY, 5, 'Este matrimonio fabricaba tiendas de campaña y trabajó con Pablo en Corinto. Di los dos nombres.', 'Áquila y Priscila', 'Hechos 18:1-3', ['Priscila y Áquila', 'Áquila y Prisca', 'Prisca y Áquila']),
  ],
  finals: [
    clue('st-final-1', FINAL, 5, 'Vivió 969 años, más que cualquier otra persona de la que habla la Biblia.', 'Matusalén', 'Génesis 5:27'),
    clue('st-final-2', FINAL, 5, 'De los 12 espías enviados a Canaán, estos dos dieron un buen informe. Di los dos nombres.', 'Josué y Caleb', 'Números 14:6-8, 30', ['Caleb y Josué']),
    clue('st-final-3', FINAL, 5, 'A estos tres hebreos los echaron a un horno ardiente por negarse a adorar una estatua de oro. Di los tres nombres.', 'Sadrac, Mesac y Abednego', 'Daniel 3:16-23', ['Sadrac Mesac Abednego', 'Hananías, Misael y Azarías']),
    clue('st-final-4', FINAL, 5, 'A este hombre de Cirene lo obligaron a cargar el madero de tormento de Jesús.', 'Simón', 'Mateo 27:32', ['Simón de Cirene']),
  ],
};
