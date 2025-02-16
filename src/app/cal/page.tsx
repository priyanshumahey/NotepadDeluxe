'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import moment from 'moment';
import { Calendar, Event, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// import { NoteHeatmap } from '@/components/note-heatmap';

import '@/styles/react-big-calendar.css';
import '@/styles/styles.css';

interface CalendarEvent extends Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  noteId?: number;
  noteName?: string;
  noteContent?: any;
}

interface EventFormData {
  title: string;
  description: string;
  start: Date;
  end: Date;
  noteId?: number;
}

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export default function MyCalendar() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [newEvent, setNewEvent] = useState<EventFormData>({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
  });

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
        const calendarEvents = dbEvents.map((event) => ({
          id: event.id.toString(),
          title: event.title,
          description: event.description,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          noteId: event.note_id,
          noteName: event.note_name,
          noteContent: event.note_content,
        }));
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const handleEventDrop = useCallback(
    async ({
      event,
      start,
      end,
    }: {
      event: CalendarEvent;
      start: Date;
      end: Date;
    }) => {
      try {
        const { initializeDatabase, updateEvent } = await import(
          '@/lib/tauriDatabase'
        );
        const db = await initializeDatabase();
        await updateEvent(
          db,
          parseInt(event.id),
          event.title,
          event.description || null,
          start.toISOString(),
          end.toISOString(),
          event.noteId || null
        );

        setEvents((prev) => {
          const idx = prev.findIndex((e) => e.id === event.id);
          const updatedEvent = { ...event, start, end };
          const nextEvents = [...prev];
          nextEvents.splice(idx, 1, updatedEvent);
          return nextEvents;
        });
      } catch (error) {
        console.error('Failed to update event:', error);
      }
    },
    []
  );

  const handleEventResize = useCallback(
    async ({
      event,
      start,
      end,
    }: {
      event: CalendarEvent;
      start: Date;
      end: Date;
    }) => {
      try {
        const { initializeDatabase, updateEvent } = await import(
          '@/lib/tauriDatabase'
        );
        const db = await initializeDatabase();
        await updateEvent(
          db,
          parseInt(event.id),
          event.title,
          event.description || null,
          start.toISOString(),
          end.toISOString(),
          event.noteId || null
        );

        setEvents((prev) => {
          const idx = prev.findIndex((e) => e.id === event.id);
          const updatedEvent = { ...event, start, end };
          const nextEvents = [...prev];
          nextEvents.splice(idx, 1, updatedEvent);
          return nextEvents;
        });
      } catch (error) {
        console.error('Failed to update event:', error);
      }
    },
    []
  );

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setNewEvent({
        title: '',
        description: '',
        start,
        end,
      });
      setIsCreateOpen(true);
    },
    []
  );

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      start: event.start,
      end: event.end,
      noteId: event.noteId,
    });
    setIsViewOpen(true);
  }, []);

  const handleCreateEvent = useCallback(async () => {
    if (newEvent.title.trim()) {
      try {
        const { initializeDatabase, addEvent } = await import(
          '@/lib/tauriDatabase'
        );
        const db = await initializeDatabase();
        const result = await addEvent(
          db,
          newEvent.title,
          newEvent.description || null,
          newEvent.start.toISOString(),
          newEvent.end.toISOString(),
          null
        );

        const createdEvent: CalendarEvent = {
          id: result.id.toString(),
          title: result.title,
          description: result.description || '',
          start: new Date(result.start_time),
          end: new Date(result.end_time),
        };

        setEvents((prev) => [...prev, createdEvent]);
        setIsCreateOpen(false);
        setNewEvent({
          title: '',
          description: '',
          start: new Date(),
          end: new Date(),
        });
      } catch (error) {
        console.error('Failed to create event:', error);
      }
    }
  }, [newEvent]);

  const handleUpdateEvent = useCallback(async () => {
    if (selectedEvent && newEvent.title.trim()) {
      try {
        const { initializeDatabase, updateEvent } = await import(
          '@/lib/tauriDatabase'
        );
        const db = await initializeDatabase();
        await updateEvent(
          db,
          parseInt(selectedEvent.id),
          newEvent.title,
          newEvent.description || null,
          newEvent.start.toISOString(),
          newEvent.end.toISOString(),
          newEvent.noteId || null
        );

        setEvents((prev) =>
          prev.map((event) =>
            event.id === selectedEvent.id
              ? {
                  ...event,
                  title: newEvent.title,
                  description: newEvent.description,
                  start: newEvent.start,
                  end: newEvent.end,
                }
              : event
          )
        );
        setIsViewOpen(false);
        setIsEditing(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Failed to update event:', error);
      }
    }
  }, [selectedEvent, newEvent]);

  const handleDeleteEvent = useCallback(async () => {
    if (selectedEvent) {
      try {
        const { initializeDatabase, deleteEvent } = await import(
          '@/lib/tauriDatabase'
        );
        const db = await initializeDatabase();
        await deleteEvent(db, parseInt(selectedEvent.id));

        setEvents((prev) =>
          prev.filter((event) => event.id !== selectedEvent.id)
        );
        setIsViewOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  }, [selectedEvent]);

  const handleViewNote = useCallback(
    (noteId: number) => {
      router.push(`/notes?noteId=${noteId}`);
    },
    [router]
  );

  const handleCloseViewDialog = () => {
    setIsViewOpen(false);
    setIsEditing(false);
    setSelectedEvent(null);
  };

  // Custom event styles based on whether it's a note event or regular event
  const eventPropGetter = useCallback((event: CalendarEvent) => {
    return {
      className: event.noteId ? 'note-event' : 'regular-event',
      style: {
        backgroundColor: event.noteId ? '#3b82f6' : '#10b981', // blue-500 for notes, emerald-500 for regular events
        borderColor: event.noteId ? '#2563eb' : '#059669', // blue-600 for notes, emerald-600 for regular events
      },
    };
  }, []);

  return (
    <div className="relative space-y-8 p-4">
      {/* <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Note Activity</h2>
        <NoteHeatmap />
      </div> */}

      {/* Create Event Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter event title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter event description"
              />
            </div>
            <div className="grid gap-2">
              <Label>Time</Label>
              <div className="text-sm text-gray-500">
                {moment(newEvent.start).format('MMMM Do YYYY, h:mm a')} -{' '}
                {moment(newEvent.end).format('h:mm a')}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Event Dialog */}
      <Dialog open={isViewOpen} onOpenChange={handleCloseViewDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogDescription className="sr-only">
            {isEditing ? 'Edit Event' : 'Event Details'}
          </DialogDescription>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Event' : 'Event Details'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="view-title">Event Title</Label>
              {isEditing ? (
                <Input
                  id="view-title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              ) : (
                <div className="rounded-md bg-muted p-2 text-sm">
                  {selectedEvent?.title}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="view-description">Description</Label>
              {isEditing ? (
                <Textarea
                  id="view-description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              ) : (
                <div className="min-h-[60px] rounded-md bg-muted p-2 text-sm">
                  {selectedEvent?.description || 'No description'}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Time</Label>
              <div className="text-sm text-gray-500">
                {selectedEvent && (
                  <>
                    {moment(selectedEvent.start).format('MMMM Do YYYY, h:mm a')}{' '}
                    - {moment(selectedEvent.end).format('h:mm a')}
                  </>
                )}
              </div>
            </div>
            {selectedEvent?.noteId && (
              <div className="grid gap-2">
                <Label>Associated Note</Label>
                <Button
                  variant="outline"
                  onClick={() => handleViewNote(selectedEvent.noteId!)}
                >
                  View Note: {selectedEvent.noteName}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              {!isEditing && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDeleteEvent}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCloseViewDialog}>
                Cancel
              </Button>
              {isEditing ? (
                <Button onClick={handleUpdateEvent}>Save Changes</Button>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Event</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="h-[calc(100vh-4rem)]">
        <DnDCalendar
          localizer={localizer}
          events={events}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          resizable
          selectable
          defaultView={Views.MONTH}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          style={{ height: '100%' }}
          className="h-full"
        />
      </div>
    </div>
  );
}
