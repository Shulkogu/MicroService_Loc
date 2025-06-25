const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./positions.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS positions (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 latitude REAL,
                                                 longitude REAL,
                                                 timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;
