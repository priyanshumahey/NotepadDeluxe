'use client';

import { useEffect, useState } from 'react';
import { initializeDatabase, getNotes } from '@/lib/tauriDatabase';

export default function NewNotePage() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const db = await initializeDatabase();
      const allNotes = await getNotes(db);
      setNotes(allNotes);
    };

    fetchNotes();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">All Notes</h1>
      {notes.length === 0 ? (
        <p>No notes available.</p>
      ) : (
        <ul className="space-y-4">
          {notes.map((note: {
            time_updated: any; id: string; name: string; content: { text: string }; time_created: string 
          }) => (
            <li key={note.id} className="p-4 bg-gray-100 rounded-lg shadow">
              <h2 className="text-xl font-semibold">{note.name}</h2>
              <p className="text-gray-700">{note.content.text}</p>
              <p className="text-sm text-gray-500">
                Created: {new Date(note.time_created).toLocaleString()}
              </p>
              {note.time_updated && (
                <p className="text-sm text-gray-500">
                  Updated: {new Date(note.time_updated).toLocaleString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
