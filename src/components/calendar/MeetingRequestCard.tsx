import React from 'react';
import { Check, X, Clock, Calendar, User } from 'lucide-react';
import { MeetingRequest } from '../../types/calendar';
import { updateMeetingStatus } from '../../data/calendar';
import toast from 'react-hot-toast';

interface MeetingRequestCardProps {
  meeting: MeetingRequest;
  currentUserId: string;
  onStatusChange: () => void;
  compact?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  declined: 'bg-red-50 text-red-600 border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

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

export const MeetingRequestCard: React.FC<MeetingRequestCardProps> = ({
  meeting,
  currentUserId,
  onStatusChange,
  compact = false,
}) => {
  const isReceiver = meeting.receiverId === currentUserId;
  const otherName = isReceiver ? meeting.senderName : meeting.receiverName;
  const otherAvatar = isReceiver ? meeting.senderAvatar : undefined;

  const handleAccept = () => {
    updateMeetingStatus(meeting.id, 'accepted');
    onStatusChange();
    toast.success('Meeting accepted!');
  };

  const handleDecline = () => {
    updateMeetingStatus(meeting.id, 'declined');
    onStatusChange();
    toast.error('Meeting declined.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {otherAvatar ? (
            <img
              src={otherAvatar}
              alt={otherName}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <User size={15} className="text-primary-600" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{meeting.title}</p>
            <p className="text-xs text-gray-500">
              {isReceiver ? 'From' : 'To'}: {otherName}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full border capitalize ${
            STATUS_STYLES[meeting.status]
          }`}
        >
          {meeting.status}
        </span>
      </div>

      {/* Description */}
      {!compact && meeting.description && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
          {meeting.description}
        </p>
      )}

      {/* Time info */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
        <div className="flex items-center gap-1">
          <Calendar size={13} className="text-primary-400" />
          <span>{formatDate(meeting.date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={13} className="text-primary-400" />
          <span>
            {formatTime(meeting.startTime)} – {formatTime(meeting.endTime)}
          </span>
        </div>
      </div>

      {/* Actions */}
      {meeting.status === 'pending' && isReceiver && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Check size={13} />
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
          >
            <X size={13} />
            Decline
          </button>
        </div>
      )}
    </div>
  );
};
