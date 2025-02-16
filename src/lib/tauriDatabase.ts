import Database from '@tauri-apps/plugin-sql';

// Initialize the database and ensure the table exists
async function initializeDatabase() {
  try {
    const db = await Database.load('sqlite:notepad.db'); // Database file for notes
    console.log('Database file location:', db.path);

    // Create the `notes` table if it doesn't already exist with type field
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        time_created TEXT NOT NULL,
        time_updated TEXT,
        type TEXT NOT NULL DEFAULT 'note'
      )
    `);

    // Create the `events` table if it doesn't already exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        note_id INTEGER,
        FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
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
      `INSERT INTO notes (name, content, time_created, time_updated, type) VALUES ($1, $2, $3, $4, $5)`,
      [name, JSON.stringify(content), timeCreated, timeCreated, 'note']
    );

    return {
      id: result.lastInsertId,
      name,
      content,
      time_created: timeCreated,
      time_updated: timeCreated,
      type: 'note',
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
      content: JSON.parse(note.content),
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

// Add a new event to the database
async function addEvent(
  db,
  title: string,
  description: string | null,
  startTime: string,
  endTime: string,
  noteId: number | null = null
) {
  try {
    const result = await db.execute(
      `INSERT INTO events (title, description, start_time, end_time, note_id) VALUES ($1, $2, $3, $4, $5)`,
      [title, description, startTime, endTime, noteId]
    );

    return {
      id: result.lastInsertId,
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      note_id: noteId,
    };
  } catch (error) {
    console.error('Failed to add event:', error);
    throw error;
  }
}

// Update an existing event
async function updateEvent(
  db,
  id: number,
  title: string,
  description: string | null,
  startTime: string,
  endTime: string,
  noteId: number | null = null
) {
  try {
    const result = await db.execute(
      `UPDATE events SET title = $1, description = $2, start_time = $3, end_time = $4, note_id = $5 WHERE id = $6`,
      [title, description, startTime, endTime, noteId, id]
    );
    return result;
  } catch (error) {
    console.error('Failed to update event:', error);
    throw error;
  }
}

// Get all events
async function getEvents(db) {
  try {
    const result = await db.select(`
      SELECT e.*, n.name as note_name, n.content as note_content 
      FROM events e 
      LEFT JOIN notes n ON e.note_id = n.id
    `);
    return result.map((event) => ({
      ...event,
      note_content: event.note_content ? JSON.parse(event.note_content) : null,
    }));
  } catch (error) {
    console.error('Failed to retrieve events:', error);
    throw error;
  }
}

// Delete an event by id
async function deleteEvent(db, id: number) {
  try {
    const result = await db.execute('DELETE FROM events WHERE id = $1', [id]);
    return result;
  } catch (error) {
    console.error('Failed to delete event:', error);
    throw error;
  }
}

// Get events for heatmap (returns count of events per day)
async function getEventHeatmap(db) {
  try {
    const result = await db.select(`
      SELECT date(start_time) as date, COUNT(*) as count
      FROM events
      WHERE note_id IS NULL
      GROUP BY date(start_time)
    `);
    return result;
  } catch (error) {
    console.error('Failed to retrieve event heatmap data:', error);
    throw error;
  }
}

// Get note activity heatmap data
async function getNoteHeatmap(db) {
  try {
    const result = await db.select(`
      SELECT date(start_time) as date, COUNT(*) as count
      FROM events
      WHERE note_id IS NOT NULL
      GROUP BY date(start_time)
    `);
    return result;
  } catch (error) {
    console.error('Failed to retrieve note heatmap data:', error);
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
  addEvent,
  updateEvent,
  getEvents,
  deleteEvent,
  getEventHeatmap,
  getNoteHeatmap,
};
