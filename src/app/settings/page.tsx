'use client';

import { notify } from '@/lib/notifications';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div className="container mx-auto">
      <h1 className="m-4 text-3xl font-bold">Settings</h1>
      <Button
        onClick={() => notify('Settings', 'This is a test notification!')}
      >
        Notification Test
      </Button>
    </div>
  );
}
