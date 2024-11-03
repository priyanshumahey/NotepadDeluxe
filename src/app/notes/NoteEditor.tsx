import { useState } from 'react';
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
      const { initializeDatabase, updateNote } = await import('@/lib/tauriDatabase');
      const db = await initializeDatabase();
      await updateNote(db, note.id, title, JSON.stringify(value));
      onSave();
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setIsSaving(false);
    }
  };

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

      <div className="rounded-lg border bg-white p-4">
        <PlateEditor initialValue={value} setValue={setValue} />
      </div>
    </div>
  );
};

export default NoteEditor;