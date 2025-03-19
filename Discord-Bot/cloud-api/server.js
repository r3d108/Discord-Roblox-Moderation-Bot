const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(express.json());

// sqlite database connection
const db = new sqlite3.Database('./bans.db', (err) => {
  if (err) console.error('Database error:', err);
  else {
    db.run(`CREATE TABLE IF NOT EXISTS bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roblox_id TEXT,
      username TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Endpoint to add a ban which is then called with the Discord bot (all yap)
app.post('/api/ban', (req, res) => {
  const { roblox_id, username } = req.body;
  if (!roblox_id || !username) return res.status(400).send({ error: 'Missing parameters.' });
  
  db.run("INSERT INTO bans (roblox_id, username) VALUES (?, ?)", [roblox_id, username], function(err) {
    if (err) return res.status(500).send({ error: 'Database error.' });
    res.send({ success: true });
  });
});

// Let's roblox retrieve ban list
app.get('/api/bans', (req, res) => {
  db.all("SELECT * FROM bans", [], (err, rows) => {
    if (err) return res.status(500).send({ error: 'Database error.' });
    res.send({ bans: rows });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cloud API server is running on port ${PORT}`);
});
