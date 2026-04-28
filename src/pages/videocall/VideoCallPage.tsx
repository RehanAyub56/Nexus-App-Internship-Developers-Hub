import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, Phone, PhoneOff,
  Monitor, MonitorOff, MessageSquare, Users, MoreVertical,
  ChevronLeft, Signal, Wifi, Clock, Volume2, VolumeX,
  Maximize2, Minimize2, Grid3x3, Copy, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { findUserById, users } from '../../data/users';

type CallState = 'idle' | 'ringing' | 'connecting' | 'active' | 'ended';
type Layout = 'spotlight' | 'grid';

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

interface ChatMsg {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export const VideoCallPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Call state
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [layout, setLayout] = useState<Layout>('spotlight');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { id: '1', sender: 'System', text: 'Call started. End-to-end encrypted.', time: '00:00' },
  ]);
  const [copied, setCopied] = useState(false);
  const [remoteVideoSimulated, setRemoteVideoSimulated] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callStartTime = useRef<number>(0);

  const partner = userId ? findUserById(userId) : users.find(u => u.id !== user?.id);
  const callId = `nx-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  // Start local camera
  const startLocalVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch {
      // Camera not available — that's fine in mock
    }
  }, []);

  // Simulate call flow
  const startCall = useCallback(async () => {
    setCallState('ringing');
    await startLocalVideo();

    setTimeout(() => {
      setCallState('connecting');
      setTimeout(() => {
        setCallState('active');
        callStartTime.current = Date.now();
        setRemoteVideoSimulated(true);
        timerRef.current = setInterval(() => {
          setDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
        }, 1000);
        setChatMessages(prev => [
          ...prev,
          { id: Date.now().toString(), sender: partner?.name ?? 'Guest', text: 'Hey! Can you hear me?', time: formatDuration(0) },
        ]);
      }, 1500);
    }, 2500);
  }, [startLocalVideo, partner]);

  const endCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Stop all local tracks
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setCallState('ended');
    setRemoteVideoSimulated(false);
    setTimeout(() => navigate(-1), 2500);
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (localVideoRef.current?.srcObject) {
        (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      return;
    }
    try {
      await (navigator.mediaDevices as MediaDevices & { getDisplayMedia: (o?: object) => Promise<MediaStream> }).getDisplayMedia({ video: true });
      setIsScreenSharing(true);
      setChatMessages(prev => [
        ...prev,
        { id: Date.now().toString(), sender: user?.name ?? 'You', text: '📺 Started screen sharing', time: formatDuration(duration) },
      ]);
    } catch {
      setIsScreenSharing(false);
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: user?.name ?? 'You', text: chatInput.trim(), time: formatDuration(duration) },
    ]);
    setChatInput('');
    // Simulate reply
    setTimeout(() => {
      const replies = ['Got it!', 'Sure, makes sense.', 'Can you share your screen?', 'Let me check that.', '👍'];
      setChatMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: partner?.name ?? 'Guest', text: replies[Math.floor(Math.random() * replies.length)], time: formatDuration(duration) },
      ]);
    }, 1800);
  };

  const copyCallId = () => {
    navigator.clipboard.writeText(callId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  // ── IDLE / PRE-CALL SCREEN ──
  if (callState === 'idle') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ChevronLeft size={18} /> Back
          </button>

          {/* Card */}
          <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <img
                  src={partner?.avatarUrl ?? `https://ui-avatars.com/api/?name=Guest&background=3b82f6&color=fff`}
                  alt={partner?.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-500/40"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900" />
              </div>
              <h2 className="text-white text-xl font-semibold">{partner?.name ?? 'Team Meeting'}</h2>
              <p className="text-gray-400 text-sm mt-1 capitalize">{partner?.role ?? 'Guest'}</p>
            </div>

            {/* Call ID */}
            <div className="bg-gray-800 rounded-2xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Meeting ID</p>
              <div className="flex items-center justify-between">
                <span className="text-white font-mono text-sm tracking-widest">{callId}</span>
                <button
                  onClick={copyCallId}
                  className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="relative bg-gray-800 rounded-2xl h-36 mb-6 overflow-hidden flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-0"
              />
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                  <Video size={20} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-xs">Camera preview</p>
              </div>
              {/* Check-marks */}
              <div className="absolute bottom-3 left-3 flex gap-2">
                <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                  <Mic size={11} className="text-emerald-400" />
                  <span className="text-white text-xs">Mic</span>
                </div>
                <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                  <Video size={11} className="text-emerald-400" />
                  <span className="text-white text-xs">Cam</span>
                </div>
              </div>
            </div>

            {/* Start Call */}
            <button
              onClick={startCall}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-primary-900/40"
            >
              <Video size={20} />
              Start Video Call
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 mt-3 bg-transparent border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 font-medium rounded-2xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RINGING SCREEN ──
  if (callState === 'ringing') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-primary-500/30 animate-ping"
                style={{ animationDelay: `${i * 0.3}s`, transform: `scale(${1 + i * 0.5})` }}
              />
            ))}
            <img
              src={partner?.avatarUrl ?? ''}
              alt={partner?.name}
              className="relative w-28 h-28 rounded-full object-cover ring-4 ring-primary-500/60"
            />
          </div>
          <h2 className="text-white text-2xl font-semibold mb-2">{partner?.name}</h2>
          <p className="text-gray-400">Calling…</p>
        </div>
      </div>
    );
  }

  // ── CONNECTING ──
  if (callState === 'connecting') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Connecting…</p>
          <p className="text-gray-500 text-sm mt-1">Setting up encrypted connection</p>
        </div>
      </div>
    );
  }

  // ── ENDED ──
  if (callState === 'ended') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff size={28} className="text-red-400" />
          </div>
          <p className="text-white text-xl font-semibold">Call Ended</p>
          <p className="text-gray-400 mt-2">Duration: {formatDuration(duration)}</p>
          <p className="text-gray-500 text-sm mt-1">Returning to dashboard…</p>
        </div>
      </div>
    );
  }

  // ── ACTIVE CALL ──
  return (
    <div className={`bg-gray-950 flex flex-col overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-md border-b border-white/5 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white font-semibold text-sm">{partner?.name}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock size={11} />
                <span>{formatDuration(duration)}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <Wifi size={11} />
                <span>HD · Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayout(l => l === 'spotlight' ? 'grid' : 'spotlight')}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Toggle Layout"
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 relative bg-gray-900 overflow-hidden">
          {layout === 'spotlight' ? (
            <>
              {/* Remote video (main) */}
              <div className="absolute inset-0">
                {remoteVideoSimulated ? (
                  <div className="w-full h-full flex items-center justify-center relative">
                    {/* Simulated remote video with gradient */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <img
                          src={partner?.avatarUrl}
                          alt={partner?.name}
                          className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-white/10 mb-4"
                        />
                        <p className="text-white/60 text-sm">{isScreenSharing ? '📺 You are sharing your screen' : `${partner?.name}'s camera`}</p>
                      </div>
                    </div>
                    {/* Screen-share overlay indicator */}
                    {isScreenSharing && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-2">
                        <Monitor size={13} />
                        Screen sharing active
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-600 text-center">
                      <Video size={48} className="mx-auto mb-3 opacity-30" />
                      <p>Waiting for video…</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Local video (PiP) */}
              <div className="absolute bottom-6 right-6 w-44 h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-800">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                />
                {isVideoOff && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
                  {isMuted ? <MicOff size={10} className="text-red-400" /> : <Mic size={10} className="text-white" />}
                  <span className="text-white text-xs">You</span>
                </div>
              </div>
            </>
          ) : (
            /* Grid layout */
            <div className="w-full h-full grid grid-cols-2 gap-3 p-4">
              {/* Remote */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-800 flex items-center justify-center border border-white/10">
                <div className="text-center">
                  <img src={partner?.avatarUrl} alt={partner?.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-2 ring-2 ring-primary-500/30" />
                  <p className="text-white text-xs">{partner?.name}</p>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 rounded-full px-2 py-0.5 text-xs text-white">{partner?.name}</div>
              </div>
              {/* Local */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-800 flex items-center justify-center border border-white/10">
                <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} />
                {isVideoOff && (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-white/20" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/60 rounded-full px-2 py-0.5 text-xs text-white">You</div>
                {isMuted && <div className="absolute top-3 right-3 bg-red-500/80 rounded-full p-1"><MicOff size={12} className="text-white" /></div>}
              </div>
            </div>
          )}

          {/* Signal quality */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Signal size={13} className="text-emerald-400" />
            <span className="text-white text-xs font-medium">Excellent</span>
          </div>
        </div>

        {/* Side panel (chat / participants) */}
        {(showChat || showParticipants) && (
          <div className="w-80 bg-gray-900 border-l border-white/10 flex flex-col">
            {/* Panel header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <button
                onClick={() => { setShowChat(true); setShowParticipants(false); }}
                className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-colors ${showChat ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Chat
              </button>
              <button
                onClick={() => { setShowParticipants(true); setShowChat(false); }}
                className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-colors ${showParticipants ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                People
              </button>
              <button
                onClick={() => { setShowChat(false); setShowParticipants(false); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white"
              >
                ×
              </button>
            </div>

            {showChat && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`${msg.sender === user.name ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {msg.sender !== user.name && (
                        <span className="text-gray-500 text-xs px-1">{msg.sender}</span>
                      )}
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                        msg.sender === 'System' ? 'bg-white/5 text-gray-500 text-xs text-center mx-auto' :
                        msg.sender === user.name ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-200'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-gray-600 text-xs px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/10 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Send a message…"
                    className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-600"
                  />
                  <button onClick={sendChat} className="p-2 bg-primary-600 hover:bg-primary-500 rounded-xl text-white transition-colors">
                    <MessageSquare size={16} />
                  </button>
                </div>
              </>
            )}

            {showParticipants && (
              <div className="flex-1 p-4 space-y-3">
                {[
                  { name: user.name, avatar: user.avatarUrl, role: 'You', muted: isMuted },
                  { name: partner?.name ?? 'Guest', avatar: partner?.avatarUrl ?? '', role: partner?.role ?? '', muted: false },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-2xl">
                    <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.name}</p>
                      <p className="text-gray-500 text-xs capitalize">{p.role}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.muted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-emerald-400" />}
                      <Video size={14} className="text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-black/60 backdrop-blur-lg border-t border-white/10 px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          {/* Mic */}
          <ControlBtn
            active={!isMuted}
            onClick={() => setIsMuted(m => !m)}
            icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            label={isMuted ? 'Unmute' : 'Mute'}
            danger={isMuted}
          />

          {/* Video */}
          <ControlBtn
            active={!isVideoOff}
            onClick={() => setIsVideoOff(v => !v)}
            icon={isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            label={isVideoOff ? 'Start Video' : 'Stop Video'}
            danger={isVideoOff}
          />

          {/* Screen share */}
          <ControlBtn
            active={isScreenSharing}
            onClick={handleScreenShare}
            icon={isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
            label="Share"
            highlight={isScreenSharing}
          />

          {/* Speaker */}
          <ControlBtn
            active={!isSpeakerOff}
            onClick={() => setIsSpeakerOff(s => !s)}
            icon={isSpeakerOff ? <VolumeX size={20} /> : <Volume2 size={20} />}
            label="Speaker"
            danger={isSpeakerOff}
          />

          {/* Chat */}
          <ControlBtn
            active={showChat}
            onClick={() => { setShowChat(c => !c); setShowParticipants(false); }}
            icon={<MessageSquare size={20} />}
            label="Chat"
            highlight={showChat}
          />

          {/* Participants */}
          <ControlBtn
            active={showParticipants}
            onClick={() => { setShowParticipants(p => !p); setShowChat(false); }}
            icon={<Users size={20} />}
            label="People"
            highlight={showParticipants}
          />

          {/* End call */}
          <button
            onClick={endCall}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-red-900/40 group-hover:scale-105">
              <PhoneOff size={22} className="text-white" />
            </div>
            <span className="text-gray-500 text-xs group-hover:text-gray-300">End</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Control Button ──
interface ControlBtnProps {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  highlight?: boolean;
}

const ControlBtn: React.FC<ControlBtnProps> = ({ active, onClick, icon, label, danger, highlight }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group">
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-105
        ${danger ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' :
          highlight ? 'bg-primary-600/30 text-primary-400 hover:bg-primary-600/50' :
          'bg-white/10 text-white hover:bg-white/20'
        }`}
    >
      {icon}
    </div>
    <span className="text-gray-500 text-xs group-hover:text-gray-300">{label}</span>
  </button>
);
