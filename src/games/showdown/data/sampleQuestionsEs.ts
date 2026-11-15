import type { Question } from '../types';
import { q } from './questionBuilder';

/*
 * Spanish (neutral Latin American) starter set: the same 32 questions as the English
 * set, adapted rather than translated word for word, with names and terms as they
 * appear in the Traducción del Nuevo Mundo and congregation use. IDs are prefixed
 * "es-" so both languages can sit in the library side by side.
 * All point values are fictional game values, not real survey statistics.
 */

export const FW_ES = 'Adoración en familia';
export const MEET_ES = 'Reuniones de la congregación';
export const CHAR_ES = 'Personajes bíblicos';
export const KNOW_ES = 'Conocimiento bíblico';
export const CREATE_ES = 'La creación';
export const MIN_ES = 'Ministerio cristiano';
export const QUAL_ES = 'Cualidades cristianas';

export const SAMPLE_ROUND_QUESTIONS_ES: Question[] = [
  q('es-fw-01', FW_ES, '¿Qué podría hacer una familia durante la adoración en familia?', [
    ['Estudiar la Biblia', 30], ['Analizar un relato bíblico', 20], ['Ver un video', 15], ['Practicar una presentación', 12],
    ['Prepararse para una reunión', 10], ['Orar', 8], ['Cantar una canción del Reino', 5],
  ]),
  q('es-mt-01', MEET_ES, '¿Qué podrías llevar a una reunión de la congregación?', [
    ['Biblia', 32], ['Tableta o teléfono', 25], ['Libreta', 14], ['Pluma', 12], ['Botella de agua', 9], ['Guía de actividades', 8],
  ]),
  q('es-ch-01', CHAR_ES, 'Menciona un personaje bíblico sobre el que a una familia le gustaría aprender.', [
    ['David', 24], ['Daniel', 20], ['José', 16], ['Ester', 13], ['Noé', 11], ['Rut', 9], ['Moisés', 7],
  ]),
  q('es-mt-02', MEET_ES, '¿Qué podría hacer una familia antes de ir a una reunión de la congregación?', [
    ['Preparar comentarios', 28], ['Vestirse bien', 22], ['Comer', 15], ['Orar juntos', 12], ['Salir temprano', 11], ['Preparar la mochila de la reunión', 8],
  ]),
  q('es-kn-01', KNOW_ES, 'Menciona un animal que aparece en la Biblia.', [
    ['León', 25], ['Oveja', 22], ['Burro', 15], ['Serpiente', 12], ['Paloma', 10], ['Camello', 8], ['Pez', 5],
  ]),
  q('es-ch-02', CHAR_ES, 'Menciona algo que Noé necesitó para construir el arca.', [
    ['Madera', 30], ['Herramientas', 20], ['La ayuda de su familia', 18], ['Alquitrán', 12], ['Fe', 10], ['Tiempo', 7],
  ], { notes: 'Génesis 6:14 menciona madera de árbol resinoso y alquitrán.' }),
  q('es-qu-01', QUAL_ES, 'Menciona una cualidad del fruto del espíritu.', [
    ['Amor', 28], ['Alegría', 18], ['Paz', 15], ['Paciencia', 12], ['Amabilidad', 10], ['Bondad', 7], ['Fe', 5], ['Autodominio', 5],
  ], { notes: 'Gálatas 5:22, 23. La apacibilidad también está en la lista.' }),
  q('es-mn-01', MIN_ES, 'Menciona algo que podrías llevar a la predicación.', [
    ['Biblia', 30], ['Tratados', 22], ['Invitaciones', 15], ['Tableta o teléfono', 13], ['Pluma', 8], ['Agua', 7],
  ]),
  q('es-kn-02', KNOW_ES, 'Menciona un libro de la Biblia que empiece con la letra J.', [
    ['Juan', 24], ['Jeremías', 16], ['Josué', 15], ['Job', 14], ['Jueces', 11], ['Jonás', 9], ['Joel', 7], ['Judas', 4],
  ]),
  q('es-kn-03', KNOW_ES, 'Menciona un milagro que hizo Jesús.', [
    ['Caminó sobre el agua', 26], ['Alimentó a las multitudes', 22], ['Sanó a los enfermos', 18], ['Resucitó a Lázaro', 14], ['Convirtió el agua en vino', 10], ['Calmó la tormenta', 8],
  ]),
  q('es-cr-01', CREATE_ES, 'Menciona algo de la creación que muestre la sabiduría de Jehová.', [
    ['Las estrellas', 22], ['Los océanos', 20], ['Los animales', 18], ['Las flores y los árboles', 15], ['Las montañas', 12], ['El cuerpo humano', 8],
  ]),
  q('es-fw-02', FW_ES, 'Menciona una forma en que una familia puede ayudar a un hermano mayor de la congregación.', [
    ['Visitarlo', 28], ['Llevarlo en el carro', 22], ['Llevarle comida', 16], ['Ayudarle con los quehaceres', 13], ['Llamarlo', 11], ['Enviarle una tarjeta', 7],
  ]),
  q('es-kn-04', KNOW_ES, 'Menciona un lugar que aparece en la Biblia.', [
    ['Jerusalén', 30], ['Egipto', 22], ['Belén', 16], ['Babilonia', 12], ['Nazaret', 9], ['Galilea', 7],
  ]),
  q('es-mt-03', MEET_ES, 'Menciona algo que podrías ver en una asamblea regional.', [
    ['Bautismo', 26], ['Un drama bíblico', 22], ['Muchos amigos', 18], ['Tarjetas de identificación', 12], ['Almuerzos empacados', 10], ['Publicaciones nuevas', 8],
  ]),
  q('es-mt-04', MEET_ES, 'Menciona una forma en que los jóvenes pueden participar en las reuniones.', [
    ['Comentar', 34], ['Cantar', 20], ['Presentar una asignación', 18], ['Seguir la lectura en la Biblia', 12], ['Tomar notas', 10], ['Escuchar con atención', 6],
  ]),
  q('es-kn-05', KNOW_ES, 'Menciona algo que Jesús usó en sus ilustraciones.', [
    ['Ovejas', 22], ['Semillas', 20], ['Una moneda perdida', 14], ['Una red de pesca', 12], ['Un viñedo', 11], ['Un grano de mostaza', 9], ['Una perla', 6],
  ]),
  q('es-ch-03', CHAR_ES, 'Menciona a una persona de la Biblia que cuidó ovejas.', [
    ['David', 36], ['Abel', 16], ['Moisés', 15], ['Jacob', 12], ['Raquel', 10], ['Amós', 6],
  ]),
  q('es-cr-02', CREATE_ES, 'Menciona algo del relato de la creación en Génesis capítulo 1.', [
    ['La luz', 22], ['El sol y la luna', 18], ['Las plantas', 16], ['Los animales', 15], ['Los peces y las aves', 12], ['Los seres humanos', 10], ['El cielo', 7],
  ]),
];

