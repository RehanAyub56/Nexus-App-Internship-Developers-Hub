import React, { useState } from 'react';
import { Plus, Trash2, Clock, Check } from 'lucide-react';
import { TimeSlot } from '../../types/calendar';
import { addSlot, deleteSlot } from '../../data/calendar';
import toast from 'react-hot-toast';

interface AvailabilityManagerProps {
  selectedDate: Date | null;
  slots: TimeSlot[];
  userId: string;
  onSlotsChange: () => void;
}

const TIME_OPTIONS: string[] = [];
for (let h = 8; h <= 19; h++) {
  TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:30`);
}

const formatTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const addHalfHour = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const totalMins = h * 60 + m + 30;
  const nh = Math.floor(totalMins / 60);
  const nm = totalMins % 60;
  return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`;
};

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  selectedDate,
  slots,
  userId,
  onSlotsChange,
}) => {
  const [startTime, setStartTime] = useState('09:00');
  const [isAdding, setIsAdding] = useState(false);

  const dateISO = selectedDate
    ? new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      )
        .toISOString()
        .split('T')[0]
    : null;

  const daySlots = slots.filter(
    (s) => s.date === dateISO && s.userId === userId
  );

  const handleAdd = () => {
    if (!dateISO) return;
    const endTime = addHalfHour(startTime);

    // Check overlap
    const overlap = daySlots.some(
      (s) =>
        (startTime >= s.startTime && startTime < s.endTime) ||
        (endTime > s.startTime && endTime <= s.endTime)
    );

    if (overlap) {
      toast.error('This slot overlaps with an existing one.');
      return;
    }

    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      userId,
      date: dateISO,
      startTime,
      endTime,
      status: 'available',
    };
    addSlot(newSlot);
    onSlotsChange();
    setIsAdding(false);
    toast.success('Availability slot added!');
  };

  const handleDelete = (slotId: string, status: string) => {
    if (status === 'booked') {
      toast.error('Cannot delete a booked slot.');
      return;
    }
    deleteSlot(slotId);
    onSlotsChange();
    toast.success('Slot removed.');
  };

  const statusColors: Record<string, string> = {
    available: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    booked: 'bg-primary-50 border-primary-200 text-primary-700',
    blocked: 'bg-gray-100 border-gray-200 text-gray-500',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">My Availability</h3>
          {selectedDate ? (
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">Select a date to manage slots</p>
          )}
        </div>
        {selectedDate && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isAdding
                ? 'bg-gray-100 text-gray-600'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <Plus size={14} />
            Add Slot
          </button>
        )}
      </div>

      {/* Add slot form */}
      {isAdding && (
        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Clock size={14} className="text-gray-400 shrink-0" />
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {TIME_OPTIONS.slice(0, -2).map((t) => (
                <option key={t} value={t}>
                  {formatTime(t)}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400">–</span>
            <span className="text-sm text-gray-600 font-medium">
              {formatTime(addHalfHour(startTime))}
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
          >
            <Check size={14} />
            Confirm
          </button>
        </div>
      )}

      {/* Slot list */}
      {!selectedDate ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Pick a date on the calendar
        </div>
      ) : daySlots.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Clock size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No slots for this day</p>
        </div>
      ) : (
        <div className="space-y-2">
          {daySlots
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium ${
                  statusColors[slot.status]
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock size={13} />
                  <span>
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="capitalize px-2 py-0.5 rounded-full bg-white/60 text-xs">
                    {slot.status}
                  </span>
                  {slot.status !== 'booked' && (
                    <button
                      onClick={() => handleDelete(slot.id, slot.status)}
                      className="p-1 rounded-lg hover:bg-white/70 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
