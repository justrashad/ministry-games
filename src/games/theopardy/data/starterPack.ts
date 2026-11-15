import { clue, type CluePack } from './clueBuilder';

/*
 * The starter pack that comes with Theopardy!: 12 categories of 5 clues, enough
 * for two full boards, plus clues for the final round.
 *
 * Every clue is written in our own words. References point to the scripture the
 * answer rests on; no verse text is quoted. Clue ids are stable and shared with
 * the Spanish pack, so "skip recently played" works in both languages.
 */

const KINGS = 'Kings of Israel and Judah';
const PROPHETS = 'Prophets';
const WOMEN = 'Women of the Bible';
const JESUS = 'Life of Jesus';
const APOSTLES = 'The Apostles';
const PLACES = 'Bible Places';
const ANIMALS = 'Animals in the Bible';
const EXODUS = 'Moses and the Exodus';
const BOOKS = 'Books of the Bible';
const NUMBERS = 'Bible Numbers';
const FAMILY = 'Family Ties';
const EARLY = 'Early Christians';
const FINAL = 'Final Round';

export const STARTER_PACK: CluePack = {
  id: 'starter',
  name: 'Starter Pack',
  description: 'Twelve categories for the whole family, from well-known accounts to deeper study.',
  clues: [
    clue('st-kings-1', KINGS, 1, 'As a shepherd boy he defeated the giant Goliath, and he later became king.', 'David', '1 Samuel 17:49, 50'),
    clue('st-kings-2', KINGS, 2, 'This son of David asked Jehovah for wisdom to judge the people instead of asking for riches.', 'Solomon', '1 Kings 3:9-11'),
    clue('st-kings-3', KINGS, 3, 'The first king of Israel, a tall man from the tribe of Benjamin.', 'Saul', '1 Samuel 9:1, 2; 10:1'),
    clue('st-kings-4', KINGS, 4, 'He became king of Judah at eight years old. During his reign the book of the Law was found in the temple.', 'Josiah', '2 Kings 22:1, 8'),
    clue('st-kings-5', KINGS, 5, 'While this king ruled Judah, an angel struck down 185,000 Assyrian soldiers in one night.', 'Hezekiah', '2 Kings 19:35'),

    clue('st-prophets-1', PROPHETS, 1, 'He spent three days and three nights inside a huge fish.', 'Jonah', 'Jonah 1:17'),
    clue('st-prophets-2', PROPHETS, 2, 'He was thrown into a pit of lions because he kept praying to Jehovah.', 'Daniel', 'Daniel 6:10, 16'),
    clue('st-prophets-3', PROPHETS, 3, 'A fiery chariot and fiery horses separated him from Elisha, and he went up in a windstorm.', 'Elijah', '2 Kings 2:11'),
    clue('st-prophets-4', PROPHETS, 4, 'Jehovah told this prophet to marry a woman named Gomer.', 'Hosea', 'Hosea 1:2, 3'),
    clue('st-prophets-5', PROPHETS, 5, 'In a vision he saw a valley plain full of dry bones that came to life.', 'Ezekiel', 'Ezekiel 37:1-10'),

    clue('st-women-1', WOMEN, 1, 'The mother of Jesus.', 'Mary', 'Luke 1:30, 31'),
    clue('st-women-2', WOMEN, 2, 'This woman from Moab refused to leave her mother-in-law, Naomi.', 'Ruth', 'Ruth 1:16, 17'),
    clue('st-women-3', WOMEN, 3, 'This queen risked her life by going in to the king without being called, to save her people.', 'Esther', 'Esther 4:16; 5:1, 2'),
    clue('st-women-4', WOMEN, 4, 'In Jericho she hid two Israelite spies on her roof.', 'Rahab', 'Joshua 2:1, 6'),
    clue('st-women-5', WOMEN, 5, 'This prophetess judged Israel while sitting under a palm tree, and she went with Barak to the battle.', 'Deborah', 'Judges 4:4-9'),

    clue('st-jesus-1', JESUS, 1, 'The town where Jesus was born.', 'Bethlehem', 'Matthew 2:1'),
    clue('st-jesus-2', JESUS, 2, 'He baptized Jesus in the Jordan River.', 'John the Baptist', 'Matthew 3:13', ['John', 'John the Baptizer']),
    clue('st-jesus-3', JESUS, 3, 'At a wedding feast in Cana, Jesus performed his first miracle by turning water into this.', 'Wine', 'John 2:1-11'),
    clue('st-jesus-4', JESUS, 4, 'Jesus resurrected this friend after he had been in the tomb for four days.', 'Lazarus', 'John 11:17, 43, 44'),
    clue('st-jesus-5', JESUS, 5, 'The place where Jesus prayed with his disciples nearby on the night he was arrested.', 'Gethsemane', 'Matthew 26:36'),

    clue('st-apostles-1', APOSTLES, 1, 'He got out of the boat and walked on the water toward Jesus.', 'Peter', 'Matthew 14:29', ['Simon Peter', 'Cephas']),
    clue('st-apostles-2', APOSTLES, 2, 'He betrayed Jesus for 30 silver pieces.', 'Judas Iscariot', 'Matthew 26:14-16', ['Judas']),
    clue('st-apostles-3', APOSTLES, 3, 'He was sitting at the tax office when Jesus called him to be a follower.', 'Matthew', 'Matthew 9:9', ['Levi']),
    clue('st-apostles-4', APOSTLES, 4, 'He said he would not believe Jesus had been raised unless he saw and touched the marks of the nails.', 'Thomas', 'John 20:24, 25'),
    clue('st-apostles-5', APOSTLES, 5, 'He was chosen by lot to take the place of Judas Iscariot.', 'Matthias', 'Acts 1:26'),

    clue('st-places-1', PLACES, 1, 'The garden where Adam and Eve first lived.', 'Eden', 'Genesis 2:8', ['The garden of Eden']),
    clue('st-places-2', PLACES, 2, 'The walls of this city fell flat after Israel marched around it for seven days.', 'Jericho', 'Joshua 6:15, 20'),
    clue('st-places-3', PLACES, 3, 'The mountain where Moses received the Ten Commandments.', 'Mount Sinai', 'Exodus 19:20; 31:18', ['Sinai', 'Horeb', 'Mount Horeb']),
    clue('st-places-4', PLACES, 4, 'In this city the disciples were first called Christians.', 'Antioch', 'Acts 11:26', ['Antioch of Syria']),
    clue('st-places-5', PLACES, 5, 'The apostle John was on this island when he received the Revelation.', 'Patmos', 'Revelation 1:9'),

    clue('st-animals-1', ANIMALS, 1, 'In the garden of Eden, this creature spoke to Eve.', 'A serpent', 'Genesis 3:1', ['Serpent', 'Snake', 'A snake']),
    clue('st-animals-2', ANIMALS, 2, 'This bird came back to Noah in the ark carrying an olive leaf.', 'A dove', 'Genesis 8:11', ['Dove']),
    clue('st-animals-3', ANIMALS, 3, 'These birds brought Elijah bread and meat while he stayed by the Valley of Cherith.', 'Ravens', '1 Kings 17:6'),
    clue('st-animals-4', ANIMALS, 4, 'This animal spoke to Balaam after he struck it three times.', 'A donkey', 'Numbers 22:28', ['Donkey', 'A female donkey', 'An ass']),
    clue('st-animals-5', ANIMALS, 5, 'Samson caught 300 of these animals and tied torches between their tails.', 'Foxes', 'Judges 15:4'),

    clue('st-exodus-1', EXODUS, 1, 'As a baby he was placed in a basket among the reeds of the Nile River.', 'Moses', 'Exodus 2:3-10'),
    clue('st-exodus-2', EXODUS, 2, 'The brother of Moses, who spoke for him before Pharaoh.', 'Aaron', 'Exodus 4:14-16'),
    clue('st-exodus-3', EXODUS, 3, 'Jehovah parted this sea so that Israel could cross on dry ground.', 'The Red Sea', 'Exodus 14:21, 22', ['Red Sea']),
    clue('st-exodus-4', EXODUS, 4, 'The food Jehovah provided for Israel during 40 years in the wilderness.', 'Manna', 'Exodus 16:31, 35'),
    clue('st-exodus-5', EXODUS, 5, 'The father-in-law of Moses, who advised him to choose capable men to help judge the people.', 'Jethro', 'Exodus 18:17-21', ['Reuel']),

    clue('st-books-1', BOOKS, 1, 'The first book of the Bible.', 'Genesis'),
    clue('st-books-2', BOOKS, 2, 'The last book of the Bible.', 'Revelation'),
    clue('st-books-3', BOOKS, 3, 'This Bible book is a collection of 150 songs.', 'Psalms', undefined, ['Psalm', 'The book of Psalms']),
    clue('st-books-4', BOOKS, 4, 'The book that comes right after the four Gospels.', 'Acts', undefined, ['Acts of Apostles', 'Acts of the Apostles']),
    clue('st-books-5', BOOKS, 5, 'The shortest book in the Hebrew Scriptures, with only one chapter.', 'Obadiah'),

    clue('st-numbers-1', NUMBERS, 1, 'The number of apostles Jesus chose.', '12', 'Luke 6:13', ['Twelve']),
    clue('st-numbers-2', NUMBERS, 2, 'The number of days and nights it rained at the start of the Flood.', '40', 'Genesis 7:12', ['Forty']),
    clue('st-numbers-3', NUMBERS, 3, 'The number of people who survived the Flood in the ark.', '8', '1 Peter 3:20', ['Eight']),
    clue('st-numbers-4', NUMBERS, 4, 'The number of smooth stones David chose from the streambed before he faced Goliath.', '5', '1 Samuel 17:40', ['Five']),
    clue('st-numbers-5', NUMBERS, 5, 'The number of men Gideon had with him when he went against the camp of Midian.', '300', 'Judges 7:7', ['Three hundred']),

    clue('st-family-1', FAMILY, 1, 'The first son of Adam and Eve.', 'Cain', 'Genesis 4:1'),
    clue('st-family-2', FAMILY, 2, 'The son Jacob loved most, to whom he gave a special robe.', 'Joseph', 'Genesis 37:3'),
    clue('st-family-3', FAMILY, 3, 'The firstborn of the twin sons of Isaac and Rebekah.', 'Esau', 'Genesis 25:24, 25'),
    clue('st-family-4', FAMILY, 4, 'The mother of the prophet Samuel.', 'Hannah', '1 Samuel 1:20'),
    clue('st-family-5', FAMILY, 5, 'The grandmother of Timothy, remembered for her faith.', 'Lois', '2 Timothy 1:5'),

    clue('st-early-1', EARLY, 1, 'The name the apostle Paul was known by when he persecuted the congregation.', 'Saul', 'Acts 8:3; 13:9', ['Saul of Tarsus']),
    clue('st-early-2', EARLY, 2, 'He was stoned to death after giving a bold witness before the Sanhedrin.', 'Stephen', 'Acts 7:59, 60'),
    clue('st-early-3', EARLY, 3, 'Also called Dorcas, this disciple in Joppa was raised from the dead by Peter.', 'Tabitha', 'Acts 9:36-41'),
    clue('st-early-4', EARLY, 4, 'An army officer in Caesarea. Peter was sent to his home, and he and his household were baptized.', 'Cornelius', 'Acts 10:1, 24, 48'),
    clue('st-early-5', EARLY, 5, 'This married couple were tentmakers who worked alongside Paul in Corinth. Name both.', 'Aquila and Priscilla', 'Acts 18:2, 3', ['Priscilla and Aquila', 'Aquila and Prisca', 'Prisca and Aquila']),
  ],
  finals: [
    clue('st-final-1', FINAL, 5, 'He lived 969 years, longer than anyone else in the Bible record.', 'Methuselah', 'Genesis 5:27'),
    clue('st-final-2', FINAL, 5, 'Of the 12 spies sent into Canaan, these two gave a good report. Name both.', 'Joshua and Caleb', 'Numbers 14:6-8, 30', ['Caleb and Joshua']),
    clue('st-final-3', FINAL, 5, 'These three Hebrews were thrown into a fiery furnace for refusing to worship an image of gold. Name all three.', 'Shadrach, Meshach and Abednego', 'Daniel 3:16-23', ['Shadrach Meshach Abednego', 'Hananiah, Mishael and Azariah']),
    clue('st-final-4', FINAL, 5, 'This man from Cyrene was made to carry the torture stake of Jesus.', 'Simon', 'Matthew 27:32', ['Simon of Cyrene']),
  ],
};
