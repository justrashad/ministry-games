import type { Question } from '../../src/games/showdown/types';
import { CHAR, CREATE, MEET, MIN, q } from '../../src/games/showdown/data/sampleQuestions';
import { ERA_PACKS } from './eraPacks';

const JESUS = 'Life of Jesus';
const ACCOUNTS = 'Bible Accounts';
const LITTLE = 'Little Ones';
const FAMILY = 'Family Life';
const PLACES = 'Bible Places';
const HOPE = 'Our Hope';
const BASICS = 'Bible Basics';
const STORIES = 'Famous Stories';
const VALUES = 'Everyday Values';

/*
 * PAID CONTENT. This file is bundled only into the Netlify Function, never into the
 * public website, so a pack's questions are sent only after its license key checks out.
 *
 * Themed question packs designed for family worship. Point values are fictional
 * game values created for each pack, not real survey statistics.
 * Question ids are stable so "skip recently played" works across copies of a pack.
 */

export interface QuestionPack {
  id: string;
  name: string;
  description: string;
  /**
   * Release day (YYYY-MM-DD). The Mega Pack and Complete Edition include the packs
   * released on or before the day they were bought; later packs are sold separately.
   */
  released: string;
  questions: Question[];
}

/** Every pack in the launch catalog. */
const LAUNCH = '2026-09-26';

const FINAL = { isFinalRound: true } as const;
const FC = { isFinalChallenge: true } as const;

