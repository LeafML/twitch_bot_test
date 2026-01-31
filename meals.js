const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'meals.json');

let meals = [];

// Load meals.json (fallback to default array if missing)
function loadMeals() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      meals = JSON.parse(raw);
      if (!Array.isArray(meals)) meals = [];
    } else {
      meals = [];
      saveMeals();
    }
  } catch (e) {
    console.error('Failed to load meals:', e);
    meals = [];
  }
}

function saveMeals() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(meals, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save meals:', e);
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function pickRandomMeals(count) {
  const pool = shuffle([...meals]);
  return pool.slice(0, Math.min(count, pool.length));
}

// Command handler
function handleMealCommand(channel, userstate, messageText, client) {
  const username = userstate['display-name'] || userstate.username || 'friend';
  const isModOrStreamer = userstate.mod || userstate['user-id'] === userstate['room-id'];
  const args = messageText.trim().split(/\s+/);
  const command = args[0].toLowerCase();

  // User command: !meal [n]
  if (command === '!meal') {
    // Default to 1 option, allow user to request up to 5
    let count = 1;
    if (args[1]) {
      const n = parseInt(args[1], 10);
      if (!isNaN(n)) count = Math.max(1, Math.min(5, n));
    }

    if (meals.length === 0) {
      client.say(channel, `@${username}, meal list is empty.`);
      return true;
    }

    const picks = pickRandomMeals(count);
    if (picks.length === 1) {
      client.say(channel, `@${username}, how about: ${picks[0]}? 🍽️`);
    } else {
      client.say(channel, `@${username}, here are ${picks.length} meal options: ${picks.map((p, i) => `${i + 1}. ${p}`).join(' | ')} 🍽️`);
    }
    return true;
  }

  // Mod commands: !addmeal <name>, !removemeal <name>, !listmeals [n]
  if (!isModOrStreamer) return false;

  if (command === '!addmeal') {
    const name = messageText.slice(command.length).trim();
    if (!name) {
      client.say(channel, 'Usage: !addmeal <meal name>');
      return true;
    }
    const exists = meals.some(m => m.toLowerCase() === name.toLowerCase());
    if (exists) {
      client.say(channel, `${name} is already in the meal list.`);
      return true;
    }
    meals.push(name);
    saveMeals();
    client.say(channel, `${name} added to meals list. Total: ${meals.length}`);
    return true;
  }

  if (command === '!removemeal') {
    const name = messageText.slice(command.length).trim();
    if (!name) {
      client.say(channel, 'Usage: !removemeal <meal name>');
      return true;
    }
    const idx = meals.findIndex(m => m.toLowerCase() === name.toLowerCase());
    if (idx === -1) {
      client.say(channel, `${name} not found in meal list.`);
      return true;
    }
    meals.splice(idx, 1);
    saveMeals();
    client.say(channel, `${name} removed. Total: ${meals.length}`);
    return true;
  }

  if (command === '!listmeals') {
    const n = args[1] ? Math.max(1, Math.min(20, parseInt(args[1], 10) || 10)) : 10;
    client.say(channel, `Meals (${meals.length} total): ${meals.slice(0, n).join(' | ')}${meals.length > n ? ' | ...' : ''}`);
    return true;
  }

  return false;
}

// Initialize
loadMeals();

module.exports = { handleMealCommand, meals, loadMeals, saveMeals };
