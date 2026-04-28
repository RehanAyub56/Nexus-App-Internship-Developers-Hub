import { TimeSlot, MeetingRequest } from '../types/calendar';

// Helper to get ISO date string for relative days
const dateStr = (daysFromNow: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

export let timeSlots: TimeSlot[] = [
  {
    id: 'slot-1',
    userId: 'e1',
    date: dateStr(1),
    startTime: '09:00',
    endTime: '09:30',
    status: 'available',
  },
  {
    id: 'slot-2',
    userId: 'e1',
    date: dateStr(1),
    startTime: '10:00',
    endTime: '10:30',
    status: 'available',
  },
  {
    id: 'slot-3',
    userId: 'e1',
    date: dateStr(2),
    startTime: '14:00',
    endTime: '14:30',
    status: 'booked',
  },
  {
    id: 'slot-4',
    userId: 'i1',
    date: dateStr(1),
    startTime: '11:00',
    endTime: '11:30',
    status: 'available',
  },
  {
    id: 'slot-5',
    userId: 'i1',
    date: dateStr(3),
    startTime: '15:00',
    endTime: '15:30',
    status: 'available',
  },
];

export let meetingRequests: MeetingRequest[] = [
  {
    id: 'mtg-1',
    senderId: 'i1',
    receiverId: 'e1',
    senderName: 'James Wilson',
    receiverName: 'Sarah Johnson',
    senderAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    title: 'Investment Discussion - TechWave AI',
    description: 'Looking to discuss your AI platform and explore Series A investment opportunity.',
    date: dateStr(2),
    startTime: '14:00',
    endTime: '14:30',
    status: 'pending',
    createdAt: new Date().toISOString(),
    slotId: 'slot-3',
  },
  {
    id: 'mtg-2',
    senderId: 'e1',
    receiverId: 'i1',
    senderName: 'Sarah Johnson',
    receiverName: 'James Wilson',
    senderAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    title: 'Product Demo Session',
    description: 'Would like to give you a full demo of our analytics dashboard.',
    date: dateStr(4),
    startTime: '11:00',
    endTime: '11:30',
    status: 'accepted',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mtg-3',
    senderId: 'i2',
    receiverId: 'e1',
    senderName: 'Emily Rodriguez',
    receiverName: 'Sarah Johnson',
    senderAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    title: 'Market Expansion Strategy',
    description: 'I want to learn more about your go-to-market strategy for the European market.',
    date: dateStr(6),
    startTime: '10:00',
    endTime: '10:30',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// ---- CRUD helpers ----

export const getSlotsForUser = (userId: string): TimeSlot[] =>
  timeSlots.filter((s) => s.userId === userId);

export const addSlot = (slot: TimeSlot): void => {
  timeSlots = [...timeSlots, slot];
};

export const updateSlot = (slotId: string, updates: Partial<TimeSlot>): void => {
  timeSlots = timeSlots.map((s) => (s.id === slotId ? { ...s, ...updates } : s));
};

export const deleteSlot = (slotId: string): void => {
  timeSlots = timeSlots.filter((s) => s.id !== slotId);
};

export const getMeetingsForUser = (userId: string): MeetingRequest[] =>
  meetingRequests.filter(
    (m) => m.senderId === userId || m.receiverId === userId
  );

export const getIncomingRequests = (userId: string): MeetingRequest[] =>
  meetingRequests.filter((m) => m.receiverId === userId && m.status === 'pending');

export const addMeetingRequest = (request: MeetingRequest): void => {
  meetingRequests = [request, ...meetingRequests];
};

export const updateMeetingStatus = (
  meetingId: string,
  status: MeetingRequest['status']
): void => {
  meetingRequests = meetingRequests.map((m) =>
    m.id === meetingId ? { ...m, status } : m
  );
  // If accepted, mark the slot as booked
  const meeting = meetingRequests.find((m) => m.id === meetingId);
  if (status === 'accepted' && meeting?.slotId) {
    updateSlot(meeting.slotId, { status: 'booked' });
  }
};
