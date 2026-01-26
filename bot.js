

require('dotenv').config();
const tmi = require('tmi.js');
const { handleCommand, queueSystem } = require('./commands');

// Validate required environment variables
const requiredEnvs = ['TWITCH_USERNAME', 'TWITCH_OAUTH_TOKEN', 'TWITCH_CHANNELS'];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

if (missingEnvs.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingEnvs.forEach(env => console.error(`   - ${env}`));
  console.error('\nPlease create a .env file with the required values.');
  console.error('Use .env.example as a template.');
  process.exit(1);
}

// Create a client with our configuration
const client = new tmi.client({
  options: { debug: process.env.DEBUG === 'true' },
  connection: {
    reconnect: true,
    secure: true
  },
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: process.env.TWITCH_CHANNELS.split(',').map(ch => ch.trim())
});

// Register our event handlers
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);
client.on('message', onMessageHandler);
client.on('cheer', onCheerHandler);
client.on('subscription', onSubscriptionHandler);

// Connect to Twitch
client.connect().then(() => {
  console.log('✓ Bot connected to Twitch chat!');
  console.log(`✓ Joined channels: ${process.env.TWITCH_CHANNELS}`);
}).catch(err => {
  console.error('Failed to connect:', err);
  process.exit(1);
});

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`[${new Date().toLocaleTimeString()}] Connected to ${addr}:${port}`);
}

// Called every time the bot disconnects from Twitch chat
function onDisconnectedHandler(reason) {
  console.log(`[${new Date().toLocaleTimeString()}] Disconnected: ${reason}`);
}

// Called every time a message comes in
function onMessageHandler(channel, userstate, message, self) {
  // Ignore echoed messages
  if (self) return;

  const messageText = message.trim();
  const username = userstate['display-name'];

  console.log(`[${channel}] ${username}: ${messageText}`);

  // Handle all commands from commands.js
  handleCommand(channel, userstate, messageText, client);
}

// Called every time someone cheers
function onCheerHandler(channel, userstate, message) {
  console.log(`[CHEER] ${userstate['display-name']}: ${message} (${userstate.bits} bits)`);
  client.say(channel, `Thanks for the ${userstate.bits} bits, @${userstate['display-name']}! 💜`);
}

// Called every time someone subscribes to the channel
function onSubscriptionHandler(channel, username, method, message, userstate) {
  console.log(`[SUB] ${username} subscribed with ${method.Prime ? 'Prime' : method.displayName}`);
  client.say(channel, `Thanks for subscribing, @${username}! 💜`);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down bot...');
  client.disconnect();
  process.exit(0);
});
