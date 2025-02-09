'use client';

import { sendNotification } from '@tauri-apps/plugin-notification';

import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div className="container mx-auto">
      <h1 className="m-4 text-3xl font-bold">Settings</h1>
      <Button
        onClick={() =>
          sendNotification({
            title: 'Settings',
            body: 'This is a test notification!',
          })
        }
      >
        Notification Test
      </Button>
    </div>
  );
}
