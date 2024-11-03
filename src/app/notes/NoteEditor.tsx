import PlateEditor from '@/components/plate-editor';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Note {
  id: number;
  name: string;
  content: string;
}

interface NoteEditorProps {
  note: Note;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note }) => {
  const [title, setTitle] = useState(note.name);
  const [value, setValue] = useState(JSON.parse(note.content));
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { initializeDatabase, updateNote } = await import('@/lib/tauriDatabase');
      const db = await initializeDatabase();

      await updateNote(db, note.id, title, JSON.stringify(value));
      router.replace('/notes');
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold"
        />
        <Button
          onClick={handleSave}
          className="flex items-center gap-2"
          disabled={isSaving || !title.trim()}
        >
          {isSaving ? 'Saving...' : 'Save Note'}
        </Button>
      </div>

      <PlateEditor initialValue={value} setValue={setValue} />
    </div>
  );
};

export default NoteEditor;
