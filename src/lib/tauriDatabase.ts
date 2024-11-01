import Database from '@tauri-apps/plugin-sql';

// Initialize the database and ensure the table exists
async function initializeDatabase() {
  const db = await Database.load('sqlite:notes.db'); // Database file for notes
  // Log location of database file
  console.log('Database file location:', db.path);

  // Create the `notes` table if it doesn't already exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      time_created TEXT NOT NULL,
      time_updated TEXT
    )
  `);

  return db;
}

// Insert a new note into the database
async function addNote(db, name, content) {
  const timeCreated = new Date().toISOString();
  const result = await db.execute(
    `INSERT INTO notes (name, content, time_created, time_updated) VALUES ($1, $2, $3, $4)`,
    [name, JSON.stringify(content), timeCreated, timeCreated]
  );
  return result;
}

// Update an existing note
async function updateNote(db, id, name, content) {
  const timeUpdated = new Date().toISOString();
  const result = await db.execute(
    `UPDATE notes SET name = $1, content = $2, time_updated = $3 WHERE id = $4`,
    [name, JSON.stringify(content), timeUpdated, id]
  );
  return result;
}

// Fetch all notes
async function getNotes(db) {
  const result = await db.select('SELECT * FROM notes');
  return result.map((note) => ({
    ...note,
    content: JSON.parse(note.content), // Parse JSON content
  }));
}

// Delete a note by id
async function deleteNote(
  db: { execute: (arg0: string, arg1: any[]) => any },
  id: any
) {
  const result = await db.execute('DELETE FROM notes WHERE id = $1', [id]);
  return result;
}

async function deleteAllNotes(db: any): Promise<void> {
  await db.execute('DELETE FROM notes');
  console.log('All notes deleted from database');
}

// Initialize and use the database
async function main() {
  const db = await initializeDatabase();
  const notes = await getNotes(db);
  console.log('Notes in database:', notes);
}

main().catch(console.error);

export {
  initializeDatabase,
  addNote,
  getNotes,
  deleteNote,
  updateNote,
  deleteAllNotes,
};
