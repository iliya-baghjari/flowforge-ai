import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CalendarView } from '@/components/dashboard/calendar-view';

describe('CalendarView', () => {
  it('renders the current month and upcoming events', () => {
    render(<CalendarView />);

    expect(screen.getByText(/calendar/i)).toBeInTheDocument();
    expect(screen.getByText(/schedule/i)).toBeInTheDocument();
    expect(screen.getAllByText(/team sync/i).length).toBeGreaterThan(0);
  });
});
