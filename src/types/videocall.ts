// ──────────────── Video Call Types ────────────────

export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'active' | 'ended';

export interface CallParticipant {
  id: string;
  name: string;
  avatarUrl: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

export interface VideoCallSession {
  id: string;
  callerId: string;
  receiverId: string;
  callerName: string;
  receiverName: string;
  callerAvatar: string;
  receiverAvatar: string;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
}

// ──────────────── Document Chamber Types ────────────────

export type DocumentStatus = 'draft' | 'in_review' | 'signed' | 'rejected';
export type DocumentChamberType = 'contract' | 'nda' | 'term_sheet' | 'pitch_deck' | 'financial' | 'other';

export interface SignatureEntry {
  signerId: string;
  signerName: string;
  signerRole: string;
  signedAt: string;
  signatureDataUrl: string;
}

export interface ChamberDocument {
  id: string;
  name: string;
  type: DocumentChamberType;
  status: DocumentStatus;
  size: string;
  uploadedBy: string;
  uploaderName: string;
  createdAt: string;
  updatedAt: string;
  sharedWith: string[];
  signatures: SignatureEntry[];
  previewUrl?: string;
  description?: string;
  tags: string[];
}
