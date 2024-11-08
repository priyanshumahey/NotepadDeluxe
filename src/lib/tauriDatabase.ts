import Database from '@tauri-apps/plugin-sql';

// Initialize the database and ensure the table exists
async function initializeDatabase() {
  try {
    const db = await Database.load('sqlite:notepad.db'); // Database file for notes
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
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Insert a new note into the database
async function addNote(db, name, content) {
  try {
    const timeCreated = new Date().toISOString();
    const result = await db.execute(
      `INSERT INTO notes (name, content, time_created, time_updated) VALUES ($1, $2, $3, $4)`,
      [name, JSON.stringify(content), timeCreated, timeCreated]
    );

    return {
      id: result.lastInsertId, // Retrieve last inserted ID
      name,
      content,
      time_created: timeCreated,
      time_updated: timeCreated,
    };
  } catch (error) {
    console.error('Failed to add note:', error);
    throw error;
  }
}

// Update an existing note
async function updateNote(db, id, name, content) {
  try {
    const timeUpdated = new Date().toISOString();
    const result = await db.execute(
      `UPDATE notes SET name = $1, content = $2, time_updated = $3 WHERE id = $4`,
      [name, JSON.stringify(content), timeUpdated, id]
    );
    return result;
  } catch (error) {
    console.error('Failed to update note:', error);
    throw error;
  }
}

// Fetch all notes and parse JSON content
async function getNotes(db) {
  try {
    const result = await db.select('SELECT * FROM notes');
    return result.map((note) => ({
      ...note,
      content: JSON.parse(note.content), // Parse JSON content back into an object
    }));
  } catch (error) {
    console.error('Failed to retrieve notes:', error);
    throw error;
  }
}

// Delete a note by id
async function deleteNote(db, id) {
  try {
    const result = await db.execute('DELETE FROM notes WHERE id = $1', [id]);
    return result;
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw error;
  }
}

// Delete all notes from the database
async function deleteAllNotes(db) {
  try {
    await db.execute('DELETE FROM notes');
    console.log('All notes deleted from database');
  } catch (error) {
    console.error('Failed to delete all notes:', error);
    throw error;
  }
}

// Initialize and use the database
async function main() {
  try {
    const db = await initializeDatabase();
    const notes = await getNotes(db);
    console.log('Notes in database:', notes);
  } catch (error) {
    console.error('Error in main function:', error);
  }
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
