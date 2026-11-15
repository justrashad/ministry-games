import { myth, truth, type StatementPack } from './statementBuilder';

/*
 * Paquete inicial en español neutro de Latinoamérica. Los ids son los mismos del
 * paquete en inglés (starterPack.ts): cada afirmación traduce la del mismo id.
 * Las citas indican el texto bíblico en que se basa la respuesta; no se copia el texto.
 */

const ACCOUNTS = 'Relatos bíblicos';
const JESUS = 'La vida de Jesús';
const PEOPLE = 'Personajes bíblicos';
const PLACES = 'Lugares bíblicos';
const CREATION = 'La creación y los animales';
const EARLY = 'La congregación primitiva';

export const STARTER_PACK_ES: StatementPack = {
  id: 'starter',
  name: 'Paquete inicial',
  description: 'Sesenta afirmaciones de verdadero o falso para toda la familia, desde relatos muy conocidos hasta temas de estudio más profundo.',
  statements: [
    truth('ks-acc-1', ACCOUNTS, 1, 'Noé construyó un arca antes del Diluvio.', 'Génesis 6:14'),
    myth('ks-acc-2', ACCOUNTS, 1, 'David derribó a Goliat con una flecha.', 'Lo derribó con una piedra de su honda, y después usó la espada de Goliat para asegurarse de que muriera.', '1 Samuel 17:49-51'),
    truth('ks-acc-3', ACCOUNTS, 2, 'La muralla de Jericó se desplomó después de que Israel marchó alrededor de la ciudad durante siete días.', 'Josué 6:15, 20'),
    myth('ks-acc-4', ACCOUNTS, 2, 'Jonás intentó huir a Nínive.', 'Jehová envió a Jonás a Nínive. Jonás intentó huir a Tarsis.', 'Jonás 1:2, 3'),
    truth('ks-acc-5', ACCOUNTS, 3, 'A Daniel lo arrojaron al foso de los leones porque siguió orándole a Jehová.', 'Daniel 6:10, 16'),
    myth('ks-acc-6', ACCOUNTS, 3, 'Los hermanos de José lo vendieron al faraón.', 'Se lo vendieron a los ismaelitas por 20 piezas de plata, y ellos se lo llevaron a Egipto.', 'Génesis 37:27, 28'),
    truth('ks-acc-7', ACCOUNTS, 4, 'El ejército de Gedeón se redujo a 300 hombres antes de la batalla contra Madián.', 'Jueces 7:7'),
    myth('ks-acc-8', ACCOUNTS, 4, 'Sansón perdió su fuerza cuando le sacaron los ojos.', 'Perdió su fuerza después de que le cortaron las siete trenzas.', 'Jueces 16:19'),
    truth('ks-acc-9', ACCOUNTS, 5, 'Elías desafió a los profetas de Baal en el monte Carmelo.', '1 Reyes 18:19, 20'),
    myth('ks-acc-10', ACCOUNTS, 5, 'El sol se detuvo durante una batalla dirigida por Moisés.', 'Sucedió durante una batalla dirigida por Josué.', 'Josué 10:12, 13'),

    truth('ks-jesus-1', JESUS, 1, 'Jesús nació en Belén.', 'Mateo 2:1'),
    myth('ks-jesus-2', JESUS, 1, 'Jesús se crio en la ciudad de Jerusalén.', 'Se crio en Nazaret.', 'Lucas 2:39, 51'),
    truth('ks-jesus-3', JESUS, 2, 'Jesús convirtió agua en vino en un banquete de boda en Caná.', 'Juan 2:1-11'),
    myth('ks-jesus-4', JESUS, 2, 'Jesús escogió a 10 apóstoles.', 'Escogió a 12 apóstoles.', 'Lucas 6:13'),
    truth('ks-jesus-5', JESUS, 3, 'Jesús alimentó a miles de personas con cinco panes y dos pescados.', 'Mateo 14:17-21'),
    myth('ks-jesus-6', JESUS, 3, 'Jesús se bautizó en el mar Rojo.', 'Se bautizó en el río Jordán.', 'Mateo 3:13'),
    truth('ks-jesus-7', JESUS, 4, 'Jesús resucitó a Lázaro cuando ya llevaba cuatro días muerto.', 'Juan 11:17, 43, 44'),
    myth('ks-jesus-8', JESUS, 4, 'Pedro negó conocer a Jesús dos veces.', 'Pedro negó conocer a Jesús tres veces.', 'Mateo 26:75'),
    truth('ks-jesus-9', JESUS, 5, 'Andrés y su hermano Pedro eran pescadores cuando Jesús los llamó.', 'Mateo 4:18, 19'),
    myth('ks-jesus-10', JESUS, 5, 'En la ilustración de Jesús sobre el samaritano que actuó como prójimo, un sacerdote se detuvo a ayudar al hombre herido.', 'El sacerdote pasó de largo por el otro lado del camino. El samaritano fue quien lo ayudó.', 'Lucas 10:31-34'),

    truth('ks-people-1', PEOPLE, 1, 'Adán fue el primer hombre.', 'Génesis 2:7'),
    truth('ks-people-2', PEOPLE, 1, 'Aarón era hermano de Moisés.', 'Éxodo 4:14'),
    truth('ks-people-3', PEOPLE, 2, 'Matusalén vivió más que cualquier otra persona de la que habla la Biblia.', 'Génesis 5:27'),
    myth('ks-people-4', PEOPLE, 2, 'Rut era de la tierra de Egipto.', 'Rut era de Moab.', 'Rut 1:4'),
    truth('ks-people-5', PEOPLE, 3, 'Ester llegó a ser reina de Persia.', 'Ester 1:3; 2:17'),
    myth('ks-people-6', PEOPLE, 3, 'La esposa de Abrahán se llamaba Raquel.', 'La esposa de Abrahán era Sara. Raquel era la esposa de Jacob.', 'Génesis 17:15; 29:28'),
    myth('ks-people-7', PEOPLE, 4, 'Samuel ya era adulto cuando empezó a servir delante de Jehová.', 'Servía delante de Jehová aunque solo era un niño.', '1 Samuel 2:18'),
    myth('ks-people-8', PEOPLE, 4, 'El rey Saúl era de la tribu de Judá.', 'Saúl era de la tribu de Benjamín.', '1 Samuel 9:1, 2'),
    truth('ks-people-9', PEOPLE, 5, 'Enoc anduvo con el Dios verdadero.', 'Génesis 5:24'),
    myth('ks-people-10', PEOPLE, 5, 'Moisés llevó a Israel a la Tierra Prometida.', 'Moisés vio la tierra desde una montaña, pero no entró en ella. Josué llevó a Israel a la tierra.', 'Deuteronomio 34:4; Josué 1:2'),

    truth('ks-places-1', PLACES, 1, 'Adán y Eva vivieron en el jardín de Edén.', 'Génesis 2:8'),
    myth('ks-places-2', PLACES, 1, 'Moisés recibió los Diez Mandamientos en el monte Carmelo.', 'Los recibió en el monte Sinaí.', 'Éxodo 19:20; 31:18'),
    truth('ks-places-3', PLACES, 2, 'El arca de Noé se detuvo sobre las montañas de Ararat.', 'Génesis 8:4'),
    myth('ks-places-4', PLACES, 2, 'Jehová envió a Jonás a predicar en Babilonia.', 'Jehová lo envió a Nínive.', 'Jonás 1:2'),
    truth('ks-places-5', PLACES, 3, 'En Antioquía se llamó cristianos por primera vez a los discípulos.', 'Hechos 11:26'),
    myth('ks-places-6', PLACES, 3, 'El apóstol Juan recibió la Revelación en la isla de Chipre.', 'Estaba en la isla de Patmos.', 'Apocalipsis 1:9'),
    myth('ks-places-7', PLACES, 4, 'El río Jordán desemboca en el mar Mediterráneo.', 'Desemboca en el mar Salado, también llamado mar Muerto.', 'Josué 3:16'),
    truth('ks-places-8', PLACES, 4, 'Abrahán vino de la ciudad de Ur.', 'Génesis 11:31'),
    truth('ks-places-9', PLACES, 5, 'El apóstol Pablo era de la ciudad de Tarso.', 'Hechos 21:39'),
    myth('ks-places-10', PLACES, 5, 'Lidia, la vendedora de púrpura, era de Corinto.', 'Era de la ciudad de Tiatira.', 'Hechos 16:14'),

    truth('ks-creation-1', CREATION, 1, 'Jehová creó la luz el primer día.', 'Génesis 1:3-5'),
    myth('ks-creation-2', CREATION, 1, 'Jehová hizo a la primera mujer del polvo del suelo.', 'Jehová hizo a la mujer de una costilla que le sacó al hombre.', 'Génesis 2:21, 22'),
    truth('ks-creation-3', CREATION, 2, 'Adán les puso nombre a los animales.', 'Génesis 2:19, 20'),
    myth('ks-creation-4', CREATION, 2, 'Jehová creó a los seres humanos el tercer día.', 'Los seres humanos fueron creados el sexto día.', 'Génesis 1:27, 31'),
    truth('ks-creation-5', CREATION, 3, 'Una burra le habló a Balaam.', 'Números 22:28'),
    myth('ks-creation-6', CREATION, 3, 'Unos cuervos le llevaban pan y carne a Eliseo.', 'Los cuervos le llevaban comida a Elías.', '1 Reyes 17:6'),
    truth('ks-creation-7', CREATION, 4, 'Sansón mató a un león sin nada en las manos.', 'Jueces 14:5, 6'),
    myth('ks-creation-8', CREATION, 4, 'Noé metió en el arca un solo animal de cada especie.', 'Metió por lo menos dos de cada especie, y siete de algunas.', 'Génesis 7:2, 3'),
    truth('ks-creation-9', CREATION, 5, 'Una vez Jesús le dijo a Pedro que encontraría una moneda en la boca de un pez.', 'Mateo 17:27'),
    myth('ks-creation-10', CREATION, 5, 'Jehová creó las estrellas el séptimo día.', 'El séptimo día descansó de su obra de creación.', 'Génesis 2:2'),

    truth('ks-early-1', EARLY, 1, 'Saulo de Tarso llegó a ser conocido como el apóstol Pablo.', 'Hechos 13:9'),
    myth('ks-early-2', EARLY, 1, 'El espíritu santo se derramó sobre los discípulos durante la Fiesta de las Cabañas.', 'Se derramó durante la Fiesta de Pentecostés.', 'Hechos 2:1-4'),
    myth('ks-early-3', EARLY, 2, 'Pablo escribió todos los libros de las Escrituras Griegas Cristianas.', 'Pablo escribió muchas cartas, y otros, como Pedro, Santiago y Juan, también escribieron.', '1 Pedro 1:1; Santiago 1:1'),
    truth('ks-early-4', EARLY, 2, 'Pedro resucitó a Tabita, también llamada Dorcas.', 'Hechos 9:36, 40'),
    truth('ks-early-5', EARLY, 3, 'Matías fue escogido para ocupar el lugar de Judas Iscariote.', 'Hechos 1:26'),
    myth('ks-early-6', EARLY, 3, 'La madre de Timoteo se llamaba Loida.', 'Su madre era Eunice. Loida era su abuela.', '2 Timoteo 1:5'),
    truth('ks-early-7', EARLY, 4, 'A Esteban lo mataron a pedradas después de dar testimonio ante el Sanedrín.', 'Hechos 6:12, 15; 7:59, 60'),
    myth('ks-early-8', EARLY, 4, 'Cornelio era cobrador de impuestos en Cesarea.', 'Cornelio era un oficial del ejército.', 'Hechos 10:1'),
    truth('ks-early-9', EARLY, 5, 'Áquila y Priscila se ganaban la vida fabricando tiendas de campaña.', 'Hechos 18:2, 3'),
    myth('ks-early-10', EARLY, 5, 'Pablo naufragó en la isla de Creta.', 'Naufragó en Malta.', 'Hechos 27:41; 28:1'),
  ],
};
