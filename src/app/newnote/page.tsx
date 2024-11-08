'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PlateEditor from '@/components/plate-editor';

const plateValue = [
  {
    id: '1',
    children: [
      {
        text: 'Your notes',
      },
    ],
    type: 'h1',
  },
  {
    id: '2',
    type: ParagraphPlugin.key,
    children: [{ text: 'Start writing your note here...' }],
  },
];

export default function NewNotePage() {
  const router = useRouter();
  const [value, setValue] = useState(plateValue);
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation Header */}
      <nav className="sticky top-0 z-10 border-b bg-white p-4 shadow-sm">
        <div className="container mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </Button>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="inline-flex items-center gap-2"
          >
            <Save className="size-4" />
            <span>{isSaving ? 'Saving...' : 'Save Note'}</span>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl p-4">
        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="text-2xl font-bold"
          />

          <Card>
            <CardContent className="p-4">
              <PlateEditor initialValue={value} setValue={setValue} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
