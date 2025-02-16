import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';

// Function to check and request notification permission
export async function checkAndRequestPermission(): Promise<boolean> {
  let permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }

  return permissionGranted;
}

// Function to send a notification
export async function notify(title: string, body: string): Promise<void> {
  const permissionGranted = await checkAndRequestPermission();

  if (permissionGranted) {
    sendNotification({ title, body });
  } else {
    console.warn('Notification permission not granted');
  }
}
