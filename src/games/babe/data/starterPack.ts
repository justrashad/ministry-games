import { clue, type QuestionPack } from './clueBuilder';

/* Every answer and reference was checked against the New World Translation on jw.org. */

const PEOPLE = 'Bible People';
const ANIMALS = 'Animals';
const NUMBERS = 'Numbers';
const PLACES = 'Bible Places';
const JESUS = 'Jesus';
const BOOKS = 'Bible Books';
const WOMEN = 'Women of Faith';
const KINGS = 'Kings';
const PROPHETS = 'Prophets';
const EARLY = 'Early Christians';
const BONUS = 'Bonus Question';

export const STARTER_PACK: QuestionPack = {
  id: 'starter',
  name: 'Starter Pack',
  description: 'Sixty questions in five growth stages, from Newborn to Mature, plus bonus questions.',
  questions: [
    // Newborn
    clue('sb-n1', PEOPLE, 1, 'Who was the first woman?', 'Eve', 'Genesis 3:20'),
    clue('sb-n2', ANIMALS, 1, 'Jesus rode this animal into Jerusalem.', 'A donkey', 'Matthew 21:5, 7', ['Donkey', 'A colt']),
    clue('sb-n3', NUMBERS, 1, 'How many sons did Noah have?', '3', 'Genesis 6:10', ['Three']),
    clue('sb-n4', PLACES, 1, 'Jesus walked on this sea.', 'The Sea of Galilee', 'John 6:1, 19', ['Sea of Galilee', 'Sea of Tiberias']),
    clue('sb-n5', JESUS, 1, 'The husband of Mary, Jesus\' mother.', 'Joseph', 'Matthew 1:16'),
    clue('sb-n6', BOOKS, 1, 'How many books are in the Bible?', '66', undefined, ['Sixty-six']),
    clue('sb-n7', PEOPLE, 1, 'Jehovah told this man to make an ark.', 'Noah', 'Genesis 6:13, 14'),
    clue('sb-n8', ANIMALS, 1, 'When David was a shepherd, a bear and this animal carried off sheep from his father\'s flock.', 'A lion', '1 Samuel 17:34, 35', ['Lion']),
    clue('sb-n9', PEOPLE, 1, 'He killed his brother Abel.', 'Cain', 'Genesis 4:8'),
    clue('sb-n10', NUMBERS, 1, 'How many Commandments did Jehovah write on two tablets of stone?', '10', 'Deuteronomy 4:13', ['Ten']),
    clue('sb-n11', JESUS, 1, 'Jesus said he is this kind of shepherd, one who surrenders his life for the sheep.', 'The fine shepherd', 'John 10:11', ['Fine']),
    clue('sb-n12', PLACES, 1, 'People built a city and a tower there, and Jehovah confused their language.', 'Babel', 'Genesis 11:4, 9'),
    // Toddler
    clue('sb-t1', PEOPLE, 2, 'He told Delilah that if his head were shaved, his power would leave him.', 'Samson', 'Judges 16:4, 17'),
    clue('sb-t2', ANIMALS, 2, 'The first bird Noah sent out of the ark.', 'A raven', 'Genesis 8:6, 7', ['Raven']),
    clue('sb-t3', NUMBERS, 2, 'How many sons did Jacob have?', '12', 'Genesis 35:22', ['Twelve']),
    clue('sb-t4', PLACES, 2, 'Ten of Joseph\'s brothers went down to this land to buy grain.', 'Egypt', 'Genesis 42:3'),
    clue('sb-t5', JESUS, 2, 'The disciples were frightened when they saw Jesus doing this at night.', 'Walking on the sea', 'Matthew 14:25, 26', ['Walking on water', 'Walking on the water']),
    clue('sb-t6', WOMEN, 2, 'After Israel crossed the Red Sea, this prophetess, Aaron\'s sister, took a tambourine, and all the women followed her.', 'Miriam', 'Exodus 15:20, 21'),
    clue('sb-t7', BOOKS, 2, 'The book that comes right after Genesis.', 'Exodus'),
    clue('sb-t8', ANIMALS, 2, 'Jesus let the demons go into a herd of these animals.', 'Swine', 'Matthew 8:31, 32', ['Pigs', 'Hogs']),
    clue('sb-t9', PEOPLE, 2, 'His brothers threw him into a waterpit. Later Pharaoh put him over all the land of Egypt.', 'Joseph', 'Genesis 37:24; 41:41'),
    clue('sb-t10', NUMBERS, 2, 'On which day after his death was Jesus raised up?', 'The third day', '1 Corinthians 15:4', ['Third', 'Day 3']),
    clue('sb-t11', PLACES, 2, 'Saul was getting near this city when a light from heaven flashed around him.', 'Damascus', 'Acts 9:3'),
    clue('sb-t12', JESUS, 2, 'Jesus washed his disciples\' feet and dried them with this.', 'A towel', 'John 13:5', ['Towel']),
    // Child
    clue('sb-c1', KINGS, 3, 'During this king\'s great feast, the fingers of a man\'s hand appeared and wrote on the wall.', 'Belshazzar', 'Daniel 5:1, 5'),
    clue('sb-c2', PROPHETS, 3, 'This prophet anointed David in front of his brothers.', 'Samuel', '1 Samuel 16:13'),
    clue('sb-c3', NUMBERS, 3, 'How many years was Israel in the wilderness?', '40', 'Numbers 14:33', ['Forty']),
    clue('sb-c4', PLACES, 3, 'In this city, Paul and Silas were praising God with song in jail when an earthquake opened all the doors.', 'Philippi', 'Acts 16:12, 25, 26'),
    clue('sb-c5', WOMEN, 3, 'This wife of Abraham gave birth to a son when she was about 90.', 'Sarah', 'Genesis 17:17; 21:2'),
    clue('sb-c6', ANIMALS, 3, 'Jehovah brought these insects over the land of Egypt as the eighth plague.', 'Locusts', 'Exodus 10:12-14'),
    clue('sb-c7', BOOKS, 3, 'How many Gospels are in the Bible?', '4', undefined, ['Four']),
    clue('sb-c8', JESUS, 3, 'Jesus said this disciple would be called Cephas.', 'Simon Peter', 'John 1:42', ['Peter', 'Simon']),
    clue('sb-c9', PROPHETS, 3, 'Jehovah sent this prophet to Zarephath, where a widow would supply him with food.', 'Elijah', '1 Kings 17:1, 9, 10'),
    clue('sb-c10', PEOPLE, 3, 'The son of Abraham\'s brother. Angels brought him and his family out of Sodom.', 'Lot', 'Genesis 12:5; 19:1, 15, 16'),
    clue('sb-c11', NUMBERS, 3, 'How many times did Naaman plunge into the Jordan?', '7', '2 Kings 5:14', ['Seven']),
    clue('sb-c12', PLACES, 3, 'When Jesus got near this city and viewed it, he wept over it.', 'Jerusalem', 'Luke 19:28, 41'),
    // Youth
    clue('sb-y1', KINGS, 4, 'As a sign for this king of Judah, Jehovah made the shadow on the stairway of Ahaz go back ten steps.', 'Hezekiah', '2 Kings 20:8, 11'),
    clue('sb-y2', PROPHETS, 4, 'Gehazi was the attendant of this prophet.', 'Elisha', '2 Kings 5:20'),
    clue('sb-y3', WOMEN, 4, 'This wife of Heber put Sisera to death with a tent pin.', 'Jael', 'Judges 4:21'),
    clue('sb-y4', NUMBERS, 4, 'How old was Abraham when his son Isaac was born?', '100', 'Genesis 21:5', ['One hundred']),
    clue('sb-y5', PLACES, 4, 'Moses ran away from Pharaoh to this land, where he became a shepherd.', 'Midian', 'Exodus 2:15; 3:1'),
    clue('sb-y6', EARLY, 4, 'This married couple held back some of the price of their field and lied about it. Name both.', 'Ananias and Sapphira', 'Acts 5:1-10', ['Sapphira and Ananias']),
    clue('sb-y7', JESUS, 4, 'This chief tax collector climbed a sycamore tree to see Jesus.', 'Zacchaeus', 'Luke 19:2-4'),
    clue('sb-y8', ANIMALS, 4, 'Jesus said not one of these birds falls to the ground without the Father\'s knowledge.', 'Sparrows', 'Matthew 10:29', ['Sparrow']),
    clue('sb-y9', PEOPLE, 4, 'The father of John the Baptist.', 'Zechariah', 'Luke 1:13'),
    clue('sb-y10', BOOKS, 4, 'This Bible book is named after a queen who went in to the king against the law, to plead in behalf of her people.', 'Esther', 'Esther 4:8, 16'),
    clue('sb-y11', KINGS, 4, 'This king of Israel took Jezebel as his wife.', 'Ahab', '1 Kings 16:30, 31'),
    clue('sb-y12', EARLY, 4, 'Philip went down into the water with this man from his chariot and baptized him.', 'An Ethiopian eunuch', 'Acts 8:27, 38', ['The Ethiopian', 'The eunuch']),
    // Mature
    clue('sb-m1', PROPHETS, 5, 'Jehovah told this prophet to lie on his left side for 390 days.', 'Ezekiel', 'Ezekiel 4:4, 5'),
    clue('sb-m2', KINGS, 5, 'This man was king in Tirzah for seven days.', 'Zimri', '1 Kings 16:15'),
    clue('sb-m3', WOMEN, 5, 'In King Josiah\'s day, Hilkiah the priest and others went to this prophetess.', 'Huldah', '2 Kings 22:14'),
    clue('sb-m4', NUMBERS, 5, 'How many persons were in the ship with Paul before it ran aground?', '276', 'Acts 27:37'),
    clue('sb-m5', PLACES, 5, 'Paul stood in the midst of the Areopagus and spoke to the men of this city.', 'Athens', 'Acts 17:22'),
    clue('sb-m6', EARLY, 5, 'This young man fell asleep while Paul kept talking, and fell down from the third story.', 'Eutychus', 'Acts 20:9'),
    clue('sb-m7', PEOPLE, 5, 'This man from the family of Saul\'s house shouted curses at King David and threw stones at him.', 'Shimei', '2 Samuel 16:5, 6'),
    clue('sb-m8', JESUS, 5, 'Near the gate of this city, Jesus raised a widow\'s only son.', 'Nain', 'Luke 7:11-15'),
    clue('sb-m9', ANIMALS, 5, 'The true God sent this creature to attack the bottle-gourd plant that shaded Jonah.', 'A worm', 'Jonah 4:6, 7', ['Worm']),
    clue('sb-m10', BOOKS, 5, 'In this short letter, Paul appealed for his child Onesimus.', 'Philemon', 'Philemon 10'),
    clue('sb-m11', PROPHETS, 5, 'This prophet said he was a herdsman who took care of sycamore fig trees.', 'Amos', 'Amos 7:14'),
    clue('sb-m12', KINGS, 5, 'This king of Persia proclaimed that the Jews could go up and rebuild the house of Jehovah in Jerusalem.', 'Cyrus', 'Ezra 1:1-3'),
  ],
  bonus: [
    clue('sb-b1', BONUS, 5, 'This priest was at Shiloh while the boy Samuel was ministering to Jehovah.', 'Eli', '1 Samuel 1:9; 3:1'),
    clue('sb-b2', BONUS, 5, 'This king of Salem, a priest of the Most High God, blessed Abram.', 'Melchizedek', 'Genesis 14:18, 19'),
    clue('sb-b3', BONUS, 5, 'Our Lord descended from this tribe.', 'Judah', 'Hebrews 7:14'),
    clue('sb-b4', BONUS, 5, 'Faith, hope and this remain, and the greatest of these is this.', 'Love', '1 Corinthians 13:13'),
  ],
};
