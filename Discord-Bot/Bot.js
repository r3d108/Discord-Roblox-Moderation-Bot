const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Set up SQLite database
const db = new sqlite3.Database('./bans.db', (err) => {
  if (err) console.error('Database error:', err);
  else {
    console.log('Connected to SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roblox_id TEXT,
      username TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Command prefix and role requirement
const prefix = '!';
const allowedRole = 'Moderator';

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ban') {
    // Verify user permissions
    if (!message.member.roles.cache.some(role => role.name === allowedRole)) {
      return message.reply('You do not have permission to use this command.');
    }
    if (args.length < 2) {
      return message.reply('Usage: !ban <RobloxID> <username>');
    }
    
    const [robloxID, username] = args;
    
    // Store ban in the database
    db.run("INSERT INTO bans (roblox_id, username) VALUES (?, ?)", [robloxID, username], function(err) {
      if (err) {
        console.error(err);
        return message.reply('Failed to store ban in the database.');
      }
      message.reply(`Player ${username} (Roblox ID: ${robloxID}) has been banned.`);
      
      // Send HTTP POST to cloud endpoint
      axios.post('https://your-cloud-endpoint.com/api/ban', {
        roblox_id: robloxID,
        username: username
      })
      .then(() => console.log('Ban notification sent successfully.'))
      .catch(error => console.error('Failed to send webhook:', error));
    });
  }
});

client.login('YOUR_DISCORD_BOT_TOKEN');
