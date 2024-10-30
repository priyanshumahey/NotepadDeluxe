'use client';

import Link from 'next/link';
import { BookOpen, PenSquare } from 'lucide-react';

export default function IndexPage() {
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
    </section>
  );
}
