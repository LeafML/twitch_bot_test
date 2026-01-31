const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'fortune_last.json');
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
const lastFortune = new Map();

// Load persisted usage data (if any)
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const obj = JSON.parse(raw);
    Object.entries(obj).forEach(([k, v]) => lastFortune.set(k, v));
  }
} catch (e) {
  console.error('Failed to load fortune usage data:', e);
}

function saveLastFortune() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(Object.fromEntries(lastFortune)), 'utf8');
  } catch (e) {
    console.error('Failed to save fortune usage data:', e);
  }
}

async function fortuneCommands(channel, userstate, messageText, client) {
  const username = userstate['display-name'];
  const usernameKey = username.toLowerCase();
  const isModOrStreamer = userstate.mod || userstate['room-id'] === userstate['user-id'];
  const args = messageText.split(' ');
  const command = args[0].toLowerCase();

  if (command === '!fortune') {
    // Mods/streamer bypass the cooldown
    if (!isModOrStreamer) {
      const last = lastFortune.get(usernameKey) || 0;
      const now = Date.now();
      if (now - last < COOLDOWN_MS) {
        const remaining = COOLDOWN_MS - (now - last);
        const minutes = Math.floor(remaining / (1000 * 60));
        const seconds = Math.ceil((remaining % (1000 * 60)) / 1000);
        client.say(channel, `@${username}, you can use !fortune again in ${minutes}m ${seconds}s.`);
        return true;
      }
    }

    const fortune = await getRandomFortune();
    client.say(channel, `@${username}, 今日運勢: ${fortune}`);

    // Record usage and persist
    lastFortune.set(usernameKey, Date.now());
    saveLastFortune();

    return true;
  }
  return false;
}

async function getRandomFortune() {
  const fortuneIndex = Math.floor(Math.random() * 10);
  var fortune = "";

  if (fortuneIndex === 0) {
    fortune = "大凶";
  }
  else if (fortuneIndex >= 1 && fortuneIndex <= 3) {
    fortune = "凶";
  }
  else if (fortuneIndex >= 4 && fortuneIndex <= 6) {
    fortune = "小吉";
  }
  else if (fortuneIndex >= 7 && fortuneIndex <= 8) {
    fortune = "吉";
  }
  else {
    fortune = "大吉";
  }

  return fortune;
}

module.exports = { fortuneCommands };