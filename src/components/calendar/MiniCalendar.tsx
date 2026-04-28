import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MeetingRequest, TimeSlot } from '../../types/calendar';

interface MiniCalendarProps {
  currentDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  meetings: MeetingRequest[];
  slots: TimeSlot[];
  userId: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  selectedDate,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
  meetings,
  slots,
  userId,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toISO = (d: Date) => d.toISOString().split('T')[0];

  const getDayDots = (day: number) => {
    const dateObj = new Date(year, month, day);
    const iso = toISO(dateObj);
    const hasMeeting = meetings.some(
      (m) =>
        m.date === iso &&
        (m.senderId === userId || m.receiverId === userId) &&
        m.status === 'accepted'
    );
    const hasSlot = slots.some(
      (s) => s.date === iso && s.userId === userId && s.status === 'available'
    );
    const hasPending = meetings.some(
      (m) => m.date === iso && m.receiverId === userId && m.status === 'pending'
    );
    return { hasMeeting, hasSlot, hasPending };
  };

  const cells: Array<{ day: number; type: 'prev' | 'current' | 'next' }> = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevMonthDays - firstDay + 1 + i, type: 'prev' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: 'current' });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, type: 'next' });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-sm font-semibold text-gray-800">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={onNextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell, idx) => {
          if (cell.type !== 'current') {
            return (
              <div key={idx} className="text-center py-1.5">
                <span className="text-xs text-gray-300">{cell.day}</span>
              </div>
            );
          }

          const dateObj = new Date(year, month, cell.day);
          dateObj.setHours(0, 0, 0, 0);
          const isToday = dateObj.getTime() === today.getTime();
          const isSelected =
            selectedDate &&
            new Date(selectedDate).setHours(0, 0, 0, 0) === dateObj.getTime();
          const isPast = dateObj < today;
          const { hasMeeting, hasSlot, hasPending } = getDayDots(cell.day);

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(new Date(year, month, cell.day))}
              disabled={isPast}
              className={`relative flex flex-col items-center py-1 rounded-xl transition-all duration-150
                ${isSelected ? 'bg-primary-600 text-white' : ''}
                ${isToday && !isSelected ? 'bg-primary-50 text-primary-700 font-bold' : ''}
                ${!isSelected && !isToday && !isPast ? 'hover:bg-gray-100 text-gray-700' : ''}
                ${isPast ? 'text-gray-300 cursor-default' : 'cursor-pointer'}
              `}
            >
              <span className="text-xs font-medium leading-5">{cell.day}</span>
              {/* Dots */}
              <div className="flex gap-0.5 h-1.5 mt-0.5">
                {hasMeeting && (
                  <div
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-secondary-500'
                    }`}
                  />
                )}
                {hasSlot && (
                  <div
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-primary-400'
                    }`}
                  />
                )}
                {hasPending && (
                  <div
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-accent-400'
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-secondary-500" />
          <span className="text-xs text-gray-500">Confirmed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary-400" />
          <span className="text-xs text-gray-500">Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent-400" />
          <span className="text-xs text-gray-500">Pending</span>
        </div>
      </div>
    </div>
  );
};
