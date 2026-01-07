import { BantabroBot } from './server/bantabro-bot';

// Test the bot parsing logic
const bot = new BantabroBot();

const testCases = [
  {
    text: '@bantabro challenge @alice YES 100 "Will it rain tomorrow?" 24h',
    author: '@bob',
    expected: {
      type: 'p2p',
      challenger: '@bob',
      opponent: '@alice',
      side: 'YES',
      amount: 100,
      topic: 'Will it rain tomorrow?',
      duration: 24,
    },
  },
  {
    text: '@bantabro challenge NO 50 "BTC to 100k" 12h +bonus 25',
    author: '@trader',
    expected: {
      type: 'open',
      challenger: '@trader',
      side: 'NO',
      amount: 50,
      topic: 'BTC to 100k',
      duration: 12,
      bonus: 25,
    },
  },
  {
    text: '@bantabro squad challenge @team YES 200 "We will win the tournament"',
    author: '@captain',
    expected: {
      type: 'squad',
      challenger: '@captain',
      opponent: '@team',
      side: 'YES',
      amount: 200,
      topic: 'We will win the tournament',
      duration: 24,
    },
  },
];

console.log('Testing Bantabro Bot Parsing Logic...\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.text}`);
  const result = bot.parseChallengeCommand(testCase.text, testCase.author);

  if (result) {
    console.log('✅ Parsed successfully:');
    console.log(JSON.stringify(result, null, 2));

    const card = bot.generateChallengeCard(result);
    console.log('🎴 Generated Card:');
    console.log(JSON.stringify(card, null, 2));
  } else {
    console.log('❌ Failed to parse');
  }

  console.log('---\n');
});

console.log('Bot parsing tests completed!');