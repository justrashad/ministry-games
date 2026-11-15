import { clue, type QuestionPack } from './clueBuilder';

/* Every answer and reference was checked against the New World Translation (Spanish edition) on jw.org. */

const PEOPLE = 'Personajes bíblicos';
const ANIMALS = 'Animales';
const NUMBERS = 'Números';
const PLACES = 'Lugares bíblicos';
const JESUS = 'Jesús';
const BOOKS = 'Libros de la Biblia';
const WOMEN = 'Mujeres de fe';
const KINGS = 'Reyes';
const PROPHETS = 'Profetas';
const EARLY = 'Los primeros cristianos';
const BONUS = 'Pregunta extra';

export const STARTER_PACK_ES: QuestionPack = {
  id: 'starter',
  name: 'Paquete inicial',
  description: 'Sesenta preguntas en cinco etapas de crecimiento, de Recién nacido a Maduro, y preguntas extra.',
  questions: [
    // Recién nacido
    clue('sb-n1', PEOPLE, 1, '¿Quién fue la primera mujer?', 'Eva', 'Génesis 3:20'),
    clue('sb-n2', ANIMALS, 1, 'Jesús entró en Jerusalén montado en este animal.', 'Un burro', 'Mateo 21:5, 7', ['Burro', 'Un burrito']),
    clue('sb-n3', NUMBERS, 1, '¿Cuántos hijos tuvo Noé?', '3', 'Génesis 6:10', ['Tres']),
    clue('sb-n4', PLACES, 1, 'Jesús caminó sobre este mar.', 'El mar de Galilea', 'Juan 6:1, 19', ['Mar de Galilea', 'Mar de Tiberíades']),
    clue('sb-n5', JESUS, 1, 'El esposo de María, la madre de Jesús.', 'José', 'Mateo 1:16'),
    clue('sb-n6', BOOKS, 1, '¿Cuántos libros tiene la Biblia?', '66', undefined, ['Sesenta y seis']),
    clue('sb-n7', PEOPLE, 1, 'Jehová le dijo a este hombre que construyera un arca.', 'Noé', 'Génesis 6:13, 14'),
    clue('sb-n8', ANIMALS, 1, 'Cuando David era pastor, un oso y este animal se llevaron ovejas del rebaño de su padre.', 'Un león', '1 Samuel 17:34, 35', ['León']),
    clue('sb-n9', PEOPLE, 1, 'Mató a su hermano Abel.', 'Caín', 'Génesis 4:8'),
    clue('sb-n10', NUMBERS, 1, '¿Cuántos mandamientos escribió Jehová en dos tablas de piedra?', '10', 'Deuteronomio 4:13', ['Diez']),
    clue('sb-n11', JESUS, 1, 'Jesús dijo que él es esta clase de pastor, uno que entrega su vida por las ovejas.', 'El pastor excelente', 'Juan 10:11', ['Excelente']),
    clue('sb-n12', PLACES, 1, 'La gente construyó allí una ciudad y una torre, y Jehová confundió su idioma.', 'Babel', 'Génesis 11:4, 9'),
    // Bebé
    clue('sb-t1', PEOPLE, 2, 'Le dijo a Dalila que, si le afeitaban la cabeza, perdería sus fuerzas.', 'Sansón', 'Jueces 16:4, 17'),
    clue('sb-t2', ANIMALS, 2, 'La primera ave que Noé mandó afuera del arca.', 'Un cuervo', 'Génesis 8:6, 7', ['Cuervo']),
    clue('sb-t3', NUMBERS, 2, '¿Cuántos hijos tuvo Jacob?', '12', 'Génesis 35:22', ['Doce']),
    clue('sb-t4', PLACES, 2, 'Diez de los hermanos de José bajaron a este país a comprar grano.', 'Egipto', 'Génesis 42:3'),
    clue('sb-t5', JESUS, 2, 'Los discípulos se asustaron cuando vieron a Jesús haciendo esto de noche.', 'Caminar sobre el mar', 'Mateo 14:25, 26', ['Caminando sobre el agua', 'Caminar sobre el agua']),
    clue('sb-t6', WOMEN, 2, 'Tras cruzar el mar Rojo, esta profetisa, hermana de Aarón, tomó una pandereta, y todas las mujeres salieron tras ella.', 'Míriam', 'Éxodo 15:20, 21'),
    clue('sb-t7', BOOKS, 2, 'El libro que viene justo después de Génesis.', 'Éxodo'),
    clue('sb-t8', ANIMALS, 2, 'Jesús dejó que los demonios entraran en una manada de estos animales.', 'Cerdos', 'Mateo 8:31, 32', ['Puercos']),
    clue('sb-t9', PEOPLE, 2, 'Sus hermanos lo echaron en una cisterna. Más tarde, el faraón lo puso a cargo de toda la tierra de Egipto.', 'José', 'Génesis 37:24; 41:41'),
    clue('sb-t10', NUMBERS, 2, '¿En qué día después de su muerte fue resucitado Jesús?', 'Al tercer día', '1 Corintios 15:4', ['Tercer día', 'Tres']),
    clue('sb-t11', PLACES, 2, 'Saulo iba llegando a esta ciudad cuando una luz del cielo lo envolvió de repente.', 'Damasco', 'Hechos 9:3'),
    clue('sb-t12', JESUS, 2, 'Jesús les lavó los pies a sus discípulos y se los secó con esto.', 'Una toalla', 'Juan 13:5', ['Toalla']),
    // Niño
    clue('sb-c1', KINGS, 3, 'Durante el gran banquete de este rey, aparecieron los dedos de la mano de un hombre y escribieron en la pared.', 'Belsasar', 'Daniel 5:1, 5'),
    clue('sb-c2', PROPHETS, 3, 'Este profeta ungió a David delante de sus hermanos.', 'Samuel', '1 Samuel 16:13'),
    clue('sb-c3', NUMBERS, 3, '¿Cuántos años estuvo Israel en el desierto?', '40', 'Números 14:33', ['Cuarenta']),
    clue('sb-c4', PLACES, 3, 'En esta ciudad, Pablo y Silas estaban alabando a Dios con canciones en la cárcel cuando un terremoto abrió todas las puertas.', 'Filipos', 'Hechos 16:12, 25, 26'),
    clue('sb-c5', WOMEN, 3, 'Esta esposa de Abrahán dio a luz un hijo cuando tenía unos 90 años.', 'Sara', 'Génesis 17:17; 21:2'),
    clue('sb-c6', ANIMALS, 3, 'Jehová trajo estos insectos sobre la tierra de Egipto como la octava plaga.', 'Langostas', 'Éxodo 10:12-14'),
    clue('sb-c7', BOOKS, 3, '¿Cuántos Evangelios hay en la Biblia?', '4', undefined, ['Cuatro']),
    clue('sb-c8', JESUS, 3, 'Jesús dijo que a este discípulo lo llamarían Cefas.', 'Simón Pedro', 'Juan 1:42', ['Pedro', 'Simón']),
    clue('sb-c9', PROPHETS, 3, 'Jehová envió a este profeta a Sarepta, donde una viuda le daría de comer.', 'Elías', '1 Reyes 17:1, 9, 10'),
    clue('sb-c10', PEOPLE, 3, 'El sobrino de Abrahán. Unos ángeles lo sacaron de Sodoma junto con su familia.', 'Lot', 'Génesis 12:5; 19:1, 15, 16'),
    clue('sb-c11', NUMBERS, 3, '¿Cuántas veces se sumergió Naamán en el Jordán?', '7', '2 Reyes 5:14', ['Siete']),
    clue('sb-c12', PLACES, 3, 'Cuando Jesús llegó cerca de esta ciudad y la vio, lloró por ella.', 'Jerusalén', 'Lucas 19:28, 41'),
    // Joven
    clue('sb-y1', KINGS, 4, 'Como señal para este rey de Judá, Jehová hizo que la sombra de la escalera de Acaz retrocediera 10 escalones.', 'Ezequías', '2 Reyes 20:8, 11'),
    clue('sb-y2', PROPHETS, 4, 'Guehazí era el sirviente de este profeta.', 'Eliseo', '2 Reyes 5:20'),
    clue('sb-y3', WOMEN, 4, 'Esta esposa de Héber mató a Sísara con una estaca de tienda.', 'Jael', 'Jueces 4:21'),
    clue('sb-y4', NUMBERS, 4, '¿Cuántos años tenía Abrahán cuando nació su hijo Isaac?', '100', 'Génesis 21:5', ['Cien']),
    clue('sb-y5', PLACES, 4, 'Moisés huyó del faraón a esta tierra, donde llegó a ser pastor.', 'Madián', 'Éxodo 2:15; 3:1'),
    clue('sb-y6', EARLY, 4, 'Este matrimonio se quedó con parte del dinero de su campo y mintió. Di los dos nombres.', 'Ananías y Safira', 'Hechos 5:1-10', ['Safira y Ananías']),
    clue('sb-y7', JESUS, 4, 'Este jefe de los cobradores de impuestos se subió a un sicómoro para ver a Jesús.', 'Zaqueo', 'Lucas 19:2-4'),
    clue('sb-y8', ANIMALS, 4, 'Jesús dijo que ni uno de estos pájaros cae a tierra sin que el Padre lo sepa.', 'Los gorriones', 'Mateo 10:29', ['Gorriones', 'Gorrión']),
    clue('sb-y9', PEOPLE, 4, 'El padre de Juan el Bautista.', 'Zacarías', 'Lucas 1:13'),
    clue('sb-y10', BOOKS, 4, 'Este libro lleva el nombre de una reina que se presentó ante el rey, aunque la ley lo prohibía, para interceder por su pueblo.', 'Ester', 'Ester 4:8, 16'),
    clue('sb-y11', KINGS, 4, 'Este rey de Israel se casó con Jezabel.', 'Acab', '1 Reyes 16:30, 31'),
    clue('sb-y12', EARLY, 4, 'Felipe se metió en el agua con este hombre que viajaba en un carro y lo bautizó.', 'Un eunuco etíope', 'Hechos 8:27, 38', ['El etíope', 'El eunuco']),
    // Maduro
    clue('sb-m1', PROPHETS, 5, 'Jehová le dijo a este profeta que se acostara sobre su lado izquierdo por 390 días.', 'Ezequiel', 'Ezequiel 4:4, 5'),
    clue('sb-m2', KINGS, 5, 'Este hombre fue rey en Tirzá por siete días.', 'Zimrí', '1 Reyes 16:15'),
    clue('sb-m3', WOMEN, 5, 'En tiempos del rey Josías, el sacerdote Hilquías y otros fueron a ver a esta profetisa.', 'Huldá', '2 Reyes 22:14'),
    clue('sb-m4', NUMBERS, 5, '¿Cuántas personas había en el barco con Pablo antes de que encallara?', '276', 'Hechos 27:37'),
    clue('sb-m5', PLACES, 5, 'Pablo se puso de pie en medio del Areópago y les habló a los hombres de esta ciudad.', 'Atenas', 'Hechos 17:22'),
    clue('sb-m6', EARLY, 5, 'Este joven se quedó dormido mientras Pablo hablaba y se cayó desde el tercer piso.', 'Eutico', 'Hechos 20:9'),
    clue('sb-m7', PEOPLE, 5, 'Este hombre de la familia de la casa de Saúl le gritó maldiciones al rey David y le tiró piedras.', 'Simeí', '2 Samuel 16:5, 6'),
    clue('sb-m8', JESUS, 5, 'Cerca de la puerta de esta ciudad, Jesús resucitó al único hijo de una viuda.', 'Naín', 'Lucas 7:11-15'),
    clue('sb-m9', ANIMALS, 5, 'El Dios verdadero mandó este animal para que atacara la calabaza vinatera que le daba sombra a Jonás.', 'Un gusano', 'Jonás 4:6, 7', ['Gusano']),
    clue('sb-m10', BOOKS, 5, 'En esta carta corta, Pablo rogó a favor de su hijo Onésimo.', 'Filemón', 'Filemón 10'),
    clue('sb-m11', PROPHETS, 5, 'Este profeta dijo que era pastor y que cuidaba de los sicómoros.', 'Amós', 'Amós 7:14'),
    clue('sb-m12', KINGS, 5, 'Este rey de Persia proclamó que los judíos podían subir a Jerusalén y reconstruir la casa de Jehová.', 'Ciro', 'Esdras 1:1-3'),
  ],
  bonus: [
    clue('sb-b1', BONUS, 5, 'Este sacerdote estaba en Siló cuando el pequeño Samuel servía a Jehová.', 'Elí', '1 Samuel 1:9; 3:1'),
    clue('sb-b2', BONUS, 5, 'Este rey de Salem, sacerdote del Dios Altísimo, bendijo a Abrán.', 'Melquisedec', 'Génesis 14:18, 19'),
    clue('sb-b3', BONUS, 5, 'Nuestro Señor era descendiente de esta tribu.', 'Judá', 'Hebreos 7:14'),
    clue('sb-b4', BONUS, 5, 'Quedarán la fe, la esperanza y esta otra cosa, y la mayor de todas es esta.', 'El amor', '1 Corintios 13:13', ['Amor']),
  ],
};
