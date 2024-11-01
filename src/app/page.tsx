'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, PenSquare } from 'lucide-react';

export default function IndexPage() {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window !== 'undefined') {
        // Dynamically import Tauri functions on the client side
        const { initializeDatabase, getNotes } = await import(
          '@/lib/tauriDatabase'
        );
        const db = await initializeDatabase();
        const allNotes = await getNotes(db);
        setNotes(allNotes);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="container mx-auto max-w-4xl px-4 py-16">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Welcome to NotePad
        </h1>
        <p className="text-lg text-gray-600">
          Your digital space for capturing thoughts and ideas
        </p>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
        <Link
          href="/newnote"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg transition-colors duration-200 hover:bg-blue-700"
        >
          <BookOpen className="size-5" />
          <span>Create New Note</span>
        </Link>
        <Link
          href="/notes"
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 text-gray-900 transition-colors duration-200 hover:bg-gray-200"
        >
          <PenSquare className="size-5" />
          <span>All Notes</span>
        </Link>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900">Your Notes</h2>
        <ul className="mt-4 space-y-4">
          {notes.map((note, index) => (
            <li key={index} className="rounded-lg border p-4 shadow-sm">
              <h3 className="text-xl font-semibold">{note.title}</h3>
              <p className="mt-2 text-gray-700">{note.content.text}</p>
            </li>
          ))}
        </ul>
      </div>
      {/* Delete all the notes */}
      <button
        onClick={async () => {
          if (typeof window !== 'undefined') {
            const { initializeDatabase, deleteAllNotes } = await import(
              '@/lib/tauriDatabase'
            );
            const db = await initializeDatabase();
            await deleteAllNotes(db);
            setNotes([]);
          }
        }}
        className="mt-6 rounded-lg bg-red-600 px-6 py-3 text-white shadow-lg transition-colors duration-200 hover:bg-red-700"
      >
        Delete All Notes
      </button>
    </section>
  );
}
