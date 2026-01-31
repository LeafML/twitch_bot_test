// Queue system
class QueueSystem {
  constructor() {
    this.queue = [];
    this.isActive = false;
  }

  join(username) {
    if (this.queue.includes(username)) {
      return { success: false, message: `${username} is already in the queue!` };
    }
    this.queue.push(username);
    return { success: true, message: `${username} joined the queue! Position: #${this.queue.length}` };
  }

  leave(username) {
    const index = this.queue.indexOf(username);
    if (index === -1) {
      return { success: false, message: `${username} is not in the queue!` };
    }
    this.queue.splice(index, 1);
    return { success: true, message: `${username} left the queue.` };
  }

  view() {
    if (this.queue.length === 0) {
      return 'Queue is empty!';
    }
    return `Queue: ${this.queue.map((user, i) => `#${i + 1} ${user}`).join(' | ')}`;
  }

  check(username) {
    const index = this.queue.indexOf(username);
    if (index === -1) {
      return `${username} is not in the queue.`;
    }
    return `${username} is in queue at position #${index + 1} (${index} users ahead)`;
  }

  next(count) {
    if (this.queue.length === 0) {
      return { success: false, message: 'Queue is empty!', users: [] };
    }
    const users = this.queue.splice(0, Math.min(count, this.queue.length));
    return { success: true, message: '', users };
  }

  add(username) {
    if (this.queue.includes(username)) {
      return { success: false, message: `${username} is already in the queue!` };
    }
    this.queue.push(username);
    return { success: true, message: `${username} was added to the queue! Position: #${this.queue.length}` };
  }

  remove(username) {
    const index = this.queue.indexOf(username);
    if (index === -1) {
      return { success: false, message: `${username} is not in the queue!` };
    }
    this.queue.splice(index, 1);
    return { success: true, message: `${username} was removed from the queue.` };
  }

  clear() {
    const count = this.queue.length;
    this.queue = [];
    return `Queue cleared! (${count} users removed)`;
  }

  toggle(activate) {
    this.isActive = activate;
    return activate ? 'Queue activated! ✓' : 'Queue deactivated! ✗';
  }
}

const queueSystem = new QueueSystem();

// Command handler
function handleCommand(channel, userstate, messageText, client) {
  const username = userstate['display-name'];
  const isModOrStreamer = userstate.mod || userstate['room-id'] === userstate['user-id'];
  const args = messageText.split(' ');
  const command = args[0].toLowerCase();

  // ===== QUEUE COMMANDS =====
  
  // User commands (all users)
  if (queueSystem.isActive) {
    if (command === '!join') {
      const result = queueSystem.join(username);
      client.say(channel, result.message);
      return true;
    }

    if (command === '!leave') {
      const result = queueSystem.leave(username);
      client.say(channel, result.message);
      return true;
    }

    if (command === '!view') {
      client.say(channel, queueSystem.view());
      return true;
    }

    if (command === '!check') {
      client.say(channel, queueSystem.check(username));
      return true;
    }
  }
  // Mod/Owner commands - start/close always allowed; other commands require active queue
  if (isModOrStreamer) {
    // Allow starting/closing the queue regardless of current state
    if (command === '!startqueue') {
      const result = queueSystem.toggle(true);
      client.say(channel, result);
      return true;
    }

    if (command === '!closequeue') {
      const result = queueSystem.toggle(false);
      client.say(channel, result);
      return true;
    }

    // For other mod commands, ensure the queue is active
    if (!queueSystem.isActive) {
      if (['!next', '!add', '!remove', '!clearqueue'].includes(command)) {
        client.say(channel, 'Queue is not active. Use !startqueue to activate.');
        return true;
      }
    }

    if (command === '!next' && args.length > 1) {
      const count = parseInt(args[1]);
      if (isNaN(count) || count < 1) {
        client.say(channel, 'Usage: !next [number]');
        return true;
      }
      const result = queueSystem.next(count);
      if (result.users.length > 0) {
        client.say(channel, `Next up: ${result.users.map(u => `@${u}`).join(', ')} 🎮`);
      } else {
        client.say(channel, result.message);
      }
      return true;
    }

    if (command === '!add' && args.length > 1) {
      const targetUser = args[1];
      const result = queueSystem.add(targetUser);
      client.say(channel, result.message);
      return true;
    }

    if (command === '!remove' && args.length > 1) {
      const targetUser = args[1];
      const result = queueSystem.remove(targetUser);
      client.say(channel, result.message);
      return true;
    }

    if (command === '!clearqueue') {
      const result = queueSystem.clear();
      client.say(channel, result);
      return true;
    }
  }

  // ===== GENERAL COMMANDS =====

  // Example command: !hello
  if (command === '!hello') {
    client.say(channel, `Hello @${username}! 👋`);
    return true;
  }

  // Example command: !ping
  if (command === '!ping') {
    client.say(channel, `Pong! @${username}`);
    return true;
  }

  // Example command: !time (shows bot uptime)
  if (command === '!time') {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    client.say(channel, `Bot has been running for ${hours}h ${minutes}m ${seconds}s`);
    return true;
  }

  // Example MOD command: !clear (requires mod status)
  if (command === '!clear' && isModOrStreamer) {
    client.say(channel, 'Chat cleared! 🧹');
    return true;
  }

  // Add more commands above
  return false;
}

module.exports = {
  handleCommand,
  queueSystem,
  QueueSystem
};
