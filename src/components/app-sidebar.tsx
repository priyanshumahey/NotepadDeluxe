'use client';

import * as React from 'react';
import { BookOpen, PenSquare, Settings } from 'lucide-react';

import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav-main';

const data = {
  navMain: [
    {
      title: 'My Notes',
      url: '/notes',
      icon: BookOpen,
      isActive: true,
    },
    {
      title: 'New Note',
      url: '/newnote',
      icon: PenSquare,
      isActive: true,
    },
  ],
  settings: {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    isActive: true,
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent className="flex h-full flex-col">
        <div className="grow">
          <NavMain items={data.navMain} />
        </div>
        <div className="mt-auto">
          <NavMain items={[data.settings]} hideLabel />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
