'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bell, Search, Sparkles, Menu, ChevronDown } from 'lucide-react';

import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LogoutButton } from '@/components/auth/logout-button';
import { Button } from '@/components/ui/button';
import { WorkspaceSwitcher } from '@/components/workspace/workspace-switcher';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar-store';
import { useWorkspaceStore } from '@/store/workspace-store';

interface NavbarProps {
  className?: string;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

export function dedupeNotificationList(
  incoming: NotificationItem[],
  previous: NotificationItem[] = []
): NotificationItem[] {
  const unique = incoming.filter(
    (item, index, array) =>
      array.findIndex((candidate) => candidate.id === item.id) === index
  );
  const normalized = unique.slice(0, 6);

  if (
    normalized.length === previous.length &&
    normalized.every((item, index) => item.id === previous[index]?.id)
  ) {
    return previous;
  }

  return normalized;
}

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { toggle } = useSidebarStore();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    []
  );
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const currentWorkspaceId = useWorkspaceStore(
    (state) => state.currentWorkspaceId
  );

  React.useEffect(() => {
    if (!dropdownOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (!profileMenuRef.current?.contains(target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, {
      passive: true,
    });

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [dropdownOpen]);

  React.useEffect(() => {
    let isActive = true;

    const loadWorkspaces = async () => {
      try {
        const response = await fetch('/api/workspaces');
        if (!response.ok) return;

        const data = await response.json();
        if (!isActive) return;

        setWorkspaces(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load workspaces:', error);
      }
    };

    void loadWorkspaces();

    return () => {
      isActive = false;
    };
  }, [setWorkspaces]);

  React.useEffect(() => {
    if (!currentWorkspaceId || typeof window === 'undefined') return;

    let isActive = true;
    const storageKey = `flowforge:${currentWorkspaceId}:notifications`;
    const channelName = `flowforge:notifications:${currentWorkspaceId}`;

    const readStoredNotifications = () => {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as NotificationItem[]) : [];
      const next = Array.isArray(parsed) ? parsed : [];

      if (!isActive) return;

      setNotifications((previous) => dedupeNotificationList(next, previous));
    };

    const channel =
      'BroadcastChannel' in window ? new BroadcastChannel(channelName) : null;
    const handleIncoming = (event: MessageEvent | Event) => {
      const payload =
        event instanceof MessageEvent
          ? (event.data as NotificationItem | null)
          : ((event as CustomEvent<NotificationItem>).detail ?? null);

      if (!payload?.id) return;

      setNotifications((previous) => {
        const next = dedupeNotificationList([payload, ...previous], previous);

        if (next !== previous) {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        }

        return next;
      });
    };

    readStoredNotifications();
    window.addEventListener(channelName, handleIncoming as EventListener);

    if (channel) {
      channel.onmessage = (event) => handleIncoming(event);
    }

    return () => {
      isActive = false;
      window.removeEventListener(channelName, handleIncoming as EventListener);
      channel?.close();
    };
  }, [currentWorkspaceId]);

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle sidebar"
            onClick={toggle}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-2 py-1.5 shadow-sm sm:px-3 sm:py-2">
            <div className="shrink-0 rounded-full bg-primary/10 p-1.5 text-primary sm:p-2">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold sm:text-sm">FlowForge AI</p>
              <p className="hidden text-[10px] text-muted-foreground sm:block">
                Product studio
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WorkspaceSwitcher workspaces={workspaces} />

          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 rounded-full sm:inline-flex"
            aria-label="Search workspace"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">Search</span>
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Bell className="h-4 w-4" />
            </Button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 rounded-xl border border-border/60 bg-card p-3 shadow-xl z-50">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Notifications
                  </p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                    Live
                  </span>
                </div>

                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border/60 bg-background/60 px-3 py-4 text-sm text-muted-foreground">
                      No activity yet.
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="rounded-xl border border-border/60 bg-background/70 p-3"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {notification.title}
                          </p>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {notification.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleTimeString(
                            [],
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <ThemeToggle />

          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-label="User menu"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              className="ml-1 flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-2 py-1.5 hover:bg-card/80 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-600 text-sm font-semibold text-white">
                {userInitial}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border/60 bg-card shadow-lg z-50">
                <div className="p-3 border-b border-border/60 space-y-1">
                  <p className="text-sm font-medium">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors"
                  >
                    Settings
                  </Link>
                </div>
                <div className="p-2 border-t border-border/60">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
