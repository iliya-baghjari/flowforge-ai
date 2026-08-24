'use client';

import * as React from 'react';
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

const sampleEvents = [
  {
    id: 'team-sync',
    title: 'Team Sync',
    date: addDays(new Date(), 2),
    time: '10:00 AM',
    type: 'meeting',
  },
  {
    id: 'design-review',
    title: 'Design Review',
    date: addDays(new Date(), 7),
    time: '2:30 PM',
    type: 'review',
  },
  {
    id: 'launch-window',
    title: 'Launch Window',
    date: addDays(new Date(), 12),
    time: '9:00 AM',
    type: 'milestone',
  },
];

export function CalendarView() {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const monthLabel = format(today, 'MMMM yyyy');

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Calendar
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              {monthLabel}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
            <div key={weekday} className="py-2">
              {weekday}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {days.map((day) => {
            const isCurrentMonth = format(day, 'M') === format(today, 'M');
            const hasEvent = sampleEvents.some((event) =>
              isSameDay(event.date, day)
            );

            return (
              <div
                key={day.toString()}
                className={[
                  'flex min-h-24 flex-col rounded-xl border p-2 text-left transition-colors',
                  isCurrentMonth
                    ? 'border-border/60 bg-background/70'
                    : 'border-border/20 bg-muted/20 text-muted-foreground/70',
                  isSameDay(day, today) ? 'ring-2 ring-primary/60' : '',
                ].join(' ')}
              >
                <span className="text-sm font-medium">{format(day, 'd')}</span>

                {hasEvent && (
                  <div className="mt-2 space-y-1">
                    {sampleEvents
                      .filter((event) => isSameDay(event.date, day))
                      .map((event) => (
                        <div
                          key={event.id}
                          className={[
                            'rounded-md px-2 py-1 text-[10px] font-medium text-white',
                            event.type === 'meeting' && 'bg-blue-500',
                            event.type === 'review' && 'bg-violet-500',
                            event.type === 'milestone' && 'bg-emerald-500',
                          ].join(' ')}
                        >
                          {event.title}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <aside className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Upcoming
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Schedule
          </h3>
        </div>

        <div className="space-y-3">
          {sampleEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-border/60 bg-background/70 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={[
                    'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white',
                    event.type === 'meeting' && 'bg-blue-500',
                    event.type === 'review' && 'bg-violet-500',
                    event.type === 'milestone' && 'bg-emerald-500',
                  ].join(' ')}
                >
                  {event.type}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {format(event.date, 'MMM d')}
                </span>
              </div>

              <p className="font-medium text-foreground">{event.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{event.time}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
