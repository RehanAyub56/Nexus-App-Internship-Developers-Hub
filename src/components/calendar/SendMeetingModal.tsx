import React, { useState } from 'react';
import { X, Calendar, Clock, Send } from 'lucide-react';
import { TimeSlot, MeetingRequest } from '../../types/calendar';
import { addMeetingRequest } from '../../data/calendar';
import { User } from '../../types';
import toast from 'react-hot-toast';

interface SendMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sender: User;
  receiver: { id: string; name: string; avatarUrl: string };
  availableSlots: TimeSlot[];
  onSent: () => void;
}

const formatTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const SendMeetingModal: React.FC<SendMeetingModalProps> = ({
  isOpen,
  onClose,
  sender,
  receiver,
  availableSlots,
  onSent,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedSlotId || !title.trim()) {
      toast.error('Please select a slot and add a title.');
      return;
    }

    const slot = availableSlots.find((s) => s.id === selectedSlotId);
    if (!slot) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const request: MeetingRequest = {
      id: `mtg-${Date.now()}`,
      senderId: sender.id,
      receiverId: receiver.id,
      senderName: sender.name,
      receiverName: receiver.name,
      senderAvatar: sender.avatarUrl,
      title: title.trim(),
      description: description.trim(),
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
      slotId: slot.id,
    };

    addMeetingRequest(request);
    setIsLoading(false);
    toast.success(`Meeting request sent to ${receiver.name}!`);
    onSent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Schedule a Meeting</h2>
            <p className="text-xs text-gray-500">with {receiver.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Meeting Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Investment Discussion"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What would you like to discuss?"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Slot selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Available Slots *
            </label>
            {availableSlots.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center bg-gray-50 rounded-xl">
                No available slots found.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      selectedSlotId === slot.id
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Calendar size={14} className="shrink-0" />
                    <span className="text-xs font-medium">{formatDate(slot.date)}</span>
                    <Clock size={13} className="shrink-0 ml-auto" />
                    <span className="text-xs">
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedSlotId || !title.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};
