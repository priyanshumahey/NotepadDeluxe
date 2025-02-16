'use client';

import { useEffect, useState } from 'react';

import { CalendarHeatmap } from '@/components/ui/calendar-heatmap';

interface NoteHeatmapProps {
  className?: string;
}

export function NoteHeatmap({ className }: NoteHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<
    { date: Date; weight: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setIsLoading(true);
      try {
        const { initializeDatabase, getNoteHeatmap } = await import(
          '@/lib/tauriDatabase'
        );
        const db = await initializeDatabase();
        const heatmapResult = await getNoteHeatmap(db);
        const weightedDates = heatmapResult.map((item) => ({
          date: new Date(item.date),
          weight: item.count,
        }));
        setHeatmapData(weightedDates);
      } catch (error) {
        console.error('Failed to fetch heatmap data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        Loading note activity data...
      </div>
    );
  }

  return (
    <CalendarHeatmap
      className={className}
      variantClassnames={[
        'text-white hover:text-white bg-blue-400 hover:bg-blue-400',
        'text-white hover:text-white bg-blue-500 hover:bg-blue-500',
        'text-white hover:text-white bg-blue-700 hover:bg-blue-700',
      ]}
      weightedDates={heatmapData}
    />
  );
}
