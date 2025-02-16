'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import NoteEditor from './NoteEditor';

interface Note {
  id: number;
  name: string;
  content: string;
}

function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window === 'undefined') return;

      try {
        const { initializeDatabase, getNotes } = await import(
          '@/lib/tauriDatabase'
        );
        const db = await initializeDatabase();
        const allNotes = await getNotes(db);
        setNotes(allNotes);

        const noteId = searchParams.get('noteId');
        if (noteId) {
          const noteToLoad = allNotes.find(
            (note) => note.id === Number(noteId)
          );
          if (noteToLoad) {
            setSelectedNote(noteToLoad);
            setIsEditing(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
    router.replace(`/notes?noteId=${note.id}`);
  };

  const handleBackToNotes = () => {
    setSelectedNote(null);
    setIsEditing(false);
    router.replace('/notes');
  };

  const handleDeleteAllNotes = async () => {
    if (typeof window === 'undefined') return;

    try {
      const { initializeDatabase, deleteAllNotes } = await import(
        '@/lib/tauriDatabase'
      );
      const db = await initializeDatabase();
      await deleteAllNotes(db);
      setNotes([]);
      setSelectedNote(null);
      setIsEditing(false);
      router.replace('/notes');
    } catch (error) {
      console.error('Failed to delete notes:', error);
    }
  };

  const handleCreateNewNote = async () => {
    if (typeof window === 'undefined') return;

    try {
      const { initializeDatabase, addNote } = await import(
        '@/lib/tauriDatabase'
      );
      const db = await initializeDatabase();
      const newNote = await addNote(db, 'Untitled Note', '[]');
      setNotes([...notes, newNote]);
      handleNoteClick(newNote);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleDeleteNote = async (noteId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent note selection when clicking delete
    if (typeof window === 'undefined') return;

    try {
      const { initializeDatabase, deleteNote } = await import(
        '@/lib/tauriDatabase'
      );
      const db = await initializeDatabase();
      await deleteNote(db, noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 border-b bg-white p-4 shadow-sm">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              <span>Home</span>
            </Button>
            {isEditing && (
              <Button
                variant="ghost"
                onClick={handleBackToNotes}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="size-4" />
                <span>All Notes</span>
              </Button>
            )}
          </div>
          {!isEditing && (
            <Button
              onClick={handleCreateNewNote}
              className="inline-flex items-center gap-2"
            >
              <Plus className="size-4" />
              <span>New Note</span>
            </Button>
          )}
        </div>
      </nav>

      <main className="mx-auto p-4">
        {isEditing && selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onSave={() => {
              handleBackToNotes();
              // Refresh notes list after save
              const fetchNotes = async () => {
                const { initializeDatabase, getNotes } = await import(
                  '@/lib/tauriDatabase'
                );
                const db = await initializeDatabase();
                const allNotes = await getNotes(db);
                setNotes(allNotes);
              };
              fetchNotes();
            }}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">All Notes</h1>
              {notes.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="inline-flex items-center gap-2"
                    >
                      <Trash2 className="size-4" />
                      <span>Delete All</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete all notes?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All your notes will be
                        permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllNotes}>
                        Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {notes.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-4">
                  <CardDescription>No notes yet</CardDescription>
                  <Button
                    onClick={handleCreateNewNote}
                    className="inline-flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    <span>Create your first note</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {notes.map((note) => (
                  <Card
                    key={note.id}
                    className="group relative transition-all hover:shadow-md"
                    role="button"
                    onClick={() => handleNoteClick(note)}
                  >
                    <CardHeader>
                      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete note?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This note will be
                                permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={(e) => e.stopPropagation()}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => handleDeleteNote(note.id, e)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <CardTitle className="line-clamp-2">
                        {note.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {JSON.parse(note.content)
                          .map((block: any) => block.children?.[0]?.text || '')
                          .join(' ')
                          .slice(0, 100)}
                        ...
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotesPage />
    </Suspense>
  );
}