const LAUNCH_PACKS: QuestionPack[] = [
  {
    id: 'bible-characters',
    name: 'Bible Characters',
    description: 'Kings, prophets, apostles and faithful women and men.',
    released: LAUNCH,
    questions: [
      q('pk-bc-01', CHAR, "Name one of Jacob's sons.", [['Joseph', 28], ['Benjamin', 20], ['Judah', 16], ['Reuben', 12], ['Levi', 10], ['Simeon', 8], ['Dan', 6]]),
      q('pk-bc-02', CHAR, 'Name a woman in the Bible.', [['Mary', 24], ['Esther', 18], ['Ruth', 16], ['Sarah', 14], ['Eve', 12], ['Rahab', 8], ['Deborah', 8]]),
      q('pk-bc-03', CHAR, "Name one of Jesus' apostles.", [['Peter', 30], ['John', 20], ['Andrew', 12], ['James', 12], ['Matthew', 10], ['Thomas', 9], ['Judas', 7]]),
      q('pk-bc-04', CHAR, 'Name a king of Israel or Judah.', [['David', 34], ['Solomon', 26], ['Saul', 16], ['Hezekiah', 9], ['Josiah', 8], ['Ahab', 7]]),
      q('pk-bc-05', CHAR, 'Name a prophet in the Bible.', [['Elijah', 24], ['Isaiah', 20], ['Daniel', 16], ['Jonah', 14], ['Jeremiah', 12], ['Elisha', 8], ['Samuel', 6]]),
      q('pk-bc-06', CHAR, 'Name someone in the Bible who showed great courage.', [['David', 30], ['Esther', 22], ['Daniel', 18], ['Moses', 12], ['Joshua', 10], ['Deborah', 8]]),
      q('pk-bc-07', CHAR, 'Name someone who traveled with the apostle Paul.', [['Timothy', 30], ['Silas', 25], ['Luke', 18], ['Barnabas', 15], ['Titus', 7], ['Mark', 5]]),
      q('pk-bc-08', CHAR, 'Name a Bible character who served in a royal court.', [['Joseph', 24], ['Daniel', 22], ['Esther', 20], ['Nehemiah', 14], ['Moses', 12], ['Mordecai', 8]], {
        notes: 'Nehemiah was cupbearer to King Artaxerxes (Nehemiah 2:1).',
      }),
      q('pk-bc-09', CHAR, 'Name someone in the Bible known for great faith.', [['Abraham', 26], ['Noah', 22], ['Moses', 16], ['Sarah', 12], ['Daniel', 12], ['Job', 8]], {
        ...FINAL,
        notes: 'Hebrews chapter 11 lists many examples.',
      }),
      q('pk-bc-10', CHAR, 'Name one of the 12 apostles.', [['Peter', 32], ['John', 22], ['Andrew', 18], ['James', 16], ['Matthew', 12]], FC),
      q('pk-bc-11', CHAR, 'Name a woman in the Bible.', [['Mary', 30], ['Esther', 24], ['Ruth', 18], ['Sarah', 16], ['Eve', 12]], FC),
      q('pk-bc-12', CHAR, 'Name a king in the Bible.', [['David', 34], ['Solomon', 28], ['Saul', 20], ['Nebuchadnezzar', 10], ['Hezekiah', 8]], { ...FC, alternates: [['King David', 0], ['King Solomon', 1]] }),
      q('pk-bc-13', CHAR, 'Name a Bible character who built something.', [['Noah', 36], ['Solomon', 24], ['Nehemiah', 16], ['Jesus', 14], ['Bezalel', 10]], {
        ...FC,
        alternates: [['The ark', 0], ['The temple', 1], ['The walls', 2], ['Carpenter', 3]],
      }),
      q('pk-bc-14', CHAR, "Name one of Jacob's twelve sons.", [['Joseph', 32], ['Benjamin', 22], ['Judah', 18], ['Reuben', 16], ['Levi', 12]], FC),
    ],
  },
  {
    id: 'kingdom-hall',
    name: 'Kingdom Hall and Meetings',
    description: 'Meetings, conventions and life at the Kingdom Hall.',
    released: LAUNCH,
    questions: [
      q('pk-kh-01', MEET, 'Name something you do at a congregation meeting.', [['Sing', 28], ['Pray', 22], ['Comment', 18], ['Listen to talks', 14], ['Take notes', 10], ['Greet friends', 8]]),
      q('pk-kh-02', MEET, 'Name a part of the midweek meeting.', [
        ['Treasures From God’s Word', 24],
        ['Bible reading', 20],
        ['Apply Yourself to the Field Ministry', 18],
        ['Living as Christians', 16],
        ['Congregation Bible Study', 14],
        ['Songs and prayer', 8],
      ]),
      q('pk-kh-03', MEET, 'Name a way to help keep the Kingdom Hall clean.', [['Vacuum', 26], ['Wipe the chairs', 20], ['Clean the restrooms', 18], ['Take out the trash', 14], ['Dust', 12], ['Wash the windows', 10]]),
      q('pk-kh-04', MEET, 'Name something a child can do to get ready for the Watchtower Study.', [['Read the article', 30], ['Underline answers', 24], ['Look up the scriptures', 18], ['Practice a comment', 16], ['Get a good night’s sleep', 12]]),
      q('pk-kh-05', MEET, 'Name something you might see in a Kingdom Hall.', [['Chairs', 24], ['Platform', 20], ['Microphones', 16], ['Literature', 14], ['Screens', 12], ['Flowers', 8], ['A clock', 6]]),
      q('pk-kh-06', MEET, 'Name something you might say to greet someone at the Kingdom Hall.', [['Hello', 30], ['Good morning', 22], ['How are you?', 20], ['Nice to see you', 14], ['Welcome', 14]]),
      q('pk-kh-07', MEET, 'Name a job brothers and sisters help with at meetings.', [['Attendant', 26], ['Microphones', 22], ['Audio and video', 18], ['Literature', 14], ['Cleaning', 12], ['Reading at the study', 8]]),
      q('pk-kh-08', MEET, 'Name something people bring to a regional convention.', [['Lunch', 26], ['Bible', 22], ['Badge card', 16], ['Notebook', 14], ['Water', 12], ['Umbrella', 10]]),
      q('pk-kh-09', MEET, 'Name a reason we enjoy going to meetings.', [['Seeing friends', 26], ['Learning from the Bible', 24], ['Singing', 16], ['Encouragement', 14], ['Worshipping Jehovah', 12], ['Praying together', 8]], FINAL),
      q('pk-kh-10', MEET, 'Name something you do at a congregation meeting.', [['Sing', 32], ['Pray', 24], ['Comment', 20], ['Listen', 14], ['Take notes', 10]], { ...FC, alternates: [['Answer', 2], ['Singing', 0]] }),
      q('pk-kh-11', MEET, 'Name something you pack for a regional convention.', [['Lunch', 32], ['Bible', 24], ['Badge card', 18], ['Water', 14], ['Notebook', 12]], { ...FC, alternates: [['Food', 0], ['Sandwich', 0], ['Badge', 2]] }),
      q('pk-kh-12', MEET, 'Name a job someone might do at the Kingdom Hall.', [['Attendant', 30], ['Microphones', 24], ['Cleaning', 20], ['Literature', 14], ['Audio', 12]], { ...FC, alternates: [['Usher', 0], ['Mics', 1], ['Sound', 4]] }),
      q('pk-kh-13', MEET, 'Name something you might see at a regional convention.', [['Baptism', 30], ['Drama', 24], ['Crowds', 18], ['Stage', 16], ['Videos', 12]], { ...FC, alternates: [['Bible drama', 1], ['Lots of people', 2]] }),
      q('pk-kh-14', MEET, 'Name something you say when greeting a friend at the meeting.', [['Hello', 34], ['How are you', 26], ['Good morning', 18], ['Nice to see you', 14], ['Welcome', 8]], { ...FC, alternates: [['Hi', 0], ['Good evening', 2]] }),
    ],
  },
  {
    id: 'creation',
    name: 'Creation',
    description: 'Animals, plants, the sky and the wonders Jehovah made.',
    released: LAUNCH,
    questions: [
      q('pk-cr-01', CREATE, 'Name an animal that lives in the ocean.', [['Whale', 26], ['Shark', 20], ['Dolphin', 18], ['Octopus', 14], ['Fish', 12], ['Sea turtle', 10]]),
      q('pk-cr-02', CREATE, 'Name something that grows in a garden.', [['Tomatoes', 24], ['Flowers', 22], ['Carrots', 16], ['Lettuce', 14], ['Strawberries', 12], ['Peppers', 12]]),
      q('pk-cr-03', CREATE, 'Name something that can fly.', [['Birds', 30], ['Eagle', 20], ['Bat', 16], ['Butterfly', 14], ['Bee', 12], ['Owl', 8]]),
      q('pk-cr-04', CREATE, 'Name something you see in the night sky.', [['Moon', 34], ['Stars', 30], ['Planets', 12], ['Airplanes', 10], ['Clouds', 8], ['Shooting stars', 6]]),
      q('pk-cr-05', CREATE, 'Name a part of the human body that shows amazing design.', [['Brain', 30], ['Eye', 24], ['Heart', 20], ['Hands', 14], ['Ears', 12]]),
      q('pk-cr-06', CREATE, 'Name a kind of weather.', [['Rain', 28], ['Snow', 22], ['Sunny', 18], ['Wind', 14], ['Thunderstorm', 10], ['Fog', 8]]),
      q('pk-cr-07', CREATE, 'Name a very big animal.', [['Elephant', 34], ['Giraffe', 20], ['Whale', 18], ['Hippo', 12], ['Rhino', 10], ['Bear', 6]]),
      q('pk-cr-08', CREATE, 'Name something bees help with.', [['Honey', 38], ['Pollinating flowers', 30], ['Beeswax', 14], ['Growing fruit', 12], ['Gardens', 6]]),
      q('pk-cr-09', CREATE, 'Name something in creation that makes you want to thank Jehovah.', [['Sunsets', 24], ['Animals', 22], ['Flowers', 18], ['Oceans', 14], ['Mountains', 12], ['Food', 10]], FINAL),
      q('pk-cr-10', CREATE, 'Name an animal that lives in the ocean.', [['Whale', 30], ['Shark', 24], ['Dolphin', 20], ['Octopus', 14], ['Jellyfish', 12]], FC),
      q('pk-cr-11', CREATE, 'Name something you see in the night sky.', [['Moon', 34], ['Stars', 30], ['Planets', 16], ['Shooting star', 12], ['Airplane', 8]], { ...FC, alternates: [['Comet', 3], ['Meteor', 3]] }),
      q('pk-cr-12', CREATE, 'Name a fruit.', [['Apple', 32], ['Banana', 26], ['Orange', 18], ['Grapes', 14], ['Strawberry', 10]], FC),
      q('pk-cr-13', CREATE, 'Name a baby animal.', [['Puppy', 32], ['Kitten', 28], ['Calf', 16], ['Lamb', 14], ['Cub', 10]], { ...FC, alternates: [['Baby dog', 0], ['Baby cat', 1], ['Bear cub', 4], ['Lion cub', 4]] }),
      q('pk-cr-14', CREATE, 'Name something that grows on a tree.', [['Leaves', 30], ['Apples', 26], ['Fruit', 18], ['Nuts', 14], ['Flowers', 12]], { ...FC, alternates: [['Acorns', 3], ['Blossoms', 4]] }),
    ],
  },
  {
    id: 'ministry',
    name: 'Christian Ministry',
    description: 'Sharing the good news, at the door and everywhere else.',
    released: LAUNCH,
    questions: [
      q('pk-mn-01', MIN, 'Name a way to share the good news.', [['Door to door', 30], ['Cart witnessing', 20], ['Letters', 16], ['Phone', 12], ['Informal witnessing', 12], ['Bible studies', 10]]),
      q('pk-mn-02', MIN, 'Name a way to start a conversation in the ministry.', [['Say hello', 26], ['Ask a question', 24], ['Offer a tract', 18], ['Give a compliment', 12], ['Introduce yourself', 12], ['Talk about the weather', 8]]),
      q('pk-mn-03', MIN, 'Name a topic people often ask about in the ministry.', [['Family', 22], ['Hope for the future', 22], ['Why we suffer', 18], ['Happiness', 14], ['Prayer', 12], ['God’s name', 12]]),
      q('pk-mn-04', MIN, 'Name something to bring in your ministry bag.', [['Bible', 30], ['Tracts', 22], ['Invitations', 16], ['Tablet', 14], ['Pen', 10], ['Water', 8]]),
      q('pk-mn-05', MIN, 'Name a way children can share in the ministry.', [['Offer a tract', 28], ['Read a scripture', 22], ['Knock on the door', 18], ['Say hello', 16], ['Show a video', 16]]),
      q('pk-mn-06', MIN, 'Name a quality that helps in the ministry.', [['Kindness', 26], ['Patience', 22], ['Courage', 18], ['Joy', 14], ['Love', 12], ['Mildness', 8]]),
      q('pk-mn-07', MIN, 'Name a place you might preach informally.', [['School', 26], ['Work', 20], ['The store', 18], ['The park', 14], ['Bus or train', 12], ['Waiting room', 10]]),
      q('pk-mn-08', MIN, 'Name a teaching tool we use in the ministry.', [['The Bible', 30], ['Videos', 24], ['Tracts', 18], ['Bible study book', 16], ['Magazines', 12]]),
      q('pk-mn-09', MIN, 'Name a way to encourage a new Bible student.', [['Pray with them', 24], ['Invite them to a meeting', 24], ['Be a friend', 18], ['Praise their progress', 16], ['Share an experience', 10], ['Be patient', 8]], FINAL),
      q('pk-mn-10', MIN, 'Name something you bring in the ministry.', [['Bible', 34], ['Tracts', 24], ['Tablet', 18], ['Invitations', 14], ['Water', 10]], { ...FC, alternates: [['Phone', 2], ['Device', 2]] }),
      q('pk-mn-11', MIN, 'Name a way to preach the good news.', [['Door to door', 34], ['Cart', 22], ['Letters', 18], ['Phone', 14], ['Informally', 12]], { ...FC, alternates: [['House to house', 0], ['Letter writing', 2], ['Telephone', 3]] }),
      q('pk-mn-12', MIN, 'Name a place you might preach informally.', [['School', 32], ['Work', 24], ['Store', 18], ['Park', 14], ['Bus', 12]], { ...FC, alternates: [['Job', 1], ['Grocery store', 2], ['Train', 4]] }),
      q('pk-mn-13', MIN, 'Name a quality that helps in the ministry.', [['Kindness', 30], ['Patience', 24], ['Love', 20], ['Courage', 14], ['Joy', 12]], FC),
      q('pk-mn-14', MIN, 'Name something you might say at the door.', [['Hello', 34], ['Good morning', 24], ['May I share a scripture?', 18], ['How are you?', 14], ['Thank you', 10]], { ...FC, alternates: [['Hi', 0], ['Good afternoon', 1]] }),
    ],
  },
  {
    id: 'life-of-jesus',
    name: 'Life of Jesus',
    description: 'His birth, miracles, illustrations and example.',
    released: LAUNCH,
    questions: [
      q('pk-lj-01', JESUS, 'Name a place where Jesus spent time during his ministry.', [['Jerusalem', 26], ['Galilee', 22], ['Capernaum', 16], ['Nazareth', 14], ['Bethany', 12], ['Jordan River', 10]]),
      q('pk-lj-02', JESUS, 'Name something that happened when Jesus was born.', [['He was laid in a manger', 30], ['Shepherds visited', 24], ['Angels appeared', 18], ['He was born in Bethlehem', 16], ['Mary and Joseph traveled', 12]], {
        notes: 'Luke 2:1-20.',
      }),
      q('pk-lj-03', JESUS, 'Name a miracle Jesus performed with food or drink.', [['Fed the 5,000', 32], ['Turned water into wine', 28], ['Fed the 4,000', 20], ['A huge catch of fish', 20]]),
      q('pk-lj-04', JESUS, 'Name someone Jesus healed or brought back to life.', [['Lazarus', 26], ['Blind Bartimaeus', 16], ["Jairus' daughter", 16], ['A man with leprosy', 14], ["Peter's mother-in-law", 12], ['A paralyzed man', 10], ["The widow of Nain's son", 6]]),
      q('pk-lj-05', JESUS, 'Name something Jesus taught in the Sermon on the Mount.', [['The model prayer', 26], ['Love your enemies', 20], ['Stop being anxious', 18], ['Treat others as you want to be treated', 16], ['Keep seeking the Kingdom first', 12], ['Happy are those…', 8]], {
        notes: 'Matthew chapters 5 to 7.',
      }),
      q('pk-lj-06', JESUS, 'Name one of Jesus’ illustrations.', [['The lost son', 26], ['The neighborly Samaritan', 24], ['The sower', 18], ['The lost sheep', 14], ['The mustard grain', 10], ['The pearl', 8]]),
      q('pk-lj-07', JESUS, 'Name something Jesus did that showed humility.', [["Washed the disciples' feet", 38], ['Rode on a donkey', 18], ['Ate with tax collectors', 16], ['Prayed to his Father', 14], ['Welcomed children', 14]]),
      q('pk-lj-08', JESUS, 'Name a member of Jesus’ family.', [['Mary', 34], ['Joseph', 26], ['James', 16], ['Jude', 10], ['Elizabeth', 8], ['John the Baptist', 6]], {
        notes: 'James and Jude were his half brothers; Elizabeth and John the Baptist were relatives (Luke 1:36).',
      }),
      q('pk-lj-09', JESUS, 'Name a lesson we learn from Jesus’ example.', [['Love', 26], ['Humility', 22], ['Kindness', 18], ['Obedience', 14], ['Courage', 12], ['Prayer', 8]], FINAL),
      q('pk-lj-10', JESUS, 'Name one of Jesus’ illustrations.', [['The lost son', 30], ['The neighborly Samaritan', 26], ['The sower', 18], ['The lost sheep', 16], ['The mustard grain', 10]], {
        ...FC,
        alternates: [['Prodigal son', 0], ['Good Samaritan', 1], ['Samaritan', 1], ['The farmer', 2], ['Seeds', 2]],
      }),
      q('pk-lj-11', JESUS, 'Name a miracle Jesus performed.', [['Walked on water', 30], ['Fed the crowds', 24], ['Healed the sick', 20], ['Raised Lazarus', 14], ['Water into wine', 12]], {
        ...FC,
        alternates: [['Fed 5,000', 1], ['Healed people', 2], ['Healed the blind', 2]],
      }),
      q('pk-lj-12', JESUS, 'Name a place Jesus visited.', [['Jerusalem', 32], ['Galilee', 24], ['Nazareth', 18], ['Capernaum', 14], ['Bethany', 12]], FC),
      q('pk-lj-13', JESUS, 'Name someone who followed Jesus.', [['Peter', 32], ['John', 24], ['Mary Magdalene', 18], ['Andrew', 14], ['Matthew', 12]], FC),
      q('pk-lj-14', JESUS, 'Name something Jesus did as a boy or young man.', [['Worked as a carpenter', 34], ['Talked with teachers at the temple', 26], ['Obeyed his parents', 20], ['Grew up in Nazareth', 12], ['Learned the Scriptures', 8]], {
        ...FC,
        notes: 'Luke 2:41-52; Mark 6:3.',
        alternates: [['Carpenter', 0], ['Went to the temple', 1], ['Listened to his parents', 2]],
      }),
    ],
  },
  {
    id: 'bible-accounts',
    name: 'Bible Accounts',
    description: 'Favorite accounts from the Hebrew Scriptures.',
    released: LAUNCH,
    questions: [
      q('pk-ba-01', ACCOUNTS, 'Name an animal that is part of a Bible account.', [["Lions in Daniel's account", 24], ["Jonah's big fish", 22], ['The serpent in Eden', 16], ["Balaam's donkey", 14], ["Abraham's ram", 12], ["Noah's dove", 12]]),
      q('pk-ba-02', ACCOUNTS, 'Name something that happened to Joseph.', [['Sold by his brothers', 24], ['Given a special robe', 22], ['Put in prison', 18], ['Explained dreams', 16], ['Became a ruler in Egypt', 14], ['Forgave his brothers', 6]]),
      q('pk-ba-03', ACCOUNTS, 'Name one of the plagues on Egypt.', [['Water turned to blood', 24], ['Frogs', 22], ['Locusts', 16], ['Darkness', 14], ['Hail', 10], ['Gnats', 8], ['Boils', 6]]),
      q('pk-ba-04', ACCOUNTS, 'Name something Noah took into the ark.', [['Animals', 34], ['His family', 26], ['Food', 20], ['Birds', 12], ['Water', 8]]),
      q('pk-ba-05', ACCOUNTS, 'Name a way Jehovah cared for the Israelites in the wilderness.', [['Manna', 30], ['Water from a rock', 22], ['Parted the Red Sea', 18], ['A pillar of cloud and fire', 14], ['Quail', 10], ["Their clothes didn't wear out", 6]], {
        notes: 'Deuteronomy 8:4 mentions the clothes that did not wear out.',
      }),
      q('pk-ba-06', ACCOUNTS, 'Name something David is known for.', [['Facing Goliath', 30], ['Being a shepherd', 20], ['Playing the harp', 18], ['Being king', 16], ['Writing psalms', 16]]),
      q('pk-ba-07', ACCOUNTS, 'Name something Daniel did.', [['Prayed to Jehovah', 30], ["Was put in the lions' pit", 26], ['Explained dreams', 18], ["Refused the king's food", 14], ['Read the writing on the wall', 12]]),
      q('pk-ba-08', ACCOUNTS, 'Name someone who was brave for Jehovah while young.', [['David', 30], ['Daniel', 22], ['Samuel', 16], ['Josiah', 12], ['Esther', 12], ["The little girl who helped Naaman", 8]], {
        notes: 'The Israelite girl is in 2 Kings 5:2-3.',
      }),
      q('pk-ba-09', ACCOUNTS, 'Name a lesson from the account of Jonah.', [['Obey Jehovah', 30], ['Jehovah is merciful', 24], ["You can't hide from Jehovah", 18], ['Pray when you are in trouble', 16], ['Care about others', 12]], FINAL),
      q('pk-ba-10', ACCOUNTS, 'Name one of the plagues on Egypt.', [['Frogs', 30], ['Water to blood', 26], ['Locusts', 18], ['Darkness', 14], ['Hail', 12]], { ...FC, alternates: [['Blood', 1], ['Grasshoppers', 2]] }),
      q('pk-ba-11', ACCOUNTS, 'Name something that happened to Joseph.', [['Sold by his brothers', 30], ['Put in prison', 24], ['Became a ruler in Egypt', 20], ['Explained dreams', 14], ['Got a special robe', 12]], {
        ...FC,
        alternates: [['Went to jail', 1], ['Prison', 1], ['Ruled Egypt', 2], ['Coat', 4], ['Colorful coat', 4]],
      }),
      q('pk-ba-12', ACCOUNTS, 'Name something Jehovah gave the Israelites in the wilderness.', [['Manna', 36], ['Water', 24], ['Quail', 18], ['The Law', 12], ['Guidance', 10]], {
        ...FC,
        alternates: [['Bread from heaven', 0], ['Food', 0], ['Ten Commandments', 3], ['Pillar of cloud', 4]],
      }),
      q('pk-ba-13', ACCOUNTS, "Name something about Noah's ark.", [['Animals', 32], ['Wood', 22], ['The Flood', 20], ['Rain', 14], ['Rainbow', 12]], FC),
      q('pk-ba-14', ACCOUNTS, 'Name someone in the Bible who prayed.', [['Daniel', 30], ['Jesus', 26], ['Hannah', 16], ['David', 16], ['Nehemiah', 12]], FC),
    ],
  },
  {
    id: 'little-ones',
    name: 'Little Ones',
    description: 'Short, simple questions young children can answer.',
    released: LAUNCH,
    questions: [
      q('pk-lo-01', LITTLE, "Name an animal on Noah's ark.", [['Elephant', 28], ['Lion', 24], ['Giraffe', 20], ['Dog', 16], ['Dove', 12]]),
      q('pk-lo-02', LITTLE, 'Name a color in the rainbow.', [['Red', 28], ['Blue', 24], ['Yellow', 20], ['Green', 16], ['Purple', 12]]),
      q('pk-lo-03', LITTLE, 'Name someone in your family.', [['Mom', 30], ['Dad', 28], ['Sister', 16], ['Brother', 16], ['Grandma', 10]]),
      q('pk-lo-04', LITTLE, 'Name something you do before bed.', [['Pray', 30], ['Brush teeth', 26], ['Take a bath', 18], ['Read a story', 16], ['Put on pajamas', 10]]),
      q('pk-lo-05', LITTLE, 'Name something Jehovah made.', [['Animals', 26], ['People', 22], ['Trees', 20], ['Flowers', 16], ['The sun', 16]]),
      q('pk-lo-06', LITTLE, 'Name a polite thing to say.', [['Please', 34], ['Thank you', 30], ["I'm sorry", 16], ['Excuse me', 12], ["You're welcome", 8]]),
      q('pk-lo-07', LITTLE, 'Name something you bring to the meeting.', [['Bible', 36], ['Tablet', 20], ['Notebook', 18], ['Water', 14], ['Pencil', 12]]),
      q('pk-lo-08', LITTLE, 'Name a farm animal.', [['Cow', 28], ['Sheep', 24], ['Horse', 20], ['Pig', 16], ['Chicken', 12]]),
      q('pk-lo-09', LITTLE, 'Name a way to be kind.', [['Share', 30], ['Help someone', 24], ['Give a hug', 18], ['Say nice words', 16], ['Pray for someone', 12]], FINAL),
      q('pk-lo-10', LITTLE, "Name an animal on Noah's ark.", [['Elephant', 30], ['Lion', 26], ['Giraffe', 20], ['Zebra', 14], ['Dove', 10]], FC),
      q('pk-lo-11', LITTLE, 'Name something that is yellow.', [['The sun', 32], ['Banana', 26], ['Lemon', 18], ['Baby chick', 14], ['Corn', 10]], { ...FC, alternates: [['Sun', 0], ['Chick', 3], ['Duckling', 3]] }),
      q('pk-lo-12', LITTLE, 'Name something you do before bed.', [['Pray', 34], ['Brush teeth', 28], ['Take a bath', 18], ['Read a story', 12], ['Give hugs', 8]], { ...FC, alternates: [['Bath', 2], ['Story', 3], ['Hug', 4]] }),
      q('pk-lo-13', LITTLE, 'Name a polite thing to say.', [['Please', 36], ['Thank you', 32], ["I'm sorry", 14], ['Excuse me', 10], ["You're welcome", 8]], { ...FC, alternates: [['Thanks', 1], ['Sorry', 2]] }),
      q('pk-lo-14', LITTLE, 'Name something you see in the sky.', [['The sun', 32], ['The moon', 26], ['Stars', 20], ['Clouds', 14], ['Birds', 8]], { ...FC, alternates: [['Sun', 0], ['Moon', 1]] }),
    ],
  },
  {
    id: 'family-life',
    name: 'Family Life',
    description: 'Helping at home, kindness, forgiveness and Jehovah’s qualities.',
    released: LAUNCH,
    questions: [
      q('pk-fl-01', FAMILY, 'Name a way children can help at home.', [['Clean their room', 28], ['Wash the dishes', 22], ['Take out the trash', 16], ['Fold laundry', 14], ['Help cook', 12], ['Feed the pet', 8]]),
      q('pk-fl-02', FAMILY, 'Name a way to show respect to your parents.', [['Obey', 30], ['Listen', 24], ['Say thank you', 16], ['Help without being asked', 14], ['Speak kindly', 10], ['Tell the truth', 6]]),
      q('pk-fl-03', FAMILY, 'Name something that makes a family happy.', [['Spending time together', 26], ['Family worship', 22], ['Laughing together', 18], ['Eating together', 14], ['Kind words', 12], ['Forgiving each other', 8]]),
      q('pk-fl-04', FAMILY, 'Name a way to show patience.', [['Wait your turn', 30], ['Stay calm', 24], ['Listen', 18], ["Don't interrupt", 14], ['Forgive', 14]]),
      q('pk-fl-05', FAMILY, "Name something to do when you've hurt someone's feelings.", [['Say sorry', 38], ['Ask for forgiveness', 22], ['Give a hug', 16], ['Make it right', 14], ['Pray about it', 10]]),
      q('pk-fl-06', FAMILY, 'Name a way to be a good friend.', [['Share', 26], ['Listen', 22], ['Be kind', 18], ['Encourage them', 16], ['Forgive', 12], ['Be loyal', 6]]),
      q('pk-fl-07', FAMILY, 'Name something a family can pray about together.', [['Thanks for the food', 26], ['Family members', 22], ['Our brothers and sisters', 18], ['Help with problems', 16], ['The ministry', 12], ['Safety', 6]]),
      q('pk-fl-08', FAMILY, 'Name a quality Jehovah shows.', [['Love', 34], ['Wisdom', 18], ['Justice', 18], ['Power', 14], ['Mercy', 10], ['Patience', 6]]),
      q('pk-fl-09', FAMILY, 'Name a way to make family worship fun.', [['Play a game', 26], ['Act out a Bible account', 18], ['Draw pictures', 18], ['Have a snack', 14], ['Watch a video', 14], ['Let the kids pick the topic', 10]], FINAL),
      q('pk-fl-10', FAMILY, 'Name a chore children do at home.', [['Clean their room', 32], ['Dishes', 24], ['Take out the trash', 18], ['Laundry', 14], ['Feed the pet', 12]], {
        ...FC,
        alternates: [['Wash dishes', 1], ['Trash', 2], ['Fold clothes', 3], ['Make the bed', 0]],
      }),
      q('pk-fl-11', FAMILY, 'Name something you say when you make a mistake.', [["I'm sorry", 40], ['Oops', 22], ['Please forgive me', 18], ['My fault', 12], ["I'll fix it", 8]], { ...FC, alternates: [['Sorry', 0], ['Forgive me', 2]] }),
      q('pk-fl-12', FAMILY, 'Name a quality Jehovah has.', [['Love', 36], ['Wisdom', 22], ['Justice', 18], ['Power', 14], ['Mercy', 10]], FC),
      q('pk-fl-13', FAMILY, 'Name something families do together at dinner.', [['Eat', 30], ['Talk', 26], ['Pray', 22], ['Laugh', 12], ['Share about their day', 10]], FC),
      q('pk-fl-14', FAMILY, 'Name a way to show love to your family.', [['Hug them', 30], ['Help them', 24], ['Say "I love you"', 20], ['Spend time together', 14], ['Give a gift', 12]], { ...FC, alternates: [['Hugs', 0], ['I love you', 2]] }),
    ],
  },
  {
    id: 'bible-places',
    name: 'Bible Places',
    description: 'Cities, seas, mountains and lands from the Bible.',
    released: LAUNCH,
    questions: [
      q('pk-bp-01', PLACES, 'Name a city in the Bible.', [['Jerusalem', 30], ['Bethlehem', 20], ['Nazareth', 14], ['Babylon', 12], ['Jericho', 10], ['Nineveh', 8], ['Rome', 6]]),
      q('pk-bp-02', PLACES, 'Name a sea or river in the Bible.', [['Red Sea', 30], ['Jordan River', 24], ['Sea of Galilee', 18], ['Nile River', 12], ['Salt Sea', 10], ['Euphrates River', 6]], {
        notes: 'The Salt Sea is today called the Dead Sea.',
        alternates: [['Dead Sea', 4]],
      }),
      q('pk-bp-03', PLACES, 'Name a mountain in the Bible.', [['Mount Sinai', 34], ['Mount of Olives', 20], ['Mountains of Ararat', 16], ['Mount Carmel', 14], ['Mount Zion', 10], ['Mount Hermon', 6]]),
      q('pk-bp-04', PLACES, 'Name a country or land in the Bible.', [['Egypt', 30], ['Israel', 24], ['Canaan', 18], ['Persia', 12], ['Assyria', 10], ['Moab', 6]]),
      q('pk-bp-05', PLACES, 'Name a place the apostle Paul visited.', [['Rome', 26], ['Corinth', 18], ['Ephesus', 18], ['Athens', 14], ['Philippi', 12], ['Antioch', 12]]),
      q('pk-bp-06', PLACES, 'Name a place where a famous Bible event happened.', [['The Red Sea', 26], ['Jericho', 22], ['Bethlehem', 20], ['Mount Sinai', 14], ['The garden of Eden', 12], ['Babel', 6]]),
      q('pk-bp-07', PLACES, 'Name a place connected with Abraham.', [['Ur', 30], ['Canaan', 24], ['Haran', 18], ['Egypt', 12], ['Hebron', 10], ['Moriah', 6]]),
      q('pk-bp-08', PLACES, 'Name a place where Jesus performed a miracle.', [['Cana', 26], ['Capernaum', 22], ['Sea of Galilee', 20], ['Bethany', 16], ['Jerusalem', 10], ['Nain', 6]]),
      q('pk-bp-09', PLACES, 'Name a Bible place you would like to visit.', [['Jerusalem', 28], ['The garden of Eden', 22], ['Sea of Galilee', 18], ['Bethlehem', 14], ['Mount Sinai', 10], ['Egypt', 8]], FINAL),
      q('pk-bp-10', PLACES, 'Name a city in the Bible.', [['Jerusalem', 34], ['Bethlehem', 24], ['Nazareth', 18], ['Babylon', 14], ['Jericho', 10]], FC),
      q('pk-bp-11', PLACES, 'Name a sea or river in the Bible.', [['Red Sea', 32], ['Jordan River', 26], ['Sea of Galilee', 20], ['Nile', 12], ['Dead Sea', 10]], { ...FC, alternates: [['Salt Sea', 4]] }),
      q('pk-bp-12', PLACES, 'Name a mountain in the Bible.', [['Mount Sinai', 36], ['Mount of Olives', 24], ['Mount Ararat', 18], ['Mount Carmel', 12], ['Mount Zion', 10]], FC),
      q('pk-bp-13', PLACES, 'Name a country in the Bible.', [['Egypt', 36], ['Israel', 28], ['Canaan', 16], ['Persia', 12], ['Greece', 8]], FC),
      q('pk-bp-14', PLACES, 'Name a place Paul traveled to.', [['Rome', 32], ['Ephesus', 22], ['Corinth', 20], ['Athens', 16], ['Philippi', 10]], FC),
    ],
  },
  {
    id: 'paradise-hope',
    name: 'The Paradise Hope',
    description: 'What the Bible promises about life on a paradise earth.',
    released: LAUNCH,
    questions: [
      q('pk-ph-01', HOPE, 'Name something you look forward to in Paradise.', [['Seeing loved ones again', 28], ['No more sickness', 22], ['Peace with the animals', 18], ['Beautiful gardens', 14], ['Living forever', 12], ['No more tears', 6]], {
        notes: 'Revelation 21:4; Isaiah 11:6-9; Acts 24:15.',
      }),
      q('pk-ph-02', HOPE, 'Name an animal you would like to pet in Paradise.', [['Lion', 32], ['Tiger', 18], ['Bear', 16], ['Elephant', 12], ['Panda', 12], ['Wolf', 10]], { notes: 'Isaiah 11:6-9.' }),
      q('pk-ph-03', HOPE, 'Name something that will be gone in Paradise.', [['Sickness', 28], ['Death', 22], ['Crying', 16], ['War', 14], ['Pain', 12], ['Hunger', 8]], {
        notes: 'Revelation 21:4; Psalm 46:9; Psalm 72:16; Isaiah 33:24.',
      }),
      q('pk-ph-04', HOPE, 'Name a faithful person from the Bible you want to meet in the resurrection.', [['David', 22], ['Noah', 20], ['Daniel', 18], ['Esther', 14], ['Moses', 14], ['Abraham', 12]], {
        notes: 'Acts 24:15.',
      }),
      q('pk-ph-05', HOPE, 'Name something people will do in Paradise.', [['Plant gardens', 24], ['Build houses', 22], ['Welcome back resurrected ones', 18], ['Enjoy good food', 16], ['Play with animals', 12], ['Learn new things', 8]], {
        notes: 'Isaiah 65:21-22.',
      }),
      q('pk-ph-06', HOPE, 'Name a scripture that describes Paradise.', [['Revelation 21:4', 30], ['Isaiah 11:6-9', 20], ['Isaiah 65:21, 22', 16], ['Psalm 37:29', 14], ['Isaiah 35:5, 6', 12], ['Isaiah 33:24', 8]]),
      q('pk-ph-07', HOPE, 'Name something you would like to learn in Paradise.', [['Play an instrument', 24], ['Another language', 20], ['All about animals', 18], ['How to build things', 14], ['Gardening', 14], ['Painting', 10]]),
      q('pk-ph-08', HOPE, 'Name a promise Jehovah makes about the future.', [['No more death', 28], ['A paradise earth', 24], ['The resurrection', 18], ['Peace everywhere', 14], ['Perfect health', 10], ['Plenty of food', 6]]),
      q('pk-ph-09', HOPE, 'Name the first thing you would like to do in Paradise.', [['See family members', 28], ['Hug an animal', 22], ['Explore', 18], ['Thank Jehovah', 16], ['Eat something delicious', 10], ['Rest', 6]], FINAL),
      q('pk-ph-10', HOPE, 'Name something that will be gone in Paradise.', [['Sickness', 32], ['Death', 26], ['Crying', 18], ['Pain', 14], ['War', 10]], { ...FC, alternates: [['Being sick', 0], ['Tears', 2], ['Sadness', 2]] }),
      q('pk-ph-11', HOPE, 'Name an animal you would like to hug in Paradise.', [['Lion', 34], ['Tiger', 20], ['Bear', 18], ['Elephant', 16], ['Panda', 12]], FC),
      q('pk-ph-12', HOPE, 'Name something people will do in Paradise.', [['Garden', 30], ['Build houses', 24], ['Welcome the resurrected', 20], ['Eat good food', 14], ['Explore', 12]], {
        ...FC,
        alternates: [['Plant', 0], ['Farm', 0], ['Build homes', 1], ['Resurrection', 2]],
      }),
      q('pk-ph-13', HOPE, 'Name a faithful person you would like to meet in the resurrection.', [['David', 28], ['Noah', 24], ['Daniel', 20], ['Moses', 16], ['Esther', 12]], FC),
      q('pk-ph-14', HOPE, 'Name something you will see in Paradise.', [['Animals', 30], ['Gardens', 26], ['Family', 22], ['Mountains', 12], ['Rivers', 10]], { ...FC, alternates: [['Flowers', 1], ['Loved ones', 2]] }),
    ],
  },
  /* ---------- Beginner-friendly packs: no Bible background needed ---------- */
  {
    id: 'bible-basics',
    name: 'Bible Basics',
    description: 'Easy questions about the best-known people and teachings in the Bible.',
    released: LAUNCH,
    questions: [
      q('pk-bb-01', BASICS, 'Name someone who lived in the garden of Eden.', [['Adam', 44], ['Eve', 38], ['The serpent', 10], ['The animals', 8]]),
      q('pk-bb-02', BASICS, 'Name something Jehovah created.', [['The earth', 24], ['Animals', 22], ['People', 18], ['The sun', 14], ['Trees and plants', 12], ['The stars', 10]]),
      q('pk-bb-03', BASICS, 'Name a famous person from the Bible.', [['Jesus', 30], ['Moses', 18], ['Noah', 16], ['David', 14], ['Abraham', 12], ['Mary', 10]]),
      q('pk-bb-04', BASICS, 'Name something Jesus taught people to do.', [['Love one another', 28], ['Pray', 22], ['Forgive', 18], ['Be kind', 14], ['Help others', 10], ['Tell the truth', 8]]),
      q('pk-bb-05', BASICS, 'Name an animal from a famous Bible story.', [['Lion', 26], ['Big fish', 22], ['Snake', 18], ['Dove', 14], ['Sheep', 12], ['Donkey', 8]]),
      q('pk-bb-06', BASICS, 'Name a way people in the Bible talked to God.', [['Prayer', 44], ['Songs', 20], ['Calling out for help', 14], ['Giving thanks', 12], ['Through prophets', 10]]),
      q('pk-bb-07', BASICS, 'Name something that happened to baby Jesus.', [['Born in Bethlehem', 30], ['Laid in a manger', 26], ['Visited by shepherds', 18], ['Named Jesus', 14], ['Taken to Egypt', 12]], {
        notes: 'Luke 2:7-21; Matthew 2:13-15.',
      }),
      q('pk-bb-08', BASICS, 'Name something the Bible says is good for a family.', [['Love', 30], ['Prayer', 22], ['Kindness', 16], ['Forgiveness', 14], ['Honesty', 10], ['Working together', 8]]),
      q('pk-bb-09', BASICS, 'Name a Bible lesson almost everyone knows.', [['Love your neighbor', 28], ['Do not steal', 20], ['Forgive others', 18], ['Tell the truth', 14], ['Honor your parents', 12], ['Be humble', 8]], FINAL),
      q('pk-bb-10', BASICS, 'Name a famous person from the Bible.', [['Jesus', 34], ['Moses', 20], ['Noah', 18], ['David', 16], ['Mary', 12]], FC),
      q('pk-bb-11', BASICS, 'Name something Jehovah created.', [['Animals', 30], ['The earth', 24], ['People', 20], ['The sun', 14], ['Flowers', 12]], { ...FC, alternates: [['Earth', 1], ['Humans', 2], ['Sun', 3], ['Plants', 4]] }),
      q('pk-bb-12', BASICS, 'Name something Jesus taught.', [['Love', 32], ['Prayer', 24], ['Forgiveness', 20], ['Kindness', 14], ['Humility', 10]], { ...FC, alternates: [['Love one another', 0], ['Forgive', 2], ['Be kind', 3]] }),
      q('pk-bb-13', BASICS, 'Name something that happened when Jesus was born.', [['Born in Bethlehem', 34], ['Laid in a manger', 26], ['Shepherds came', 20], ['Angels appeared', 12], ['Mary and Joseph traveled', 8]], {
        ...FC,
        alternates: [['Bethlehem', 0], ['Manger', 1], ['Shepherds', 2], ['Angels', 3]],
      }),
      q('pk-bb-14', BASICS, 'Name an animal from a famous Bible story.', [['Lion', 32], ['Big fish', 26], ['Snake', 18], ['Dove', 14], ['Donkey', 10]], { ...FC, alternates: [['Whale', 1], ['Serpent', 2]] }),
    ],
  },
  {
    id: 'famous-stories',
    name: 'Famous Bible Stories',
    description: 'Noah, David and Goliath, Jonah, Daniel and more, told simply.',
    released: LAUNCH,
    questions: [
      q('pk-fs-01', STORIES, 'Name something from the story of Noah.', [['The ark', 32], ['Animals', 24], ['The Flood', 18], ['Rain', 12], ['The rainbow', 8], ['The dove', 6]]),
      q('pk-fs-02', STORIES, 'Name something from the story of David and Goliath.', [['A sling', 30], ['Stones', 24], ['A giant', 20], ['Courage', 14], ['A shepherd boy', 12]]),
      q('pk-fs-03', STORIES, 'Name something from the story of Jonah.', [['A big fish', 42], ['Running away', 18], ['A storm', 16], ['Nineveh', 12], ['A boat', 12]]),
      q('pk-fs-04', STORIES, 'Name something from the story of Daniel.', [['Lions', 42], ['Praying', 22], ['The king', 16], ['A pit', 12], ['An angel', 8]]),
      q('pk-fs-05', STORIES, 'Name something from the story of Moses.', [['Parting the sea', 26], ['A burning bush', 20], ['The Ten Commandments', 18], ['Plagues', 14], ['Baby in a basket', 12], ['Pharaoh', 10]]),
      q('pk-fs-06', STORIES, 'Name something from the story of Adam and Eve.', [['The garden of Eden', 30], ['The fruit', 26], ['The serpent', 20], ['The tree', 14], ['Animals', 10]]),
      q('pk-fs-07', STORIES, 'Name something from the story of Jesus’ birth.', [['A manger', 30], ['Bethlehem', 22], ['Shepherds', 18], ['Mary', 16], ['Joseph', 14]]),
      q('pk-fs-08', STORIES, 'Name something Jesus did in a famous story.', [['Walked on water', 28], ['Fed thousands of people', 22], ['Healed people', 20], ['Calmed a storm', 16], ['Turned water into wine', 14]]),
      q('pk-fs-09', STORIES, 'Name a Bible story children love.', [["Noah's ark", 28], ['David and Goliath', 24], ['Jonah and the big fish', 20], ['Daniel and the lions', 16], ['Moses and the Red Sea', 12]], FINAL),
      q('pk-fs-10', STORIES, 'Name something from the story of Noah.', [['Ark', 34], ['Animals', 28], ['Flood', 18], ['Rain', 12], ['Rainbow', 8]], { ...FC, alternates: [['Boat', 0]] }),
      q('pk-fs-11', STORIES, 'Name something from the story of Jonah.', [['Big fish', 44], ['Storm', 20], ['Boat', 16], ['Nineveh', 12], ['Running away', 8]], { ...FC, alternates: [['Whale', 0], ['Ship', 2], ['Ran away', 4]] }),
      q('pk-fs-12', STORIES, 'Name something from the story of David and Goliath.', [['Sling', 32], ['Stone', 26], ['Giant', 22], ['Shepherd', 12], ['Courage', 8]], { ...FC, alternates: [['Slingshot', 0], ['Rocks', 1], ['Goliath', 2], ['Brave', 4]] }),
      q('pk-fs-13', STORIES, 'Name something from the story of Moses.', [['Red Sea', 30], ['Burning bush', 24], ['Ten Commandments', 20], ['Plagues', 14], ['Basket', 12]], {
        ...FC,
        alternates: [['Parted the sea', 0], ['Parting the sea', 0], ['Frogs', 3]],
      }),
      q('pk-fs-14', STORIES, 'Name a Bible story children love.', [["Noah's ark", 30], ['David and Goliath', 26], ['Jonah', 20], ['Daniel and the lions', 14], ['Moses', 10]], {
        ...FC,
        alternates: [['Noah', 0], ['Goliath', 1], ['Jonah and the whale', 2], ['Daniel', 3]],
      }),
    ],
  },
  {
    id: 'everyday-values',
    name: 'Everyday Values',
    description: 'Kindness, honesty, respect and friendship. Anyone can play, no Bible background needed.',
    released: LAUNCH,
    questions: [
      q('pk-ev-01', VALUES, 'Name something that makes a good friend.', [['Kindness', 28], ['Loyalty', 20], ['Honesty', 18], ['Being fun', 14], ['Listening', 12], ['Sharing', 8]]),
      q('pk-ev-02', VALUES, 'Name a way to say thank you.', [['Say it', 30], ['Write a card', 22], ['Give a hug', 18], ['Help them back', 14], ['Give a small gift', 10], ['Smile', 6]]),
      q('pk-ev-03', VALUES, 'Name something you can share.', [['Food', 28], ['Toys', 22], ['Time', 18], ['Kind words', 14], ['A smile', 10], ['Clothes', 8]]),
      q('pk-ev-04', VALUES, 'Name a way to help a neighbor.', [['Carry their groceries', 22], ['Mow their lawn', 20], ['Check on them', 18], ['Bring a meal', 16], ['Watch their pet', 14], ['Say hello', 10]]),
      q('pk-ev-05', VALUES, 'Name something that makes you happy.', [['Family', 28], ['Friends', 22], ['Good food', 16], ['Playing', 14], ['Being outside', 12], ['Music', 8]]),
      q('pk-ev-06', VALUES, "Name a way to calm down when you're upset.", [['Take deep breaths', 30], ['Pray', 22], ['Talk to someone', 18], ['Take a walk', 14], ['Count to ten', 10], ['Rest', 6]]),
      q('pk-ev-07', VALUES, 'Name something honest people do.', [['Tell the truth', 38], ['Keep promises', 22], ['Return things', 16], ['Admit mistakes', 14], ['Pay what they owe', 10]]),
      q('pk-ev-08', VALUES, 'Name a way to show respect.', [['Listen', 28], ['Say please and thank you', 24], ['Be polite', 18], ['Wait your turn', 16], ["Don't interrupt", 14]]),
      q('pk-ev-09', VALUES, 'Name something that makes a home peaceful.', [['Kindness', 26], ['Forgiveness', 20], ['Prayer', 18], ['Laughter', 16], ['Patience', 12], ['A tidy house', 8]], FINAL),
      q('pk-ev-10', VALUES, 'Name something that makes a good friend.', [['Kindness', 32], ['Honesty', 24], ['Loyalty', 20], ['Being fun', 14], ['Listening', 10]], { ...FC, alternates: [['Kind', 0], ['Honest', 1], ['Loyal', 2], ['Funny', 3]] }),
      q('pk-ev-11', VALUES, 'Name something you can share.', [['Food', 34], ['Toys', 26], ['Time', 18], ['Kind words', 12], ['A smile', 10]], { ...FC, alternates: [['Snacks', 0], ['Candy', 0], ['Games', 1]] }),
      q('pk-ev-12', VALUES, 'Name a way to show respect.', [['Listen', 32], ['Say please', 26], ['Be polite', 20], ['Wait your turn', 12], ["Don't interrupt", 10]], { ...FC, alternates: [['Say thank you', 1], ['Manners', 2]] }),
      q('pk-ev-13', VALUES, 'Name something that makes you happy.', [['Family', 32], ['Friends', 26], ['Food', 18], ['Playing', 14], ['Music', 10]], { ...FC, alternates: [['My family', 0], ['Games', 3]] }),
      q('pk-ev-14', VALUES, 'Name a way to calm down.', [['Deep breaths', 34], ['Pray', 24], ['Talk to someone', 20], ['Take a walk', 12], ['Count to ten', 10]], { ...FC, alternates: [['Breathe', 0], ['Prayer', 1], ['Walk', 3]] }),
    ],
  },
];

/** The launch packs, then the Bible-era packs generated by tools/packs/build.py. */
export const QUESTION_PACKS: QuestionPack[] = [...LAUNCH_PACKS, ...ERA_PACKS];

export function findPack(id: string): QuestionPack | undefined {
  return QUESTION_PACKS.find((p) => p.id === id);
}
