'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PlateEditor from '@/components/plate-editor';

const plateValue = [
  {
    id: '1',
    type: 'h1',
    children: [{ text: 'New Note' }],
  },
  {
    id: '2',
    type: ParagraphPlugin.key,
    children: [{ text: 'Use the rich text editor to write your note.' }],
  },
];

export default function NewNotePage() {
  const router = useRouter();
  const [value, setValue] = useState(plateValue);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const { initializeDatabase, addNote } = await import(
        '@/lib/tauriDatabase'
      );
      const db = await initializeDatabase();

      await addNote(db, title, JSON.stringify(value));

      router.push('/notes');
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Note</h1>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Save className="size-4" />
          Save Note
        </Button>
      </div>

      <PlateEditor initialValue={value} setValue={setValue} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Note Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your note"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
