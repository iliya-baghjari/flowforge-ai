"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

interface CalendarDeadline {
  date: Date;
  title: string;
  count: number;
}

interface MiniCalendarProps {
  deadlines: CalendarDeadline[];
}

export function MiniCalendar({ deadlines }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const deadlineMap = useMemo(() => {
    const map = new Map<number, CalendarDeadline[]>();
    deadlines.forEach((deadline) => {
      const day = deadline.date.getDate();
      if (!map.has(day)) {
        map.set(day, []);
      }
      map.get(day)!.push(deadline);
    });
    return map;
  }, [deadlines]);

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const days = [];
  const totalDays = daysInMonth(currentDate);
  const firstDay = firstDayOfMonth(currentDate);

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Task Deadlines
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="rounded-lg p-1 transition-colors hover:bg-background"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="min-w-30 text-center text-sm font-medium text-foreground">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1 transition-colors hover:bg-background"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const hasDeadlines = day && deadlineMap.has(day);
              const dayDeadlines = hasDeadlines
                ? deadlineMap.get(day)!
                : [];

              return (
                <div
                  key={index}
                  className={`relative rounded-lg border p-2 text-center text-xs font-medium transition-all ${
                    day
                      ? "border-border/60 bg-background hover:bg-background/80 cursor-pointer"
                      : "border-transparent bg-transparent"
                  }`}
                >
                  {day && (
                    <>
                      <div
                        className={`${
                          hasDeadlines ? "text-orange-600 font-bold" : ""
                        }`}
                      >
                        {day}
                      </div>
                      {hasDeadlines && (
                        <div className="mt-1 flex items-center justify-center">
                          <div className="flex gap-0.5">
                            {dayDeadlines.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className="h-1 w-1 rounded-full bg-orange-500"
                              />
                            ))}
                            {dayDeadlines.length > 3 && (
                              <span className="text-xs text-orange-600">
                                +{dayDeadlines.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines List */}
        {deadlines.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
            <p className="text-xs font-semibold text-muted-foreground">
              Upcoming ({deadlines.length})
            </p>
            <div className="space-y-1">
              {deadlines.slice(0, 5).map((deadline, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-lg bg-background p-2"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {deadline.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {deadline.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {deadlines.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{deadlines.length - 5} more deadlines
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
