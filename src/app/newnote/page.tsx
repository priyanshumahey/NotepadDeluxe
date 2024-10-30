'use client';

import { useState } from 'react';
import { ParagraphPlugin } from '@udecode/plate-common/react';

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
  const [value, setValue] = useState(plateValue);

  return <PlateEditor initialValue={value} setValue={setValue} />;
}
