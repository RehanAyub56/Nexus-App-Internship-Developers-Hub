import React, { useState, useCallback } from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MiniCalendar } from '../../components/calendar/MiniCalendar';
import { AvailabilityManager } from '../../components/calendar/AvailabilityManager';
import { MeetingRequestCard } from '../../components/calendar/MeetingRequestCard';
import {
  getSlotsForUser,
  getMeetingsForUser,
  getIncomingRequests,
  timeSlots,
  meetingRequests,
} from '../../data/calendar';

type TabType = 'calendar' | 'incoming' | 'confirmed';

const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [tick, setTick] = useState(0); // force re-render when data changes

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  if (!user) return null;

  const userSlots = getSlotsForUser(user.id);
  const userMeetings = getMeetingsForUser(user.id);
  const incomingRequests = getIncomingRequests(user.id);
  const confirmedMeetings = userMeetings.filter((m) => m.status === 'accepted');

  // Meetings for selected day
  const selectedISO = selectedDate
    ? new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      )
        .toISOString()
        .split('T')[0]
    : null;

  const dayMeetings = userMeetings.filter(
    (m) =>
      m.date === selectedISO &&
      (m.senderId === user.id || m.receiverId === user.id)
  );

  const prevMonth = () => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const tabs: { key: TabType; label: string; count?: number; icon: React.ReactNode }[] = [
    { key: 'calendar', label: 'My Calendar', icon: <Calendar size={15} /> },
    {
      key: 'incoming',
      label: 'Requests',
      count: incomingRequests.length,
      icon: <AlertCircle size={15} />,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      count: confirmedMeetings.length,
      icon: <CheckCircle size={15} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-primary-600" size={26} />
            Meeting Calendar
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your availability and meeting requests
          </p>
        </div>
        {/* Quick stats */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-primary-600">{incomingRequests.length}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-600">{confirmedMeetings.length}</p>
            <p className="text-xs text-gray-500">Confirmed</p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <p className="text-xl font-bold text-gray-700">
              {userSlots.filter((s) => s.status === 'available').length}
            </p>
            <p className="text-xs text-gray-500">Open Slots</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  tab.key === 'incoming'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---- Calendar Tab ---- */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: mini cal + availability */}
          <div className="space-y-4">
            <MiniCalendar
              currentDate={currentMonth}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              meetings={userMeetings}
              slots={userSlots}
              userId={user.id}
            />
            <AvailabilityManager
              selectedDate={selectedDate}
              slots={userSlots}
              userId={user.id}
              onSlotsChange={refresh}
            />
          </div>

          {/* Right column: day detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full min-h-[400px]">
              {/* Day header */}
              <div className="px-6 py-4 border-b border-gray-100">
                {selectedDate ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">
                        {WEEKDAYS_FULL[selectedDate.getDay()]},{' '}
                        {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {dayMeetings.length > 0
                          ? `${dayMeetings.length} meeting(s) scheduled`
                          : 'No meetings scheduled'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const prev = new Date(selectedDate);
                          prev.setDate(prev.getDate() - 1);
                          setSelectedDate(prev);
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => {
                          const next = new Date(selectedDate);
                          next.setDate(next.getDate() + 1);
                          setSelectedDate(next);
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Select a date to view details
                  </p>
                )}
              </div>

              {/* Day timeline */}
              <div className="px-6 py-4 overflow-y-auto max-h-[500px]">
                {!selectedDate ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Calendar size={40} className="mb-3 opacity-30" />
                    <p className="text-sm">Click a date on the calendar</p>
                  </div>
                ) : dayMeetings.length === 0 &&
                  userSlots.filter((s) => s.date === selectedISO && s.userId === user.id).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Clock size={40} className="mb-3 opacity-30" />
                    <p className="text-sm font-medium">Nothing scheduled</p>
                    <p className="text-xs mt-1">Add availability slots using the panel on the left</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Show slots */}
                    {userSlots
                      .filter((s) => s.date === selectedISO && s.userId === user.id)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
                            slot.status === 'available'
                              ? 'bg-emerald-50 border-emerald-200'
                              : slot.status === 'booked'
                              ? 'bg-primary-50 border-primary-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              slot.status === 'available'
                                ? 'bg-emerald-500'
                                : slot.status === 'booked'
                                ? 'bg-primary-500'
                                : 'bg-gray-400'
                            }`}
                          />
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          <span className="text-xs font-medium text-gray-600">
                            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                          </span>
                          <span
                            className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                              slot.status === 'available'
                                ? 'text-emerald-700'
                                : slot.status === 'booked'
                                ? 'text-primary-700'
                                : 'text-gray-500'
                            }`}
                          >
                            {slot.status === 'available' ? 'Open slot' : slot.status}
                          </span>
                        </div>
                      ))}

                    {/* Show meetings */}
                    {dayMeetings.map((meeting) => (
                      <MeetingRequestCard
                        key={meeting.id}
                        meeting={meeting}
                        currentUserId={user.id}
                        onStatusChange={refresh}
                        compact
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Incoming Requests Tab ---- */}
      {activeTab === 'incoming' && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-500" />
            Incoming Meeting Requests
          </h2>
          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckCircle size={40} className="mb-3 opacity-30 text-emerald-400" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs mt-1">No pending meeting requests</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {incomingRequests.map((meeting) => (
                <MeetingRequestCard
                  key={meeting.id}
                  meeting={meeting}
                  currentUserId={user.id}
                  onStatusChange={refresh}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Confirmed Meetings Tab ---- */}
      {activeTab === 'confirmed' && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-500" />
            Confirmed Meetings
          </h2>
          {confirmedMeetings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-gray-400">
              <Users size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No confirmed meetings yet</p>
              <p className="text-xs mt-1">Accept incoming requests to schedule meetings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {confirmedMeetings
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((meeting) => (
                  <MeetingRequestCard
                    key={meeting.id}
                    meeting={meeting}
                    currentUserId={user.id}
                    onStatusChange={refresh}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
