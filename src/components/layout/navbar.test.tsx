import { describe, expect, it } from 'vitest';

import { dedupeNotificationList } from '@/components/layout/navbar';

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
});