export const SAMPLE_FINAL_ROUND_QUESTIONS_ES: Question[] = [
  q('es-fr-01', QUAL_ES, 'Menciona una forma en que podemos mostrarles amor a nuestros hermanos.', [
    ['Animarlos', 25], ['Ayudarlos', 20], ['Orar por ellos', 16], ['Invitarlos a casa', 14], ['Perdonarlos', 12], ['Escucharlos', 8],
  ], { isFinalRound: true }),
  q('es-fr-02', FW_ES, 'Menciona algo por lo que una familia podría darle gracias a Jehová en oración.', [
    ['La comida', 26], ['La familia', 22], ['La vida', 16], ['La Biblia', 13], ['La congregación', 11], ['La creación', 7], ['El sacrificio de Jesús', 5],
  ], { isFinalRound: true }),
];

export const SAMPLE_FINAL_CHALLENGE_QUESTIONS_ES: Question[] = [
  q('es-fc-01', MEET_ES, 'Menciona algo que podría hacer una familia antes de ir a una reunión.', [
    ['Vestirse', 30], ['Preparar comentarios', 25], ['Comer', 18], ['Orar', 12], ['Planchar la ropa', 8],
  ], { isFinalChallenge: true, alternates: [['Arreglarse', 0], ['Prepararse', 0], ['Estudiar la lección', 1], ['Cenar', 2], ['Oración', 3]] }),
  q('es-fc-02', CHAR_ES, 'Menciona un personaje bíblico sobre el que a los niños les gustaría aprender.', [
    ['David', 30], ['Noé', 22], ['Daniel', 18], ['Jonás', 14], ['José', 10],
  ], { isFinalChallenge: true }),
  q('es-fc-03', MEET_ES, 'Menciona algo que podrías llevar a una reunión.', [
    ['Biblia', 35], ['Tableta', 22], ['Libreta', 15], ['Pluma', 12], ['Agua', 8],
  ], { isFinalChallenge: true, alternates: [['Teléfono', 1], ['Celular', 1], ['iPad', 1], ['Cuaderno', 2], ['Bolígrafo', 3], ['Lapicero', 3]] }),
  q('es-fc-04', FW_ES, 'Menciona algo que podría hacer una familia en una noche tranquila juntos.', [
    ['Jugar un juego', 28], ['Ver un video', 24], ['Platicar', 18], ['Comer postre', 14], ['Salir a caminar', 10],
  ], { isFinalChallenge: true, alternates: [['Juego de mesa', 0], ['Jugar', 0], ['Ver un video bíblico', 1], ['Conversar', 2], ['Hablar', 2], ['Comer helado', 3], ['Caminar', 4]] }),
  q('es-fc-05', KNOW_ES, 'Menciona un lugar que aparece en la Biblia.', [
    ['Jerusalén', 32], ['Egipto', 22], ['Belén', 18], ['Babilonia', 12], ['Edén', 10],
  ], { isFinalChallenge: true, alternates: [['Jardín de Edén', 4], ['El paraíso de Edén', 4]] }),
  q('es-fc-06', FW_ES, 'Menciona algo que podría hacer una familia junta después de cenar.', [
    ['Salir a caminar', 30], ['Platicar', 25], ['Estudiar', 20], ['Jugar un juego', 15], ['Limpiar', 10],
  ], { isFinalChallenge: true, alternates: [['Caminar', 0], ['Pasear', 0], ['Conversar', 1], ['Lavar los platos', 4], ['Recoger la mesa', 4]] }),
  q('es-fc-07', MIN_ES, 'Menciona algo que podría hacer una familia junta un sábado.', [
    ['Salir a predicar', 32], ['Limpiar la casa', 22], ['Salir a caminar', 16], ['Visitar a amigos', 14], ['Hacer mandados', 10],
  ], { isFinalChallenge: true, alternates: [['Predicar', 0], ['Predicación', 0], ['Servicio del campo', 0], ['De casa en casa', 0], ['Quehaceres', 1], ['Hacer compras', 4]] }),
  q('es-fc-08', KNOW_ES, 'Menciona una fruta que aparece en la Biblia.', [
    ['Higos', 30], ['Uvas', 26], ['Aceitunas', 16], ['Granadas', 14], ['Dátiles', 8],
  ], { isFinalChallenge: true, alternates: [['Olivas', 2]] }),
  q('es-fc-09', KNOW_ES, 'Menciona un animal que entró en el arca de Noé.', [
    ['Elefante', 26], ['León', 22], ['Jirafa', 16], ['Paloma', 14], ['Cuervo', 10],
  ], { isFinalChallenge: true }),
  q('es-fc-10', MIN_ES, 'Menciona una meta espiritual que podría ponerse un joven.', [
    ['Bautizarse', 34], ['Leer toda la Biblia', 24], ['Ser precursor', 18], ['Comentar en cada reunión', 12], ['Servir en Betel', 8],
  ], { isFinalChallenge: true, alternates: [['Bautismo', 0], ['Leer la Biblia', 1], ['Precursor regular', 2], ['Precursorado', 2], ['Betel', 4]] }),
  q('es-fc-11', QUAL_ES, 'Menciona una forma de animar a alguien que está triste.', [
    ['Hablar con él', 28], ['Compartir un texto bíblico', 24], ['Darle una tarjeta', 16], ['Orar con él', 14], ['Hacerlo reír', 10],
  ], { isFinalChallenge: true, alternates: [['Escucharlo', 0], ['Platicar', 0], ['Un versículo', 1], ['Un texto', 1], ['Animarlo', 1], ['Orar', 3]] }),
  q('es-fc-12', MEET_ES, 'Menciona algo que hay dentro de un Salón del Reino.', [
    ['Sillas', 28], ['Plataforma', 20], ['Micrófonos', 18], ['Publicaciones', 14], ['Amigos', 12],
  ], { isFinalChallenge: true, alternates: [['Asientos', 0], ['Escenario', 1], ['Micros', 2], ['Revistas', 3], ['Hermanos', 4]] }),
];

export const SAMPLE_SET_ID_ES = 'sample-family-worship-mix-es';
