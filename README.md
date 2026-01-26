# Twitch Chat Bot

A simple yet powerful Twitch chat bot built with [tmi.js](https://github.com/tmijs/tmi.js).

## Setup Instructions

### 1. Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Twitch account

### 2. Get OAuth Token
1. Go to [Twitch Console](https://dev.twitch.tv/console/apps)
2. Create a new application
3. Get your OAuth token from [Twitch Chat OAuth Token Generator](https://twitchtokengenerator.com/)
   - Select "Chat Bot" scope
   - Authorize with your Twitch account

### 3. Installation
```bash
npm install
```

### 4. Configuration
Create a `.env` file in the root directory:

```
TWITCH_USERNAME=your_bot_username
TWITCH_OAUTH_TOKEN=oauth:your_token_here
TWITCH_CHANNELS=your_channel_name
```

Replace:
- `your_bot_username` - The username of your bot account
- `your_token_here` - Your OAuth token (without the "oauth:" prefix in the env file)
- `your_channel_name` - The channel you want the bot to join (can be comma-separated for multiple channels)

### 5. Running the Bot
```bash
npm start
```

You should see output like:
```
Bot connected to Twitch chat!
Joined channels: #your_channel_name
```

## Features

The bot comes with example features:
- **Hello command** - Responds to `!hello`
- **Uptime tracking** - Bot logs when it started
- **Customizable commands** - Easy to add new commands

## Adding Commands

Edit `bot.js` and add new command handlers in the `onMessageHandler` function. Example:

```javascript
if (message.toLowerCase() === '!ping') {
  client.say(channel, 'Pong!');
}
```

## Troubleshooting

- **Connection failed**: Check your OAuth token and username
- **No message responses**: Make sure the bot has appropriate permissions in the channel
- **Bot not joining**: Verify the channel name in `.env` file

## Documentation

- [tmi.js Documentation](https://github.com/tmijs/tmi.js/tree/master/docs)
- [Twitch Developer Docs](https://dev.twitch.tv/docs)
