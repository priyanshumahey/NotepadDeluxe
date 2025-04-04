import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PlateEditor from '@/components/plate-editor';

interface Note {
  id: number;
  name: string;
  content: string;
}

interface NoteEditorProps {
  note: Note;
  onSave: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave }) => {
  const [title, setTitle] = useState(note.name);
  const [value, setValue] = useState(JSON.parse(note.content));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { initializeDatabase, updateNote, addEvent } = await import(
        '@/lib/tauriDatabase'
      );
      const db = await initializeDatabase();
      await updateNote(db, note.id, title, JSON.stringify(value));

      // Create a calendar event for the note update
      const now = new Date();
      const endTime = new Date(now.getTime() + 15 * 60000); // 15 minutes duration
      await addEvent(
        db,
        `Updated Note: ${title}`,
        'Note update event',
        now.toISOString(),
        endTime.toISOString(),
        note.id
      );

      onSave();
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        setIsSaving(true);

        try {
          const { initializeDatabase, updateNote, addEvent } = await import(
            '@/lib/tauriDatabase'
          );
          const db = await initializeDatabase();
          await updateNote(db, note.id, title, JSON.stringify(value));

          // Create a calendar event for the note update
          const now = new Date();
          const endTime = new Date(now.getTime() + 15 * 60000); // 15 minutes duration
          await addEvent(
            db,
            `Updated Note: ${title}`,
            'Note update event',
            now.toISOString(),
            endTime.toISOString(),
            note.id
          );
        } catch (error) {
          console.error('Failed to update note:', error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [title, value, note.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold"
          placeholder="Note title"
        />
        <Button
          onClick={handleSave}
          className="inline-flex items-center gap-2"
          disabled={isSaving || !title.trim()}
        >
          <Save className="size-4" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </Button>
      </div>

      <div className="rounded-lg bg-white">
        <PlateEditor initialValue={value} setValue={setValue} />
      </div>
    </div>
  );
};

export default NoteEditor;
