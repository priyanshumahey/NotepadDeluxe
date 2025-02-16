'use client';

import { useCallback, useState } from 'react';
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

import './react-big-calendar.css';
import './styles.css';

import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarEvent extends Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
}

interface EventFormData {
  title: string;
  description: string;
  start: Date;
  end: Date;
}

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export default function MyCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Sample Event',
      description: 'This is a sample event',
      start: moment().toDate(),
      end: moment().add(1, 'hours').toDate(),
    },
  ]);

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

  const handleEventDrop = useCallback(
    ({
      event,
      start,
      end,
    }: {
      event: CalendarEvent;
      start: Date;
      end: Date;
    }) => {
      setEvents((prev) => {
        const idx = prev.findIndex((e) => e.id === event.id);
        const updatedEvent = { ...event, start, end };
        const nextEvents = [...prev];
        nextEvents.splice(idx, 1, updatedEvent);
        return nextEvents;
      });
    },
    []
  );

  const handleEventResize = useCallback(
    ({
      event,
      start,
      end,
    }: {
      event: CalendarEvent;
      start: Date;
      end: Date;
    }) => {
      setEvents((prev) => {
        const idx = prev.findIndex((e) => e.id === event.id);
        const updatedEvent = { ...event, start, end };
        const nextEvents = [...prev];
        nextEvents.splice(idx, 1, updatedEvent);
        return nextEvents;
      });
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
    });
    setIsViewOpen(true);
  }, []);

  const handleCreateEvent = useCallback(() => {
    if (newEvent.title.trim()) {
      setEvents((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...newEvent,
        },
      ]);
      setIsCreateOpen(false);
      setNewEvent({
        title: '',
        description: '',
        start: new Date(),
        end: new Date(),
      });
    }
  }, [newEvent]);

  const handleUpdateEvent = useCallback(() => {
    if (selectedEvent && newEvent.title.trim()) {
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
    }
  }, [selectedEvent, newEvent]);

  const handleDeleteEvent = useCallback(() => {
    if (selectedEvent) {
      setEvents((prev) =>
        prev.filter((event) => event.id !== selectedEvent.id)
      );
      setIsViewOpen(false);
      setSelectedEvent(null);
    }
  }, [selectedEvent]);

  const handleCloseViewDialog = () => {
    setIsViewOpen(false);
    setIsEditing(false);
    setSelectedEvent(null);
  };

  return (
    <div className="relative p-4">
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

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <DnDCalendar
          localizer={localizer}
          events={events}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          resizable
          selectable
          defaultView={Views.DAY}
          className="h-full"
        />
      </ScrollArea>
    </div>
  );
}
