'use client';

import * as React from 'react';
import { BookOpen, PenSquare } from 'lucide-react';

import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav-main';

const data = {
  navMain: [
    {
      title: 'My Notes',
      url: '/notes',
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: 'All Notes',
          url: '/notes',
        },
      ],
    },
    {
      title: 'New Note',
      url: '/newnote',
      icon: PenSquare,
      isActive: true,
      items: [
        {
          title: 'Create New Note',
          url: '/newnote',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
