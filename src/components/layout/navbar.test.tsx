import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dedupeNotificationList, Navbar } from '@/components/layout/navbar';
import { useWorkspaceStore } from '@/store/workspace-store';

const { mockSession, push, signOut } = vi.hoisted(() => ({
  mockSession: {
    user: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    },
  },
  push: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSession }),
  signOut,
}));

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    })
  );
});

describe('dedupeNotificationList', () => {
  it('keeps the current list when the stored notifications are unchanged', () => {
    const notifications = [
      {
        id: '1',
        type: 'task',
        title: 'Task updated',
        message: 'A task moved to review.',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    expect(dedupeNotificationList(notifications, notifications)).toEqual(
      notifications
    );
  });

  it('limits the list to the most recent six notifications', () => {
    const notifications = Array.from({ length: 9 }, (_, index) => ({
      id: String(index),
      type: 'task',
      title: `Task ${index}`,
      message: `Message ${index}`,
      createdAt: `2025-01-01T00:00:0${index}.000Z`,
    }));

    expect(dedupeNotificationList(notifications, [])).toHaveLength(6);
    expect(
      dedupeNotificationList(notifications, []).map(
        (notification) => notification.id
      )
    ).toEqual(['0', '1', '2', '3', '4', '5']);
  });

  it('closes the profile menu when clicking outside it', async () => {
    useWorkspaceStore.setState({
      currentWorkspaceId: null,
      workspaces: [],
      setCurrentWorkspaceId: vi.fn(),
      setWorkspaces: vi.fn(),
    });

    const user = userEvent.setup();
    render(
      <div>
        <button type="button">Outside</button>
        <Navbar />
      </div>
    );

    await user.click(screen.getByRole('button', { name: /user menu/i }));
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /outside/i }));

    expect(screen.queryByRole('link', { name: /profile/i })).not.toBeInTheDocument();
  });
});
