import type { Question } from '../../src/games/showdown/types';
import { q } from '../../src/games/showdown/data/questionBuilder';
import { ERA_PACKS_ES } from './eraPacks';

/*
 * PAID CONTENT (Spanish). Bundled only into the Netlify Function, like packs.ts.
 * Spanish versions of the question packs, keyed by the same pack IDs. A pack that
 * isn't here yet is served in English. Question IDs are prefixed "pk-es-".
 * Point values are fictional game values, not real survey statistics.
 */

export interface SpanishPack {
  name: string;
  description: string;
  questions: Question[];
}

const FINAL = { isFinalRound: true } as const;
const FC = { isFinalChallenge: true } as const;
const LITTLE = 'Para los pequeños';
const BASICS = 'Lo básico de la Biblia';
const STORIES = 'Relatos famosos';
const VALUES = 'Valores de todos los días';
const CHAR = 'Personajes bíblicos';
const MEET = 'Reuniones de la congregación';
const JESUS = 'La vida de Jesús';
const CREATE = 'La creación';
const MIN = 'Ministerio cristiano';
const ACCOUNTS = 'Relatos bíblicos';
const FAMILY = 'La vida en familia';
const PLACES = 'Lugares bíblicos';
const HOPE = 'Nuestra esperanza';

export const QUESTION_PACKS_ES: Record<string, SpanishPack> = {
  'little-ones': {
    name: 'Para los pequeños',
    description: 'Preguntas cortas y sencillas que los niños pequeños pueden responder.',
    questions: [
      q('pk-es-lo-01', LITTLE, 'Menciona un animal del arca de Noé.', [['Elefante', 28], ['León', 24], ['Jirafa', 20], ['Perro', 16], ['Paloma', 12]]),
      q('pk-es-lo-02', LITTLE, 'Menciona un color del arcoíris.', [['Rojo', 28], ['Azul', 24], ['Amarillo', 20], ['Verde', 16], ['Morado', 12]]),
      q('pk-es-lo-03', LITTLE, 'Menciona a alguien de tu familia.', [['Mamá', 30], ['Papá', 28], ['Hermana', 16], ['Hermano', 16], ['Abuelita', 10]]),
      q('pk-es-lo-04', LITTLE, 'Menciona algo que haces antes de dormir.', [['Orar', 30], ['Lavarme los dientes', 26], ['Bañarme', 18], ['Leer un cuento', 16], ['Ponerme la pijama', 10]]),
      q('pk-es-lo-05', LITTLE, 'Menciona algo que hizo Jehová.', [['Los animales', 26], ['Las personas', 22], ['Los árboles', 20], ['Las flores', 16], ['El sol', 16]]),
      q('pk-es-lo-06', LITTLE, 'Menciona algo amable que se puede decir.', [['Por favor', 34], ['Gracias', 30], ['Perdón', 16], ['Con permiso', 12], ['De nada', 8]]),
      q('pk-es-lo-07', LITTLE, 'Menciona algo que llevas a la reunión.', [['Biblia', 36], ['Tableta', 20], ['Libreta', 18], ['Agua', 14], ['Lápiz', 12]]),
      q('pk-es-lo-08', LITTLE, 'Menciona un animal de la granja.', [['Vaca', 28], ['Oveja', 24], ['Caballo', 20], ['Cerdo', 16], ['Gallina', 12]]),
      q('pk-es-lo-09', LITTLE, 'Menciona una forma de ser amable.', [['Compartir', 30], ['Ayudar a alguien', 24], ['Dar un abrazo', 18], ['Decir palabras bonitas', 16], ['Orar por alguien', 12]], FINAL),
      q('pk-es-lo-10', LITTLE, 'Menciona un animal del arca de Noé.', [['Elefante', 30], ['León', 26], ['Jirafa', 20], ['Cebra', 14], ['Paloma', 10]], FC),
      q('pk-es-lo-11', LITTLE, 'Menciona algo que sea amarillo.', [['El sol', 32], ['Plátano', 26], ['Limón', 18], ['Pollito', 14], ['Maíz', 10]], { ...FC, alternates: [['Sol', 0], ['Banana', 1], ['Guineo', 1], ['Patito', 3], ['Elote', 4]] }),
      q('pk-es-lo-12', LITTLE, 'Menciona algo que haces antes de dormir.', [['Orar', 34], ['Lavarme los dientes', 28], ['Bañarme', 18], ['Leer un cuento', 12], ['Dar abrazos', 8]], { ...FC, alternates: [['Oración', 0], ['Cepillarme los dientes', 1], ['Baño', 2], ['Cuento', 3], ['Abrazo', 4]] }),
      q('pk-es-lo-13', LITTLE, 'Menciona algo amable que se puede decir.', [['Por favor', 36], ['Gracias', 32], ['Perdón', 14], ['Con permiso', 10], ['De nada', 8]], { ...FC, alternates: [['Muchas gracias', 1], ['Lo siento', 2], ['Disculpa', 3]] }),
      q('pk-es-lo-14', LITTLE, 'Menciona algo que ves en el cielo.', [['El sol', 32], ['La luna', 26], ['Las estrellas', 20], ['Las nubes', 14], ['Los pájaros', 8]], { ...FC, alternates: [['Sol', 0], ['Luna', 1], ['Aves', 4]] }),
    ],
  },
  'bible-basics': {
    name: 'Lo básico de la Biblia',
    description: 'Preguntas fáciles sobre las personas y las enseñanzas más conocidas de la Biblia.',
    questions: [
      q('pk-es-bb-01', BASICS, 'Menciona a alguien que vivió en el jardín de Edén.', [['Adán', 44], ['Eva', 38], ['La serpiente', 10], ['Los animales', 8]]),
      q('pk-es-bb-02', BASICS, 'Menciona algo que creó Jehová.', [['La Tierra', 24], ['Los animales', 22], ['Las personas', 18], ['El sol', 14], ['Los árboles y las plantas', 12], ['Las estrellas', 10]]),
      q('pk-es-bb-03', BASICS, 'Menciona a una persona famosa de la Biblia.', [['Jesús', 30], ['Moisés', 18], ['Noé', 16], ['David', 14], ['Abrahán', 12], ['María', 10]]),
      q('pk-es-bb-04', BASICS, 'Menciona algo que Jesús enseñó a hacer.', [['Amarse unos a otros', 28], ['Orar', 22], ['Perdonar', 18], ['Ser bondadosos', 14], ['Ayudar a otros', 10], ['Decir la verdad', 8]]),
      q('pk-es-bb-05', BASICS, 'Menciona un animal de un relato bíblico famoso.', [['León', 26], ['Pez grande', 22], ['Serpiente', 18], ['Paloma', 14], ['Oveja', 12], ['Burro', 8]]),
      q('pk-es-bb-06', BASICS, 'Menciona una forma en que las personas de la Biblia hablaban con Dios.', [['La oración', 44], ['Canciones', 20], ['Pidiendo ayuda', 14], ['Dando gracias', 12], ['Por medio de profetas', 10]]),
      q('pk-es-bb-07', BASICS, 'Menciona algo que le pasó a Jesús cuando era bebé.', [['Nació en Belén', 30], ['Lo acostaron en un pesebre', 26], ['Lo visitaron unos pastores', 18], ['Le pusieron el nombre de Jesús', 14], ['Lo llevaron a Egipto', 12]], {
        notes: 'Lucas 2:7-21; Mateo 2:13-15.',
      }),
      q('pk-es-bb-08', BASICS, 'Menciona algo que según la Biblia es bueno para una familia.', [['El amor', 30], ['La oración', 22], ['La bondad', 16], ['El perdón', 14], ['La honradez', 10], ['Trabajar juntos', 8]]),
      q('pk-es-bb-09', BASICS, 'Menciona una enseñanza bíblica que casi todos conocen.', [['Ama a tu prójimo', 28], ['No robes', 20], ['Perdona a los demás', 18], ['Di la verdad', 14], ['Honra a tus padres', 12], ['Sé humilde', 8]], FINAL),
      q('pk-es-bb-10', BASICS, 'Menciona a una persona famosa de la Biblia.', [['Jesús', 34], ['Moisés', 20], ['Noé', 18], ['David', 16], ['María', 12]], FC),
      q('pk-es-bb-11', BASICS, 'Menciona algo que creó Jehová.', [['Los animales', 30], ['La Tierra', 24], ['Las personas', 20], ['El sol', 14], ['Las flores', 12]], { ...FC, alternates: [['Tierra', 1], ['El mundo', 1], ['Los humanos', 2], ['Sol', 3], ['Las plantas', 4]] }),
      q('pk-es-bb-12', BASICS, 'Menciona algo que enseñó Jesús.', [['El amor', 32], ['La oración', 24], ['El perdón', 20], ['La bondad', 14], ['La humildad', 10]], { ...FC, alternates: [['Amarse unos a otros', 0], ['Orar', 1], ['Perdonar', 2], ['Ser bondadoso', 3], ['Ser humilde', 4]] }),
      q('pk-es-bb-13', BASICS, 'Menciona algo que pasó cuando nació Jesús.', [['Nació en Belén', 34], ['Lo acostaron en un pesebre', 26], ['Llegaron unos pastores', 20], ['Aparecieron ángeles', 12], ['María y José viajaron', 8]], {
        ...FC,
        alternates: [['Belén', 0], ['Pesebre', 1], ['Pastores', 2], ['Ángeles', 3], ['Viajaron', 4]],
      }),
      q('pk-es-bb-14', BASICS, 'Menciona un animal de un relato bíblico famoso.', [['León', 32], ['Pez grande', 26], ['Serpiente', 18], ['Paloma', 14], ['Burro', 10]], { ...FC, alternates: [['Ballena', 1], ['Pez', 1], ['Culebra', 2], ['Asno', 4]] }),
    ],
  },
  'famous-stories': {
    name: 'Relatos bíblicos famosos',
    description: 'Noé, David y Goliat, Jonás, Daniel y más, contados de forma sencilla.',
    questions: [
      q('pk-es-fs-01', STORIES, 'Menciona algo del relato de Noé.', [['El arca', 32], ['Los animales', 24], ['El Diluvio', 18], ['La lluvia', 12], ['El arcoíris', 8], ['La paloma', 6]]),
      q('pk-es-fs-02', STORIES, 'Menciona algo del relato de David y Goliat.', [['Una honda', 30], ['Piedras', 24], ['Un gigante', 20], ['Valor', 14], ['Un joven pastor', 12]]),
      q('pk-es-fs-03', STORIES, 'Menciona algo del relato de Jonás.', [['Un pez grande', 42], ['Huir', 18], ['Una tormenta', 16], ['Nínive', 12], ['Un barco', 12]]),
      q('pk-es-fs-04', STORIES, 'Menciona algo del relato de Daniel.', [['Leones', 42], ['Orar', 22], ['El rey', 16], ['Un foso', 12], ['Un ángel', 8]]),
      q('pk-es-fs-05', STORIES, 'Menciona algo del relato de Moisés.', [['Abrir el mar', 26], ['Un arbusto en llamas', 20], ['Los Diez Mandamientos', 18], ['Las plagas', 14], ['Un bebé en una canasta', 12], ['El faraón', 10]]),
      q('pk-es-fs-06', STORIES, 'Menciona algo del relato de Adán y Eva.', [['El jardín de Edén', 30], ['La fruta', 26], ['La serpiente', 20], ['El árbol', 14], ['Los animales', 10]]),
      q('pk-es-fs-07', STORIES, 'Menciona algo del relato del nacimiento de Jesús.', [['Un pesebre', 30], ['Belén', 22], ['Los pastores', 18], ['María', 16], ['José', 14]]),
      q('pk-es-fs-08', STORIES, 'Menciona algo que hizo Jesús en un relato famoso.', [['Caminó sobre el agua', 28], ['Alimentó a miles de personas', 22], ['Sanó a personas', 20], ['Calmó una tormenta', 16], ['Convirtió el agua en vino', 14]]),
      q('pk-es-fs-09', STORIES, 'Menciona un relato bíblico que les encanta a los niños.', [['El arca de Noé', 28], ['David y Goliat', 24], ['Jonás y el pez grande', 20], ['Daniel y los leones', 16], ['Moisés y el mar Rojo', 12]], FINAL),
      q('pk-es-fs-10', STORIES, 'Menciona algo del relato de Noé.', [['Arca', 34], ['Animales', 28], ['Diluvio', 18], ['Lluvia', 12], ['Arcoíris', 8]], { ...FC, alternates: [['Barco', 0], ['Inundación', 2]] }),
      q('pk-es-fs-11', STORIES, 'Menciona algo del relato de Jonás.', [['Pez grande', 44], ['Tormenta', 20], ['Barco', 16], ['Nínive', 12], ['Huir', 8]], { ...FC, alternates: [['Ballena', 0], ['Pez', 0], ['Tempestad', 1], ['Nave', 2], ['Se escapó', 4]] }),
      q('pk-es-fs-12', STORIES, 'Menciona algo del relato de David y Goliat.', [['Honda', 32], ['Piedra', 26], ['Gigante', 22], ['Pastor', 12], ['Valor', 8]], { ...FC, alternates: [['Resortera', 0], ['Tirachinas', 0], ['Goliat', 2], ['Valiente', 4]] }),
      q('pk-es-fs-13', STORIES, 'Menciona algo del relato de Moisés.', [['Mar Rojo', 30], ['Arbusto en llamas', 24], ['Diez Mandamientos', 20], ['Plagas', 14], ['Canasta', 12]], {
        ...FC,
        alternates: [['Abrió el mar', 0], ['Zarza ardiente', 1], ['Mandamientos', 2], ['Ranas', 3], ['Cesta', 4]],
      }),
      q('pk-es-fs-14', STORIES, 'Menciona un relato bíblico que les encanta a los niños.', [['El arca de Noé', 30], ['David y Goliat', 26], ['Jonás', 20], ['Daniel y los leones', 14], ['Moisés', 10]], {
        ...FC,
        alternates: [['Noé', 0], ['Goliat', 1], ['Jonás y la ballena', 2], ['Daniel', 3]],
      }),
    ],
  },
  'everyday-values': {
    name: 'Valores de todos los días',
    description: 'Bondad, honradez, respeto y amistad. Cualquiera puede jugar, no se necesitan conocimientos bíblicos.',
    questions: [
      q('pk-es-ev-01', VALUES, 'Menciona algo que hace que alguien sea un buen amigo.', [['La bondad', 28], ['La lealtad', 20], ['La honradez', 18], ['Ser divertido', 14], ['Saber escuchar', 12], ['Compartir', 8]]),
      q('pk-es-ev-02', VALUES, 'Menciona una forma de dar las gracias.', [['Decirlo', 30], ['Escribir una tarjeta', 22], ['Dar un abrazo', 18], ['Ayudar a la persona', 14], ['Dar un regalito', 10], ['Sonreír', 6]]),
      q('pk-es-ev-03', VALUES, 'Menciona algo que puedes compartir.', [['Comida', 28], ['Juguetes', 22], ['Tiempo', 18], ['Palabras amables', 14], ['Una sonrisa', 10], ['Ropa', 8]]),
      q('pk-es-ev-04', VALUES, 'Menciona una forma de ayudar a un vecino.', [['Cargarle las bolsas', 22], ['Cortarle el césped', 20], ['Ver cómo está', 18], ['Llevarle comida', 16], ['Cuidarle la mascota', 14], ['Saludarlo', 10]]),
      q('pk-es-ev-05', VALUES, 'Menciona algo que te hace feliz.', [['La familia', 28], ['Los amigos', 22], ['La buena comida', 16], ['Jugar', 14], ['Estar al aire libre', 12], ['La música', 8]]),
      q('pk-es-ev-06', VALUES, 'Menciona una forma de calmarte cuando estás molesto.', [['Respirar hondo', 30], ['Orar', 22], ['Hablar con alguien', 18], ['Salir a caminar', 14], ['Contar hasta diez', 10], ['Descansar', 6]]),
      q('pk-es-ev-07', VALUES, 'Menciona algo que hacen las personas honradas.', [['Decir la verdad', 38], ['Cumplir sus promesas', 22], ['Devolver las cosas', 16], ['Admitir sus errores', 14], ['Pagar lo que deben', 10]]),
      q('pk-es-ev-08', VALUES, 'Menciona una forma de mostrar respeto.', [['Escuchar', 28], ['Decir por favor y gracias', 24], ['Ser educado', 18], ['Esperar tu turno', 16], ['No interrumpir', 14]]),
      q('pk-es-ev-09', VALUES, 'Menciona algo que trae paz a un hogar.', [['La bondad', 26], ['El perdón', 20], ['La oración', 18], ['La risa', 16], ['La paciencia', 12], ['Una casa ordenada', 8]], FINAL),
      q('pk-es-ev-10', VALUES, 'Menciona algo que hace que alguien sea un buen amigo.', [['Bondad', 32], ['Honradez', 24], ['Lealtad', 20], ['Ser divertido', 14], ['Saber escuchar', 10]], { ...FC, alternates: [['Bondadoso', 0], ['Amable', 0], ['Honesto', 1], ['Honestidad', 1], ['Leal', 2], ['Chistoso', 3], ['Escuchar', 4]] }),
      q('pk-es-ev-11', VALUES, 'Menciona algo que puedes compartir.', [['Comida', 34], ['Juguetes', 26], ['Tiempo', 18], ['Palabras amables', 12], ['Una sonrisa', 10]], { ...FC, alternates: [['Dulces', 0], ['Botanas', 0], ['Juegos', 1]] }),
      q('pk-es-ev-12', VALUES, 'Menciona una forma de mostrar respeto.', [['Escuchar', 32], ['Decir por favor', 26], ['Ser educado', 20], ['Esperar tu turno', 12], ['No interrumpir', 10]], { ...FC, alternates: [['Decir gracias', 1], ['Buenos modales', 2], ['Tener modales', 2]] }),
      q('pk-es-ev-13', VALUES, 'Menciona algo que te hace feliz.', [['La familia', 32], ['Los amigos', 26], ['La comida', 18], ['Jugar', 14], ['La música', 10]], { ...FC, alternates: [['Mi familia', 0], ['Juegos', 3]] }),
      q('pk-es-ev-14', VALUES, 'Menciona una forma de calmarte.', [['Respirar hondo', 34], ['Orar', 24], ['Hablar con alguien', 20], ['Salir a caminar', 12], ['Contar hasta diez', 10]], { ...FC, alternates: [['Respirar', 0], ['Oración', 1], ['Platicar', 2], ['Caminar', 3]] }),
    ],
  },
  'bible-characters': {
    name: 'Personajes bíblicos',
    description: 'Reyes, profetas, apóstoles y hombres y mujeres fieles.',
    questions: [
      q('pk-es-bc-01', CHAR, 'Menciona a uno de los hijos de Jacob.', [['José', 28], ['Benjamín', 20], ['Judá', 16], ['Rubén', 12], ['Leví', 10], ['Simeón', 8], ['Dan', 6]]),
      q('pk-es-bc-02', CHAR, 'Menciona a una mujer de la Biblia.', [['María', 24], ['Ester', 18], ['Rut', 16], ['Sara', 14], ['Eva', 12], ['Rahab', 8], ['Débora', 8]]),
      q('pk-es-bc-03', CHAR, 'Menciona a uno de los apóstoles de Jesús.', [['Pedro', 30], ['Juan', 20], ['Andrés', 12], ['Santiago', 12], ['Mateo', 10], ['Tomás', 9], ['Judas', 7]]),
      q('pk-es-bc-04', CHAR, 'Menciona a un rey de Israel o de Judá.', [['David', 34], ['Salomón', 26], ['Saúl', 16], ['Ezequías', 9], ['Josías', 8], ['Acab', 7]]),
      q('pk-es-bc-05', CHAR, 'Menciona a un profeta de la Biblia.', [['Elías', 24], ['Isaías', 20], ['Daniel', 16], ['Jonás', 14], ['Jeremías', 12], ['Eliseo', 8], ['Samuel', 6]]),
      q('pk-es-bc-06', CHAR, 'Menciona a alguien de la Biblia que mostró mucho valor.', [['David', 30], ['Ester', 22], ['Daniel', 18], ['Moisés', 12], ['Josué', 10], ['Débora', 8]]),
      q('pk-es-bc-07', CHAR, 'Menciona a alguien que viajó con el apóstol Pablo.', [['Timoteo', 30], ['Silas', 25], ['Lucas', 18], ['Bernabé', 15], ['Tito', 7], ['Marcos', 5]]),
      q('pk-es-bc-08', CHAR, 'Menciona a un personaje bíblico que sirvió en la corte de un rey.', [['José', 24], ['Daniel', 22], ['Ester', 20], ['Nehemías', 14], ['Moisés', 12], ['Mardoqueo', 8]], {
        notes: 'Nehemías era el copero del rey Artajerjes (Nehemías 2:1).',
      }),
      q('pk-es-bc-09', CHAR, 'Menciona a alguien de la Biblia conocido por su gran fe.', [['Abrahán', 26], ['Noé', 22], ['Moisés', 16], ['Sara', 12], ['Daniel', 12], ['Job', 8]], {
        ...FINAL,
        notes: 'Hebreos capítulo 11 menciona muchos ejemplos.',
      }),
      q('pk-es-bc-10', CHAR, 'Menciona a uno de los 12 apóstoles.', [['Pedro', 32], ['Juan', 22], ['Andrés', 18], ['Santiago', 16], ['Mateo', 12]], FC),
      q('pk-es-bc-11', CHAR, 'Menciona a una mujer de la Biblia.', [['María', 30], ['Ester', 24], ['Rut', 18], ['Sara', 16], ['Eva', 12]], FC),
      q('pk-es-bc-12', CHAR, 'Menciona a un rey de la Biblia.', [['David', 34], ['Salomón', 28], ['Saúl', 20], ['Nabucodonosor', 10], ['Ezequías', 8]], { ...FC, alternates: [['El rey David', 0], ['El rey Salomón', 1]] }),
      q('pk-es-bc-13', CHAR, 'Menciona a un personaje bíblico que construyó algo.', [['Noé', 36], ['Salomón', 24], ['Nehemías', 16], ['Jesús', 14], ['Bezalel', 10]], {
        ...FC,
        alternates: [['El arca', 0], ['El templo', 1], ['Las murallas', 2], ['Carpintero', 3]],
      }),
      q('pk-es-bc-14', CHAR, 'Menciona a uno de los doce hijos de Jacob.', [['José', 32], ['Benjamín', 22], ['Judá', 18], ['Rubén', 16], ['Leví', 12]], FC),
    ],
  },
  'kingdom-hall': {
    name: 'El Salón del Reino y las reuniones',
    description: 'Las reuniones, las asambleas y la vida en el Salón del Reino.',
    questions: [
      q('pk-es-kh-01', MEET, 'Menciona algo que haces en una reunión de la congregación.', [['Cantar', 28], ['Orar', 22], ['Comentar', 18], ['Escuchar los discursos', 14], ['Tomar notas', 10], ['Saludar a los amigos', 8]]),
      q('pk-es-kh-02', MEET, 'Menciona una parte de la reunión de entre semana.', [
        ['Tesoros de la Biblia', 24],
        ['Lectura de la Biblia', 20],
        ['Seamos mejores maestros', 18],
        ['Nuestra vida cristiana', 16],
        ['Estudio bíblico de la congregación', 14],
        ['Canciones y oración', 8],
      ]),
      q('pk-es-kh-03', MEET, 'Menciona una forma de ayudar a mantener limpio el Salón del Reino.', [['Aspirar', 26], ['Limpiar las sillas', 20], ['Limpiar los baños', 18], ['Sacar la basura', 14], ['Quitar el polvo', 12], ['Lavar las ventanas', 10]]),
      q('pk-es-kh-04', MEET, 'Menciona algo que puede hacer un niño para prepararse para el Estudio de La Atalaya.', [['Leer el artículo', 30], ['Subrayar las respuestas', 24], ['Buscar los textos bíblicos', 18], ['Practicar un comentario', 16], ['Dormir bien', 12]]),
      q('pk-es-kh-05', MEET, 'Menciona algo que podrías ver en un Salón del Reino.', [['Sillas', 24], ['Plataforma', 20], ['Micrófonos', 16], ['Publicaciones', 14], ['Pantallas', 12], ['Flores', 8], ['Un reloj', 6]]),
      q('pk-es-kh-06', MEET, 'Menciona algo que podrías decir para saludar a alguien en el Salón del Reino.', [['Hola', 30], ['Buenos días', 22], ['¿Cómo estás?', 20], ['Qué gusto verte', 14], ['Bienvenido', 14]]),
      q('pk-es-kh-07', MEET, 'Menciona una tarea en la que ayudan los hermanos y las hermanas en las reuniones.', [['Acomodador', 26], ['Micrófonos', 22], ['Audio y video', 18], ['Publicaciones', 14], ['Limpieza', 12], ['Lector del estudio', 8]]),
      q('pk-es-kh-08', MEET, 'Menciona algo que la gente lleva a una asamblea regional.', [['Almuerzo', 26], ['Biblia', 22], ['Tarjeta de identificación', 16], ['Libreta', 14], ['Agua', 12], ['Paraguas', 10]]),
      q('pk-es-kh-09', MEET, 'Menciona una razón por la que nos gusta ir a las reuniones.', [['Ver a los amigos', 26], ['Aprender de la Biblia', 24], ['Cantar', 16], ['Recibir ánimo', 14], ['Adorar a Jehová', 12], ['Orar juntos', 8]], FINAL),
      q('pk-es-kh-10', MEET, 'Menciona algo que haces en una reunión de la congregación.', [['Cantar', 32], ['Orar', 24], ['Comentar', 20], ['Escuchar', 14], ['Tomar notas', 10]], { ...FC, alternates: [['Responder', 2], ['Canciones', 0]] }),
      q('pk-es-kh-11', MEET, 'Menciona algo que empacas para una asamblea regional.', [['Almuerzo', 32], ['Biblia', 24], ['Tarjeta de identificación', 18], ['Agua', 14], ['Libreta', 12]], { ...FC, alternates: [['Comida', 0], ['Sándwich', 0], ['Lonche', 0], ['Tarjeta', 2], ['Gafete', 2]] }),
      q('pk-es-kh-12', MEET, 'Menciona una tarea que alguien podría hacer en el Salón del Reino.', [['Acomodador', 30], ['Micrófonos', 24], ['Limpieza', 20], ['Publicaciones', 14], ['Audio', 12]], { ...FC, alternates: [['Acomodar', 0], ['Micros', 1], ['Limpiar', 2], ['Sonido', 4]] }),
      q('pk-es-kh-13', MEET, 'Menciona algo que podrías ver en una asamblea regional.', [['Bautismo', 30], ['Drama', 24], ['Mucha gente', 18], ['Escenario', 16], ['Videos', 12]], { ...FC, alternates: [['Drama bíblico', 1], ['Multitudes', 2], ['Plataforma', 3]] }),
      q('pk-es-kh-14', MEET, 'Menciona algo que dices al saludar a un amigo en la reunión.', [['Hola', 34], ['¿Cómo estás?', 26], ['Buenos días', 18], ['Qué gusto verte', 14], ['Bienvenido', 8]], { ...FC, alternates: [['Buenas tardes', 2], ['Buenas noches', 2], ['Qué tal', 1]] }),
    ],
  },
  'life-of-jesus': {
    name: 'La vida de Jesús',
    description: 'Su nacimiento, sus milagros, sus ilustraciones y su ejemplo.',
    questions: [
      q('pk-es-lj-01', JESUS, 'Menciona un lugar donde Jesús pasó tiempo durante su ministerio.', [['Jerusalén', 26], ['Galilea', 22], ['Capernaúm', 16], ['Nazaret', 14], ['Betania', 12], ['El río Jordán', 10]]),
      q('pk-es-lj-02', JESUS, 'Menciona algo que pasó cuando nació Jesús.', [['Lo acostaron en un pesebre', 30], ['Lo visitaron unos pastores', 24], ['Aparecieron ángeles', 18], ['Nació en Belén', 16], ['María y José viajaron', 12]], {
        notes: 'Lucas 2:1-20.',
      }),
      q('pk-es-lj-03', JESUS, 'Menciona un milagro de Jesús con comida o bebida.', [['Alimentó a 5.000', 32], ['Convirtió el agua en vino', 28], ['Alimentó a 4.000', 20], ['Una pesca enorme', 20]]),
      q('pk-es-lj-04', JESUS, 'Menciona a alguien a quien Jesús sanó o resucitó.', [['Lázaro', 26], ['Bartimeo, el ciego', 16], ['La hija de Jairo', 16], ['Un hombre con lepra', 14], ['La suegra de Pedro', 12], ['Un paralítico', 10], ['El hijo de la viuda de Naín', 6]]),
      q('pk-es-lj-05', JESUS, 'Menciona algo que Jesús enseñó en el Sermón del Monte.', [['La oración modelo', 26], ['Amen a sus enemigos', 20], ['Dejen de preocuparse', 18], ['Traten a los demás como quieren que los traten', 16], ['Sigan buscando primero el Reino', 12], ['Felices los que…', 8]], {
        notes: 'Mateo capítulos 5 a 7.',
      }),
      q('pk-es-lj-06', JESUS, 'Menciona una de las ilustraciones de Jesús.', [['El hijo pródigo', 26], ['El buen samaritano', 24], ['El sembrador', 18], ['La oveja perdida', 14], ['El grano de mostaza', 10], ['La perla', 8]]),
      q('pk-es-lj-07', JESUS, 'Menciona algo que hizo Jesús que mostró humildad.', [['Les lavó los pies a sus discípulos', 38], ['Montó en un burro', 18], ['Comió con cobradores de impuestos', 16], ['Le oró a su Padre', 14], ['Recibió a los niños', 14]]),
      q('pk-es-lj-08', JESUS, 'Menciona a alguien de la familia de Jesús.', [['María', 34], ['José', 26], ['Santiago', 16], ['Judas', 10], ['Elisabet', 8], ['Juan el Bautista', 6]], {
        notes: 'Santiago y Judas eran sus medios hermanos; Elisabet y Juan el Bautista eran parientes (Lucas 1:36).',
      }),
      q('pk-es-lj-09', JESUS, 'Menciona una lección que aprendemos del ejemplo de Jesús.', [['El amor', 26], ['La humildad', 22], ['La bondad', 18], ['La obediencia', 14], ['El valor', 12], ['La oración', 8]], FINAL),
      q('pk-es-lj-10', JESUS, 'Menciona una de las ilustraciones de Jesús.', [['El hijo pródigo', 30], ['El buen samaritano', 26], ['El sembrador', 18], ['La oveja perdida', 16], ['El grano de mostaza', 10]], {
        ...FC,
        alternates: [['El hijo perdido', 0], ['El samaritano', 1], ['El agricultor', 2], ['Las semillas', 2], ['La semilla de mostaza', 4]],
      }),
      q('pk-es-lj-11', JESUS, 'Menciona un milagro que hizo Jesús.', [['Caminó sobre el agua', 30], ['Alimentó a las multitudes', 24], ['Sanó a los enfermos', 20], ['Resucitó a Lázaro', 14], ['El agua en vino', 12]], {
        ...FC,
        alternates: [['Alimentó a 5.000', 1], ['Sanó a personas', 2], ['Sanó a los ciegos', 2], ['Lázaro', 3]],
      }),
      q('pk-es-lj-12', JESUS, 'Menciona un lugar que visitó Jesús.', [['Jerusalén', 32], ['Galilea', 24], ['Nazaret', 18], ['Capernaúm', 14], ['Betania', 12]], FC),
      q('pk-es-lj-13', JESUS, 'Menciona a alguien que siguió a Jesús.', [['Pedro', 32], ['Juan', 24], ['María Magdalena', 18], ['Andrés', 14], ['Mateo', 12]], FC),
      q('pk-es-lj-14', JESUS, 'Menciona algo que hizo Jesús cuando era niño o joven.', [['Trabajó como carpintero', 34], ['Habló con los maestros en el templo', 26], ['Obedeció a sus padres', 20], ['Creció en Nazaret', 12], ['Aprendió las Escrituras', 8]], {
        ...FC,
        notes: 'Lucas 2:41-52; Marcos 6:3.',
        alternates: [['Carpintero', 0], ['Fue al templo', 1], ['Escuchó a sus padres', 2]],
      }),
    ],
  },
  creation: {
    name: 'La creación',
    description: 'Los animales, las plantas, el cielo y las maravillas que hizo Jehová.',
    questions: [
      q('pk-es-cr-01', CREATE, 'Menciona un animal que vive en el océano.', [['Ballena', 26], ['Tiburón', 20], ['Delfín', 18], ['Pulpo', 14], ['Pez', 12], ['Tortuga marina', 10]]),
      q('pk-es-cr-02', CREATE, 'Menciona algo que crece en un huerto.', [['Tomates', 24], ['Flores', 22], ['Zanahorias', 16], ['Lechuga', 14], ['Fresas', 12], ['Chiles', 12]]),
      q('pk-es-cr-03', CREATE, 'Menciona algo que puede volar.', [['Los pájaros', 30], ['El águila', 20], ['El murciélago', 16], ['La mariposa', 14], ['La abeja', 12], ['El búho', 8]]),
      q('pk-es-cr-04', CREATE, 'Menciona algo que ves en el cielo de noche.', [['La luna', 34], ['Las estrellas', 30], ['Los planetas', 12], ['Los aviones', 10], ['Las nubes', 8], ['Las estrellas fugaces', 6]]),
      q('pk-es-cr-05', CREATE, 'Menciona una parte del cuerpo humano que muestra un diseño increíble.', [['El cerebro', 30], ['El ojo', 24], ['El corazón', 20], ['Las manos', 14], ['Los oídos', 12]]),
      q('pk-es-cr-06', CREATE, 'Menciona un tipo de clima.', [['Lluvia', 28], ['Nieve', 22], ['Soleado', 18], ['Viento', 14], ['Tormenta eléctrica', 10], ['Neblina', 8]]),
      q('pk-es-cr-07', CREATE, 'Menciona un animal muy grande.', [['Elefante', 34], ['Jirafa', 20], ['Ballena', 18], ['Hipopótamo', 12], ['Rinoceronte', 10], ['Oso', 6]]),
      q('pk-es-cr-08', CREATE, 'Menciona algo en lo que ayudan las abejas.', [['La miel', 38], ['Polinizar las flores', 30], ['La cera', 14], ['Que crezcan las frutas', 12], ['Los jardines', 6]]),
      q('pk-es-cr-09', CREATE, 'Menciona algo de la creación que te hace querer darle gracias a Jehová.', [['Los atardeceres', 24], ['Los animales', 22], ['Las flores', 18], ['Los océanos', 14], ['Las montañas', 12], ['La comida', 10]], FINAL),
      q('pk-es-cr-10', CREATE, 'Menciona un animal que vive en el océano.', [['Ballena', 30], ['Tiburón', 24], ['Delfín', 20], ['Pulpo', 14], ['Medusa', 12]], { ...FC, alternates: [['Aguamala', 4]] }),
      q('pk-es-cr-11', CREATE, 'Menciona algo que ves en el cielo de noche.', [['La luna', 34], ['Las estrellas', 30], ['Los planetas', 16], ['Una estrella fugaz', 12], ['Un avión', 8]], { ...FC, alternates: [['Cometa', 3], ['Meteoro', 3]] }),
      q('pk-es-cr-12', CREATE, 'Menciona una fruta.', [['Manzana', 32], ['Plátano', 26], ['Naranja', 18], ['Uvas', 14], ['Fresa', 10]], { ...FC, alternates: [['Banana', 1], ['Guineo', 1], ['Frutilla', 4]] }),
      q('pk-es-cr-13', CREATE, 'Menciona una cría de animal.', [['Perrito', 32], ['Gatito', 28], ['Becerro', 16], ['Corderito', 14], ['Cachorro de oso', 10]], { ...FC, alternates: [['Cachorrito', 0], ['Ternero', 2], ['Cordero', 3], ['Osito', 4], ['Cachorro de león', 4]] }),
      q('pk-es-cr-14', CREATE, 'Menciona algo que crece en un árbol.', [['Hojas', 30], ['Manzanas', 26], ['Fruta', 18], ['Nueces', 14], ['Flores', 12]], { ...FC, alternates: [['Bellotas', 3], ['Capullos', 4]] }),
    ],
  },
  ministry: {
    name: 'El ministerio cristiano',
    description: 'Predicar las buenas noticias, de casa en casa y en todas partes.',
    questions: [
      q('pk-es-mn-01', MIN, 'Menciona una forma de dar a conocer las buenas noticias.', [['De casa en casa', 30], ['Con el exhibidor', 20], ['Por carta', 16], ['Por teléfono', 12], ['De manera informal', 12], ['Con cursos bíblicos', 10]]),
      q('pk-es-mn-02', MIN, 'Menciona una forma de empezar una conversación en la predicación.', [['Saludar', 26], ['Hacer una pregunta', 24], ['Ofrecer un tratado', 18], ['Hacer un cumplido', 12], ['Presentarse', 12], ['Hablar del clima', 8]]),
      q('pk-es-mn-03', MIN, 'Menciona un tema sobre el que la gente suele preguntar en la predicación.', [['La familia', 22], ['La esperanza para el futuro', 22], ['Por qué sufrimos', 18], ['La felicidad', 14], ['La oración', 12], ['El nombre de Dios', 12]]),
      q('pk-es-mn-04', MIN, 'Menciona algo que puedes llevar en tu maletín de predicación.', [['Biblia', 30], ['Tratados', 22], ['Invitaciones', 16], ['Tableta', 14], ['Pluma', 10], ['Agua', 8]]),
      q('pk-es-mn-05', MIN, 'Menciona una forma en que los niños pueden participar en la predicación.', [['Ofrecer un tratado', 28], ['Leer un texto bíblico', 22], ['Tocar la puerta', 18], ['Saludar', 16], ['Mostrar un video', 16]]),
      q('pk-es-mn-06', MIN, 'Menciona una cualidad que ayuda en la predicación.', [['La bondad', 26], ['La paciencia', 22], ['El valor', 18], ['La alegría', 14], ['El amor', 12], ['La apacibilidad', 8]]),
      q('pk-es-mn-07', MIN, 'Menciona un lugar donde podrías predicar de manera informal.', [['La escuela', 26], ['El trabajo', 20], ['La tienda', 18], ['El parque', 14], ['El autobús o el tren', 12], ['La sala de espera', 10]]),
      q('pk-es-mn-08', MIN, 'Menciona una herramienta de enseñanza que usamos en la predicación.', [['La Biblia', 30], ['Los videos', 24], ['Los tratados', 18], ['El libro de estudio bíblico', 16], ['Las revistas', 12]]),
      q('pk-es-mn-09', MIN, 'Menciona una forma de animar a un nuevo estudiante de la Biblia.', [['Orar con él', 24], ['Invitarlo a una reunión', 24], ['Ser su amigo', 18], ['Felicitarlo por su progreso', 16], ['Contarle una experiencia', 10], ['Tenerle paciencia', 8]], FINAL),
      q('pk-es-mn-10', MIN, 'Menciona algo que llevas a la predicación.', [['Biblia', 34], ['Tratados', 24], ['Tableta', 18], ['Invitaciones', 14], ['Agua', 10]], { ...FC, alternates: [['Teléfono', 2], ['Celular', 2]] }),
      q('pk-es-mn-11', MIN, 'Menciona una forma de predicar las buenas noticias.', [['De casa en casa', 34], ['Con el exhibidor', 22], ['Por carta', 18], ['Por teléfono', 14], ['De manera informal', 12]], { ...FC, alternates: [['Puerta en puerta', 0], ['Carrito', 1], ['Cartas', 2], ['Informal', 4]] }),
      q('pk-es-mn-12', MIN, 'Menciona un lugar donde podrías predicar de manera informal.', [['Escuela', 32], ['Trabajo', 24], ['Tienda', 18], ['Parque', 14], ['Autobús', 12]], { ...FC, alternates: [['Empleo', 1], ['Supermercado', 2], ['Tren', 4], ['Camión', 4]] }),
      q('pk-es-mn-13', MIN, 'Menciona una cualidad que ayuda en la predicación.', [['Bondad', 30], ['Paciencia', 24], ['Amor', 20], ['Valor', 14], ['Alegría', 12]], { ...FC, alternates: [['Valentía', 3], ['Gozo', 4]] }),
      q('pk-es-mn-14', MIN, 'Menciona algo que podrías decir en la puerta.', [['Hola', 34], ['Buenos días', 24], ['¿Puedo leerle un texto?', 18], ['¿Cómo está?', 14], ['Gracias', 10]], { ...FC, alternates: [['Buenas tardes', 1], ['Qué tal', 3]] }),
    ],
  },
  'bible-accounts': {
    name: 'Relatos bíblicos',
    description: 'Relatos favoritos de las Escrituras Hebreas.',
    questions: [
      q('pk-es-ba-01', ACCOUNTS, 'Menciona un animal que aparece en un relato bíblico.', [['Los leones del relato de Daniel', 24], ['El pez grande de Jonás', 22], ['La serpiente de Edén', 16], ['La burra de Balaam', 14], ['El carnero de Abrahán', 12], ['La paloma de Noé', 12]]),
      q('pk-es-ba-02', ACCOUNTS, 'Menciona algo que le pasó a José.', [['Lo vendieron sus hermanos', 24], ['Le dieron una túnica especial', 22], ['Lo metieron en la cárcel', 18], ['Explicó sueños', 16], ['Llegó a gobernar en Egipto', 14], ['Perdonó a sus hermanos', 6]]),
      q('pk-es-ba-03', ACCOUNTS, 'Menciona una de las plagas de Egipto.', [['El agua se convirtió en sangre', 24], ['Ranas', 22], ['Langostas', 16], ['Oscuridad', 14], ['Granizo', 10], ['Mosquitos', 8], ['Úlceras', 6]]),
      q('pk-es-ba-04', ACCOUNTS, 'Menciona algo que Noé metió en el arca.', [['Animales', 34], ['Su familia', 26], ['Comida', 20], ['Aves', 12], ['Agua', 8]]),
      q('pk-es-ba-05', ACCOUNTS, 'Menciona una forma en que Jehová cuidó a los israelitas en el desierto.', [['El maná', 30], ['Agua de una roca', 22], ['Abrió el mar Rojo', 18], ['Una columna de nube y de fuego', 14], ['Codornices', 10], ['Su ropa no se gastó', 6]], {
        notes: 'Deuteronomio 8:4 menciona que su ropa no se gastó.',
      }),
      q('pk-es-ba-06', ACCOUNTS, 'Menciona algo por lo que se conoce a David.', [['Enfrentarse a Goliat', 30], ['Ser pastor', 20], ['Tocar el arpa', 18], ['Ser rey', 16], ['Escribir salmos', 16]]),
      q('pk-es-ba-07', ACCOUNTS, 'Menciona algo que hizo Daniel.', [['Oró a Jehová', 30], ['Lo echaron al foso de los leones', 26], ['Explicó sueños', 18], ['Rechazó la comida del rey', 14], ['Leyó la escritura en la pared', 12]]),
      q('pk-es-ba-08', ACCOUNTS, 'Menciona a alguien que fue valiente por Jehová cuando era joven.', [['David', 30], ['Daniel', 22], ['Samuel', 16], ['Josías', 12], ['Ester', 12], ['La niña que ayudó a Naamán', 8]], {
        notes: 'La niña israelita aparece en 2 Reyes 5:2, 3.',
      }),
      q('pk-es-ba-09', ACCOUNTS, 'Menciona una lección del relato de Jonás.', [['Obedecer a Jehová', 30], ['Jehová es misericordioso', 24], ['No podemos escondernos de Jehová', 18], ['Orar cuando tenemos problemas', 16], ['Interesarnos por los demás', 12]], FINAL),
      q('pk-es-ba-10', ACCOUNTS, 'Menciona una de las plagas de Egipto.', [['Ranas', 30], ['El agua en sangre', 26], ['Langostas', 18], ['Oscuridad', 14], ['Granizo', 12]], { ...FC, alternates: [['Sangre', 1], ['Saltamontes', 2], ['Tinieblas', 3]] }),
      q('pk-es-ba-11', ACCOUNTS, 'Menciona algo que le pasó a José.', [['Lo vendieron sus hermanos', 30], ['Lo metieron en la cárcel', 24], ['Llegó a gobernar en Egipto', 20], ['Explicó sueños', 14], ['Recibió una túnica especial', 12]], {
        ...FC,
        alternates: [['Fue a la cárcel', 1], ['Prisión', 1], ['Gobernó Egipto', 2], ['Túnica', 4], ['Túnica de colores', 4]],
      }),
      q('pk-es-ba-12', ACCOUNTS, 'Menciona algo que Jehová les dio a los israelitas en el desierto.', [['Maná', 36], ['Agua', 24], ['Codornices', 18], ['La Ley', 12], ['Guía', 10]], {
        ...FC,
        alternates: [['Pan del cielo', 0], ['Comida', 0], ['Diez Mandamientos', 3], ['Columna de nube', 4]],
      }),
      q('pk-es-ba-13', ACCOUNTS, 'Menciona algo sobre el arca de Noé.', [['Animales', 32], ['Madera', 22], ['El Diluvio', 20], ['Lluvia', 14], ['Arcoíris', 12]], FC),
      q('pk-es-ba-14', ACCOUNTS, 'Menciona a alguien de la Biblia que oró.', [['Daniel', 30], ['Jesús', 26], ['Ana', 16], ['David', 16], ['Nehemías', 12]], FC),
    ],
  },
  'family-life': {
    name: 'La vida en familia',
    description: 'Ayudar en casa, la bondad, el perdón y las cualidades de Jehová.',
    questions: [
      q('pk-es-fl-01', FAMILY, 'Menciona una forma en que los niños pueden ayudar en casa.', [['Limpiar su cuarto', 28], ['Lavar los platos', 22], ['Sacar la basura', 16], ['Doblar la ropa', 14], ['Ayudar a cocinar', 12], ['Darle de comer a la mascota', 8]]),
      q('pk-es-fl-02', FAMILY, 'Menciona una forma de mostrarles respeto a tus padres.', [['Obedecer', 30], ['Escuchar', 24], ['Dar las gracias', 16], ['Ayudar sin que te lo pidan', 14], ['Hablar con amabilidad', 10], ['Decir la verdad', 6]]),
      q('pk-es-fl-03', FAMILY, 'Menciona algo que hace feliz a una familia.', [['Pasar tiempo juntos', 26], ['La adoración en familia', 22], ['Reírse juntos', 18], ['Comer juntos', 14], ['Las palabras amables', 12], ['Perdonarse', 8]]),
      q('pk-es-fl-04', FAMILY, 'Menciona una forma de mostrar paciencia.', [['Esperar tu turno', 30], ['Mantener la calma', 24], ['Escuchar', 18], ['No interrumpir', 14], ['Perdonar', 14]]),
      q('pk-es-fl-05', FAMILY, 'Menciona algo que puedes hacer cuando lastimas los sentimientos de alguien.', [['Decir "lo siento"', 38], ['Pedir perdón', 22], ['Dar un abrazo', 16], ['Arreglar las cosas', 14], ['Orar sobre el asunto', 10]]),
      q('pk-es-fl-06', FAMILY, 'Menciona una forma de ser un buen amigo.', [['Compartir', 26], ['Escuchar', 22], ['Ser amable', 18], ['Animarlo', 16], ['Perdonar', 12], ['Ser leal', 6]]),
      q('pk-es-fl-07', FAMILY, 'Menciona algo por lo que una familia puede orar junta.', [['Dar gracias por la comida', 26], ['Los miembros de la familia', 22], ['Nuestros hermanos', 18], ['Ayuda con los problemas', 16], ['La predicación', 12], ['La seguridad', 6]]),
      q('pk-es-fl-08', FAMILY, 'Menciona una cualidad que muestra Jehová.', [['El amor', 34], ['La sabiduría', 18], ['La justicia', 18], ['El poder', 14], ['La misericordia', 10], ['La paciencia', 6]]),
      q('pk-es-fl-09', FAMILY, 'Menciona una forma de hacer divertida la adoración en familia.', [['Jugar un juego', 26], ['Actuar un relato bíblico', 18], ['Hacer dibujos', 18], ['Comer un bocadillo', 14], ['Ver un video', 14], ['Dejar que los niños elijan el tema', 10]], FINAL),
      q('pk-es-fl-10', FAMILY, 'Menciona un quehacer que hacen los niños en casa.', [['Limpiar su cuarto', 32], ['Lavar los platos', 24], ['Sacar la basura', 18], ['Lavar la ropa', 14], ['Darle de comer a la mascota', 12]], {
        ...FC,
        alternates: [['Tender la cama', 0], ['Hacer la cama', 0], ['Platos', 1], ['Basura', 2], ['Doblar la ropa', 3]],
      }),
      q('pk-es-fl-11', FAMILY, 'Menciona algo que dices cuando cometes un error.', [['Lo siento', 40], ['¡Ups!', 22], ['Perdóname', 18], ['Fue mi culpa', 12], ['Yo lo arreglo', 8]], { ...FC, alternates: [['Perdón', 0], ['Disculpa', 0], ['Discúlpame', 2]] }),
      q('pk-es-fl-12', FAMILY, 'Menciona una cualidad que tiene Jehová.', [['Amor', 36], ['Sabiduría', 22], ['Justicia', 18], ['Poder', 14], ['Misericordia', 10]], FC),
      q('pk-es-fl-13', FAMILY, 'Menciona algo que hacen las familias juntas durante la cena.', [['Comer', 30], ['Platicar', 26], ['Orar', 22], ['Reír', 12], ['Contar cómo les fue', 10]], { ...FC, alternates: [['Conversar', 1], ['Hablar', 1], ['Oración', 2]] }),
      q('pk-es-fl-14', FAMILY, 'Menciona una forma de mostrarle amor a tu familia.', [['Abrazarlos', 30], ['Ayudarlos', 24], ['Decir "te quiero"', 20], ['Pasar tiempo juntos', 14], ['Darles un regalo', 12]], { ...FC, alternates: [['Abrazos', 0], ['Te quiero', 2], ['Te amo', 2]] }),
    ],
  },
  'bible-places': {
    name: 'Lugares bíblicos',
    description: 'Ciudades, mares, montañas y tierras de la Biblia.',
    questions: [
      q('pk-es-bp-01', PLACES, 'Menciona una ciudad de la Biblia.', [['Jerusalén', 30], ['Belén', 20], ['Nazaret', 14], ['Babilonia', 12], ['Jericó', 10], ['Nínive', 8], ['Roma', 6]]),
      q('pk-es-bp-02', PLACES, 'Menciona un mar o un río de la Biblia.', [['El mar Rojo', 30], ['El río Jordán', 24], ['El mar de Galilea', 18], ['El río Nilo', 12], ['El mar Salado', 10], ['El río Éufrates', 6]], {
        notes: 'Hoy al mar Salado se le llama mar Muerto.',
        alternates: [['Mar Muerto', 4]],
      }),
      q('pk-es-bp-03', PLACES, 'Menciona un monte de la Biblia.', [['El monte Sinaí', 34], ['El monte de los Olivos', 20], ['Los montes de Ararat', 16], ['El monte Carmelo', 14], ['El monte Sion', 10], ['El monte Hermón', 6]]),
      q('pk-es-bp-04', PLACES, 'Menciona un país o una tierra de la Biblia.', [['Egipto', 30], ['Israel', 24], ['Canaán', 18], ['Persia', 12], ['Asiria', 10], ['Moab', 6]]),
      q('pk-es-bp-05', PLACES, 'Menciona un lugar que visitó el apóstol Pablo.', [['Roma', 26], ['Corinto', 18], ['Éfeso', 18], ['Atenas', 14], ['Filipos', 12], ['Antioquía', 12]]),
      q('pk-es-bp-06', PLACES, 'Menciona un lugar donde pasó un acontecimiento bíblico famoso.', [['El mar Rojo', 26], ['Jericó', 22], ['Belén', 20], ['El monte Sinaí', 14], ['El jardín de Edén', 12], ['Babel', 6]]),
      q('pk-es-bp-07', PLACES, 'Menciona un lugar relacionado con Abrahán.', [['Ur', 30], ['Canaán', 24], ['Harán', 18], ['Egipto', 12], ['Hebrón', 10], ['Moria', 6]]),
      q('pk-es-bp-08', PLACES, 'Menciona un lugar donde Jesús hizo un milagro.', [['Caná', 26], ['Capernaúm', 22], ['El mar de Galilea', 20], ['Betania', 16], ['Jerusalén', 10], ['Naín', 6]]),
      q('pk-es-bp-09', PLACES, 'Menciona un lugar bíblico que te gustaría visitar.', [['Jerusalén', 28], ['El jardín de Edén', 22], ['El mar de Galilea', 18], ['Belén', 14], ['El monte Sinaí', 10], ['Egipto', 8]], FINAL),
      q('pk-es-bp-10', PLACES, 'Menciona una ciudad de la Biblia.', [['Jerusalén', 34], ['Belén', 24], ['Nazaret', 18], ['Babilonia', 14], ['Jericó', 10]], FC),
      q('pk-es-bp-11', PLACES, 'Menciona un mar o un río de la Biblia.', [['Mar Rojo', 32], ['Río Jordán', 26], ['Mar de Galilea', 20], ['Nilo', 12], ['Mar Muerto', 10]], { ...FC, alternates: [['Mar Salado', 4], ['Jordán', 1]] }),
      q('pk-es-bp-12', PLACES, 'Menciona un monte de la Biblia.', [['Monte Sinaí', 36], ['Monte de los Olivos', 24], ['Monte Ararat', 18], ['Monte Carmelo', 12], ['Monte Sion', 10]], FC),
      q('pk-es-bp-13', PLACES, 'Menciona un país de la Biblia.', [['Egipto', 36], ['Israel', 28], ['Canaán', 16], ['Persia', 12], ['Grecia', 8]], FC),
      q('pk-es-bp-14', PLACES, 'Menciona un lugar al que viajó Pablo.', [['Roma', 32], ['Éfeso', 22], ['Corinto', 20], ['Atenas', 16], ['Filipos', 10]], FC),
    ],
  },
  'paradise-hope': {
    name: 'La esperanza del Paraíso',
    description: 'Lo que la Biblia promete sobre la vida en una tierra paradisíaca.',
    questions: [
      q('pk-es-ph-01', HOPE, 'Menciona algo que esperas con ilusión en el Paraíso.', [['Volver a ver a los seres queridos', 28], ['No más enfermedades', 22], ['Paz con los animales', 18], ['Jardines hermosos', 14], ['Vivir para siempre', 12], ['No más lágrimas', 6]], {
        notes: 'Apocalipsis 21:4; Isaías 11:6-9; Hechos 24:15.',
      }),
      q('pk-es-ph-02', HOPE, 'Menciona un animal que te gustaría acariciar en el Paraíso.', [['León', 32], ['Tigre', 18], ['Oso', 16], ['Elefante', 12], ['Panda', 12], ['Lobo', 10]], { notes: 'Isaías 11:6-9.' }),
      q('pk-es-ph-03', HOPE, 'Menciona algo que ya no existirá en el Paraíso.', [['La enfermedad', 28], ['La muerte', 22], ['El llanto', 16], ['La guerra', 14], ['El dolor', 12], ['El hambre', 8]], {
        notes: 'Apocalipsis 21:4; Salmo 46:9; Salmo 72:16; Isaías 33:24.',
      }),
      q('pk-es-ph-04', HOPE, 'Menciona a una persona fiel de la Biblia que quieres conocer en la resurrección.', [['David', 22], ['Noé', 20], ['Daniel', 18], ['Ester', 14], ['Moisés', 14], ['Abrahán', 12]], {
        notes: 'Hechos 24:15.',
      }),
      q('pk-es-ph-05', HOPE, 'Menciona algo que harán las personas en el Paraíso.', [['Plantar huertos', 24], ['Construir casas', 22], ['Recibir a los resucitados', 18], ['Disfrutar de buena comida', 16], ['Jugar con los animales', 12], ['Aprender cosas nuevas', 8]], {
        notes: 'Isaías 65:21, 22.',
      }),
      q('pk-es-ph-06', HOPE, 'Menciona un texto bíblico que describe el Paraíso.', [['Apocalipsis 21:4', 30], ['Isaías 11:6-9', 20], ['Isaías 65:21, 22', 16], ['Salmo 37:29', 14], ['Isaías 35:5, 6', 12], ['Isaías 33:24', 8]]),
      q('pk-es-ph-07', HOPE, 'Menciona algo que te gustaría aprender en el Paraíso.', [['Tocar un instrumento', 24], ['Otro idioma', 20], ['Todo sobre los animales', 18], ['Cómo construir cosas', 14], ['Jardinería', 14], ['Pintar', 10]]),
      q('pk-es-ph-08', HOPE, 'Menciona una promesa que hace Jehová sobre el futuro.', [['Ya no habrá muerte', 28], ['Una tierra paradisíaca', 24], ['La resurrección', 18], ['Paz en todas partes', 14], ['Salud perfecta', 10], ['Comida en abundancia', 6]]),
      q('pk-es-ph-09', HOPE, 'Menciona lo primero que te gustaría hacer en el Paraíso.', [['Ver a mis familiares', 28], ['Abrazar a un animal', 22], ['Explorar', 18], ['Darle gracias a Jehová', 16], ['Comer algo delicioso', 10], ['Descansar', 6]], FINAL),
      q('pk-es-ph-10', HOPE, 'Menciona algo que ya no existirá en el Paraíso.', [['Enfermedad', 32], ['Muerte', 26], ['Llanto', 18], ['Dolor', 14], ['Guerra', 10]], { ...FC, alternates: [['Estar enfermo', 0], ['Lágrimas', 2], ['Tristeza', 2]] }),
      q('pk-es-ph-11', HOPE, 'Menciona un animal que te gustaría abrazar en el Paraíso.', [['León', 34], ['Tigre', 20], ['Oso', 18], ['Elefante', 16], ['Panda', 12]], FC),
      q('pk-es-ph-12', HOPE, 'Menciona algo que harán las personas en el Paraíso.', [['Cultivar huertos', 30], ['Construir casas', 24], ['Recibir a los resucitados', 20], ['Comer buena comida', 14], ['Explorar', 12]], {
        ...FC,
        alternates: [['Plantar', 0], ['Sembrar', 0], ['Construir hogares', 1], ['Resurrección', 2]],
      }),
      q('pk-es-ph-13', HOPE, 'Menciona a una persona fiel que te gustaría conocer en la resurrección.', [['David', 28], ['Noé', 24], ['Daniel', 20], ['Moisés', 16], ['Ester', 12]], FC),
      q('pk-es-ph-14', HOPE, 'Menciona algo que verás en el Paraíso.', [['Animales', 30], ['Jardines', 26], ['Familia', 22], ['Montañas', 12], ['Ríos', 10]], { ...FC, alternates: [['Flores', 1], ['Seres queridos', 2]] }),
    ],
  },
  ...ERA_PACKS_ES,
};
