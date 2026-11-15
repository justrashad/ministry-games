import { myth, truth, type StatementPack } from './statementBuilder';

/*
 * The starter pack that comes with Kingdom Squares: 60 statements in 6 categories,
 * two at each level from 1 (easiest) to 5, half true and half false. Every false
 * statement carries a correction that says what the Bible account actually says.
 *
 * Statements are written in our own words. References point to the scripture the
 * answer rests on; no verse text is quoted. Ids are shared with the Spanish pack.
 */

const ACCOUNTS = 'Bible Accounts';
const JESUS = 'Life of Jesus';
const PEOPLE = 'Bible People';
const PLACES = 'Bible Places';
const CREATION = 'Creation and Animals';
const EARLY = 'The Early Congregation';

export const STARTER_PACK: StatementPack = {
  id: 'starter',
  name: 'Starter Pack',
  description: 'Sixty true or false statements for the whole family, from well-known accounts to deeper study.',
  statements: [
    truth('ks-acc-1', ACCOUNTS, 1, 'Noah built an ark before the Flood.', 'Genesis 6:14'),
    myth('ks-acc-2', ACCOUNTS, 1, 'David brought Goliath down with an arrow.', 'David brought him down with a stone from his sling, then used Goliath\'s own sword to make sure he was dead.', '1 Samuel 17:49-51'),
    truth('ks-acc-3', ACCOUNTS, 2, 'The wall of Jericho fell down flat after Israel marched around the city for seven days.', 'Joshua 6:15, 20'),
    myth('ks-acc-4', ACCOUNTS, 2, 'Jonah tried to run away to Nineveh.', 'Jehovah sent Jonah to Nineveh. Jonah tried to run away to Tarshish.', 'Jonah 1:2, 3'),
    truth('ks-acc-5', ACCOUNTS, 3, 'Daniel was thrown into a pit of lions because he kept praying to Jehovah.', 'Daniel 6:10, 16'),
    myth('ks-acc-6', ACCOUNTS, 3, "Joseph's brothers sold him to Pharaoh.", 'They sold him to the Ishmaelites for 20 pieces of silver, and the Ishmaelites took him into Egypt.', 'Genesis 37:27, 28'),
    truth('ks-acc-7', ACCOUNTS, 4, "Gideon's army was cut down to 300 men before the battle with Midian.", 'Judges 7:7'),
    myth('ks-acc-8', ACCOUNTS, 4, "Samson's strength left him when his eyes were put out.", 'His power left him after the seven braids of his head were shaved off.', 'Judges 16:19'),
    truth('ks-acc-9', ACCOUNTS, 5, 'Elijah challenged the prophets of Baal on Mount Carmel.', '1 Kings 18:19, 20'),
    myth('ks-acc-10', ACCOUNTS, 5, 'The sun stood still during a battle led by Moses.', 'It happened during a battle led by Joshua.', 'Joshua 10:12, 13'),

    truth('ks-jesus-1', JESUS, 1, 'Jesus was born in Bethlehem.', 'Matthew 2:1'),
    myth('ks-jesus-2', JESUS, 1, 'Jesus grew up in the city of Jerusalem.', 'He grew up in Nazareth.', 'Luke 2:39, 51'),
    truth('ks-jesus-3', JESUS, 2, 'Jesus turned water into wine at a marriage feast in Cana.', 'John 2:1-11'),
    myth('ks-jesus-4', JESUS, 2, 'Jesus chose 10 apostles.', 'He chose 12 apostles.', 'Luke 6:13'),
    truth('ks-jesus-5', JESUS, 3, 'Jesus fed thousands of people with five loaves and two fish.', 'Matthew 14:17-21'),
    myth('ks-jesus-6', JESUS, 3, 'Jesus was baptized in the Red Sea.', 'He was baptized in the Jordan River.', 'Matthew 3:13'),
    truth('ks-jesus-7', JESUS, 4, 'Jesus raised Lazarus after he had been dead for four days.', 'John 11:17, 43, 44'),
    myth('ks-jesus-8', JESUS, 4, 'Peter denied knowing Jesus two times.', 'Peter denied knowing Jesus three times.', 'Matthew 26:75'),
    truth('ks-jesus-9', JESUS, 5, 'Andrew and his brother Peter were fishermen when Jesus called them.', 'Matthew 4:18, 19'),
    myth('ks-jesus-10', JESUS, 5, "In Jesus' illustration of the neighborly Samaritan, a priest stopped to help the injured man.", 'The priest passed by on the opposite side. The Samaritan helped him.', 'Luke 10:31-34'),

    truth('ks-people-1', PEOPLE, 1, 'Adam was the first man.', 'Genesis 2:7'),
    truth('ks-people-2', PEOPLE, 1, 'Aaron was the brother of Moses.', 'Exodus 4:14'),
    truth('ks-people-3', PEOPLE, 2, 'Methuselah lived longer than anyone else in the Bible record.', 'Genesis 5:27'),
    myth('ks-people-4', PEOPLE, 2, 'Ruth came from the land of Egypt.', 'Ruth came from Moab.', 'Ruth 1:4'),
    truth('ks-people-5', PEOPLE, 3, 'Esther became the queen of Persia.', 'Esther 1:3; 2:17'),
    myth('ks-people-6', PEOPLE, 3, "Abraham's wife was named Rachel.", "Abraham's wife was Sarah. Rachel was Jacob's wife.", 'Genesis 17:15; 29:28'),
    myth('ks-people-7', PEOPLE, 4, 'Samuel was a grown man when he began ministering before Jehovah.', 'He was ministering before Jehovah though he was just a boy.', '1 Samuel 2:18'),
    myth('ks-people-8', PEOPLE, 4, 'King Saul was from the tribe of Judah.', 'Saul was from the tribe of Benjamin.', '1 Samuel 9:1, 2'),
    truth('ks-people-9', PEOPLE, 5, 'Enoch walked with the true God.', 'Genesis 5:24'),
    myth('ks-people-10', PEOPLE, 5, 'Moses led Israel into the Promised Land.', 'Moses saw the land from a mountain but did not enter it. Joshua led Israel in.', 'Deuteronomy 34:4; Joshua 1:2'),

    truth('ks-places-1', PLACES, 1, 'Adam and Eve lived in the garden of Eden.', 'Genesis 2:8'),
    myth('ks-places-2', PLACES, 1, 'Moses received the Ten Commandments on Mount Carmel.', 'He received them on Mount Sinai.', 'Exodus 19:20; 31:18'),
    truth('ks-places-3', PLACES, 2, "Noah's ark came to rest on the mountains of Ararat.", 'Genesis 8:4'),
    myth('ks-places-4', PLACES, 2, 'Jehovah sent Jonah to preach in Babylon.', 'Jehovah sent him to Nineveh.', 'Jonah 1:2'),
    truth('ks-places-5', PLACES, 3, 'The disciples were first called Christians in Antioch.', 'Acts 11:26'),
    myth('ks-places-6', PLACES, 3, 'The apostle John received the Revelation on the island of Cyprus.', 'He was on the island of Patmos.', 'Revelation 1:9'),
    myth('ks-places-7', PLACES, 4, 'The Jordan River flows into the Mediterranean Sea.', 'It flows into the Salt Sea, also called the Dead Sea.', 'Joshua 3:16'),
    truth('ks-places-8', PLACES, 4, 'Abraham came from the city of Ur.', 'Genesis 11:31'),
    truth('ks-places-9', PLACES, 5, 'The apostle Paul came from the city of Tarsus.', 'Acts 21:39'),
    myth('ks-places-10', PLACES, 5, 'Lydia, the seller of purple, came from Corinth.', 'She came from the city of Thyatira.', 'Acts 16:14'),

    truth('ks-creation-1', CREATION, 1, 'Jehovah created light on the first day.', 'Genesis 1:3-5'),
    myth('ks-creation-2', CREATION, 1, 'Jehovah made the first woman from the dust of the ground.', 'He built the woman from a rib that he took from the man.', 'Genesis 2:21, 22'),
    truth('ks-creation-3', CREATION, 2, 'Adam gave names to the animals.', 'Genesis 2:19, 20'),
    myth('ks-creation-4', CREATION, 2, 'Jehovah created humans on the third day.', 'Humans were created on the sixth day.', 'Genesis 1:27, 31'),
    truth('ks-creation-5', CREATION, 3, 'A donkey spoke to Balaam.', 'Numbers 22:28'),
    myth('ks-creation-6', CREATION, 3, 'Ravens brought Elisha bread and meat.', 'Ravens brought food to Elijah.', '1 Kings 17:6'),
    truth('ks-creation-7', CREATION, 4, 'Samson killed a lion with nothing in his hands.', 'Judges 14:5, 6'),
    myth('ks-creation-8', CREATION, 4, 'Noah took only one of each kind of animal into the ark.', 'He took at least two of each kind, and seven of some.', 'Genesis 7:2, 3'),
    truth('ks-creation-9', CREATION, 5, 'Jesus once told Peter to find a coin in the mouth of a fish.', 'Matthew 17:27'),
    myth('ks-creation-10', CREATION, 5, 'Jehovah created the stars on the seventh day.', 'On the seventh day he rested from his work of creation.', 'Genesis 2:2'),

    truth('ks-early-1', EARLY, 1, 'Saul of Tarsus later became known as the apostle Paul.', 'Acts 13:9'),
    myth('ks-early-2', EARLY, 1, 'The holy spirit was poured out on the disciples at the Festival of Booths.', 'It was poured out during the Festival of Pentecost.', 'Acts 2:1-4'),
    myth('ks-early-3', EARLY, 2, 'Paul wrote every book of the Christian Greek Scriptures.', 'Paul wrote many letters, and others such as Peter, James and John also wrote.', '1 Peter 1:1; James 1:1'),
    truth('ks-early-4', EARLY, 2, 'Tabitha, also called Dorcas, was raised from the dead by Peter.', 'Acts 9:36, 40'),
    truth('ks-early-5', EARLY, 3, 'Matthias was chosen to take the place of Judas Iscariot.', 'Acts 1:26'),
    myth('ks-early-6', EARLY, 3, "Timothy's mother was named Lois.", 'His mother was Eunice. Lois was his grandmother.', '2 Timothy 1:5'),
    truth('ks-early-7', EARLY, 4, 'Stephen was stoned to death after giving a witness before the Sanhedrin.', 'Acts 6:12, 15; 7:59, 60'),
    myth('ks-early-8', EARLY, 4, 'Cornelius was a tax collector in Caesarea.', 'Cornelius was an army officer.', 'Acts 10:1'),
    truth('ks-early-9', EARLY, 5, 'Aquila and Priscilla made tents for a living.', 'Acts 18:2, 3'),
    myth('ks-early-10', EARLY, 5, 'Paul was shipwrecked on the island of Crete.', 'He was shipwrecked on Malta.', 'Acts 27:41; 28:1'),
  ],
};
