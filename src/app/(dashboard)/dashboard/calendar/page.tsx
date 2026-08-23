import { CalendarView } from '@/components/dashboard/calendar-view';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your schedule
        </p>
      </div>

      <CalendarView />
    </div>
  );
}
