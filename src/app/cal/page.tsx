'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { EventCalendar } from '@/components/calendar';
import type { CalendarEvent } from '@/components/calendar/types';

interface DatabaseEvent {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  note_id?: number;
  note_name?: string;
  note_content?: any;
}

export default function MyCalendar() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Fetch events from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { initializeDatabase, getEvents } = await import(
          '@/lib/tauriDatabase'
        );
        const db = await initializeDatabase();

        // Fetch events
        const dbEvents = await getEvents(db);
        const calendarEvents = dbEvents.map((event: DatabaseEvent) => ({
          id: event.id.toString(),
          title: event.title,
          description: event.description || '',
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          color: event.note_id ? 'sky' : 'emerald', // Use color to indicate note-related events
          location: event.note_name || '',
          noteId: event.note_id,
          noteContent: event.note_content,
        }));
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const handleEventAdd = useCallback(async (event: CalendarEvent) => {
    try {
      const { initializeDatabase, addEvent } = await import(
        '@/lib/tauriDatabase'
      );
      const db = await initializeDatabase();
      const result = await addEvent(
        db,
        event.title,
        event.description || null,
        event.start.toISOString(),
        event.end.toISOString(),
        null // No note associated with this event by default
      );

      const createdEvent: CalendarEvent = {
        id: result.id.toString(),
        title: result.title,
        description: result.description || '',
        start: new Date(result.start_time),
        end: new Date(result.end_time),
        color: 'emerald',
        allDay: event.allDay || false,
        location: event.location || '',
      };

      setEvents((prev) => [...prev, createdEvent]);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  }, []);

  const handleEventUpdate = useCallback(async (updatedEvent: CalendarEvent) => {
    try {
      const { initializeDatabase, updateEvent } = await import(
        '@/lib/tauriDatabase'
      );
      const db = await initializeDatabase();
      await updateEvent(
        db,
        parseInt(updatedEvent.id),
        updatedEvent.title,
        updatedEvent.description || null,
        updatedEvent.start.toISOString(),
        updatedEvent.end.toISOString(),
        (updatedEvent as any).noteId || null
      );

      setEvents((prev) =>
        prev.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  }, []);

  const handleEventDelete = useCallback(async (eventId: string) => {
    try {
      const { initializeDatabase, deleteEvent } = await import(
        '@/lib/tauriDatabase'
      );
      const db = await initializeDatabase();
      await deleteEvent(db, parseInt(eventId));

      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }, []);

  // Custom event selection handler for note navigation
  const handleEventSelect = useCallback(
    (event: CalendarEvent) => {
      // If this event is associated with a note, navigate to that note
      if ((event as any).noteId) {
        router.push(`/notes?noteId=${(event as any).noteId}`);
        return true; // Indicate that we've handled this event
      }
      return false; // Let the default dialog handling take place
    },
    [router]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4">
      <EventCalendar
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        onEventSelect={handleEventSelect}
        className="flex-1 overflow-hidden"
      />
    </div>
  );
}
