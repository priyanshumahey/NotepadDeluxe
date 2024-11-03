'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import NoteEditor from './NoteEditor';

interface Note {
  id: number;
  name: string;
  content: string;
}

function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window === 'undefined') return;

      try {
        const { initializeDatabase, getNotes } = await import('@/lib/tauriDatabase');
        const db = await initializeDatabase();
        const allNotes = await getNotes(db);
        setNotes(allNotes);

        // Check if an ID is already in the URL and load the note
        const noteId = searchParams.get('noteId');
        if (noteId) {
          const noteToLoad = allNotes.find((note) => note.id === Number(noteId));
          if (noteToLoad) setSelectedNote(noteToLoad);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    router.replace(`/notes?noteId=${note.id}`);
  };

  const handleDeleteAllNotes = async () => {
    if (typeof window === 'undefined') return;

    try {
      const { initializeDatabase, deleteAllNotes } = await import('@/lib/tauriDatabase');
      const db = await initializeDatabase();
      await deleteAllNotes(db);
      setNotes([]);
      setSelectedNote(null);
      router.replace('/notes');
    } catch (error) {
      console.error('Failed to delete notes:', error);
    }
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8">
        <Button onClick={() => router.push('/')} className="inline-flex items-center gap-2">
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </Button>
      </div>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">All Notes</h1>

      {selectedNote ? (
        <NoteEditor note={selectedNote} />
      ) : (
        <div className="space-y-6">
          {notes.length === 0 ? (
            <p className="text-center text-gray-600">No notes yet. Create your first note!</p>
          ) : (
            <>
              <ul className="space-y-4">
                {notes.map((note) => (
                  <li key={note.id} className="rounded-lg bg-gray-100 p-4 shadow">
                    <button
                      onClick={() => handleNoteClick(note)}
                      className="block w-full text-left text-lg font-semibold text-blue-600 hover:underline"
                    >
                      {note.name}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleDeleteAllNotes}
                className="mt-6 rounded-lg bg-red-600 px-6 py-3 text-white shadow-lg transition-colors duration-200 hover:bg-red-700"
              >
                Delete All Notes
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotesPage />
    </Suspense>
  );
}
