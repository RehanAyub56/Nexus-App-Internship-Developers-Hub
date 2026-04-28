import React, { useState } from 'react';
import {
  X, FileText, Download, Share2, CheckCircle, Clock, Edit3,
  XCircle, Users, Calendar, Tag, ChevronRight, Pen
} from 'lucide-react';
import { ChamberDocument, SignatureEntry } from '../../types/videocall';
import { SignaturePad } from './SignaturePad';
import { addSignature, updateDocumentStatus } from '../../data/documentChamber';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface DocumentPreviewModalProps {
  doc: ChamberDocument;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: <Edit3 size={14} />, color: 'bg-gray-100 text-gray-600 border-gray-200' },
  in_review: { label: 'In Review', icon: <Clock size={14} />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  signed: { label: 'Fully Signed', icon: <CheckCircle size={14} />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', icon: <XCircle size={14} />, color: 'bg-red-50 text-red-600 border-red-200' },
};

const TYPE_LABELS: Record<string, string> = {
  contract: 'Contract', nda: 'NDA', term_sheet: 'Term Sheet',
  pitch_deck: 'Pitch Deck', financial: 'Financial', other: 'Other',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// Simulated PDF pages
const PDF_PAGES = [
  {
    title: 'INVESTMENT AGREEMENT',
    content: 'This Investment Agreement ("Agreement") is entered into as of the date signed below, by and between the parties identified herein.\n\n1. INVESTMENT TERMS\nThe Investor agrees to provide funding as outlined in Schedule A attached hereto and incorporated herein by reference.\n\n2. REPRESENTATIONS AND WARRANTIES\nEach party represents and warrants that they have full authority to enter into this Agreement.',
  },
  {
    title: 'TERMS AND CONDITIONS',
    content: '3. USE OF FUNDS\nThe Company shall use the investment proceeds solely for the purposes described in the Business Plan, a copy of which has been provided to the Investor.\n\n4. CONFIDENTIALITY\nEach party agrees to maintain in strict confidence all Confidential Information received from the other party.',
  },
];

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ doc, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'signatures' | 'details'>('preview');

  if (!user) return null;

  const userAlreadySigned = doc.signatures.some(s => s.signerId === user.id);
  const cfg = STATUS_CONFIG[doc.status];

  const handleSign = (dataUrl: string) => {
    const sig: SignatureEntry = {
      signerId: user.id,
      signerName: user.name,
      signerRole: user.role,
      signedAt: new Date().toISOString(),
      signatureDataUrl: dataUrl,
    };
    addSignature(doc.id, sig);
    setShowSignaturePad(false);
    onUpdate();
    toast.success('Document signed successfully!');
  };

  const handleStatusChange = (status: ChamberDocument['status']) => {
    updateDocumentStatus(doc.id, status);
    onUpdate();
    toast.success(`Status updated to ${STATUS_CONFIG[status].label}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={20} className="text-primary-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900 truncate">{doc.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </span>
                <span className="text-xs text-gray-400">{TYPE_LABELS[doc.type]}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" title="Download">
              <Download size={18} />
            </button>
            <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" title="Share">
              <Share2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
          {(['preview', 'signatures', 'details'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-all ${
                activeTab === tab ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'signatures' && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  doc.signatures.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {doc.signatures.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'preview' && (
            <div className="p-6 space-y-4">
              {/* Simulated PDF */}
              {PDF_PAGES.map((page, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Page {i + 1} of {PDF_PAGES.length}</span>
                    <span className="text-xs text-gray-400">{doc.name}</span>
                  </div>
                  <div className="p-8 min-h-64">
                    <h3 className="text-lg font-bold text-gray-800 text-center mb-6 tracking-wide">{page.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{page.content}</p>
                  </div>
                </div>
              ))}

              {/* Signature area preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Signature Block</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {doc.sharedWith.map((uid, i) => {
                    const sig = doc.signatures.find(s => s.signerId === uid);
                    return (
                      <div key={i} className="space-y-2">
                        <div className="h-16 border-b-2 border-gray-300 flex items-end pb-2">
                          {sig?.signatureDataUrl ? (
                            <img src={sig.signatureDataUrl} alt="signature" className="h-12 object-contain" />
                          ) : (
                            <span className="text-gray-300 text-xs italic">Awaiting signature</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {sig ? `${sig.signerName} · ${fmtDate(sig.signedAt)}` : `Party ${i + 1}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'signatures' && (
            <div className="p-6 space-y-4">
              {doc.signatures.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Pen size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No signatures yet</p>
                  <p className="text-sm mt-1">Be the first to sign this document</p>
                </div>
              ) : (
                doc.signatures.map((sig, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle size={20} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{sig.signerName}</p>
                      <p className="text-xs text-gray-500 capitalize">{sig.signerRole} · Signed {fmtDate(sig.signedAt)}</p>
                    </div>
                    {sig.signatureDataUrl && (
                      <img src={sig.signatureDataUrl} alt="sig" className="h-8 object-contain opacity-80" />
                    )}
                  </div>
                ))
              )}

              {/* Progress */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Signing progress</span>
                  <span className="text-primary-600 font-semibold">{doc.signatures.length} / {doc.sharedWith.length}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(doc.signatures.length / Math.max(doc.sharedWith.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Type', value: TYPE_LABELS[doc.type], icon: <FileText size={15} /> },
                  { label: 'Size', value: doc.size, icon: <ChevronRight size={15} /> },
                  { label: 'Uploaded by', value: doc.uploaderName, icon: <Users size={15} /> },
                  { label: 'Created', value: fmtDate(doc.createdAt), icon: <Calendar size={15} /> },
                  { label: 'Last updated', value: fmtDate(doc.updatedAt), icon: <Clock size={15} /> },
                  { label: 'Shared with', value: `${doc.sharedWith.length} parties`, icon: <Share2 size={15} /> },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                      {item.icon} {item.label}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>

              {doc.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{doc.description}</p>
                </div>
              )}

              {doc.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-gray-400" />
                  {doc.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Change status */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Change Status</p>
                <div className="flex gap-2 flex-wrap">
                  {(['draft', 'in_review', 'signed', 'rejected'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={doc.status === s}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        doc.status === s
                          ? STATUS_CONFIG[s].color + ' opacity-60 cursor-default'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!userAlreadySigned && doc.status !== 'rejected' && doc.status !== 'signed' && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-primary-50 to-secondary-50 shrink-0">
            {showSignaturePad ? (
              <SignaturePad
                signerName={user.name}
                onSave={handleSign}
                onCancel={() => setShowSignaturePad(false)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Your signature is required</p>
                  <p className="text-xs text-gray-500 mt-0.5">This document is awaiting your signature</p>
                </div>
                <button
                  onClick={() => { setShowSignaturePad(true); setActiveTab('preview'); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-2xl transition-colors shadow-lg shadow-primary-200"
                >
                  <Pen size={16} />
                  Sign Now
                </button>
              </div>
            )}
          </div>
        )}

        {userAlreadySigned && (
          <div className="px-6 py-3 border-t border-gray-100 bg-emerald-50 shrink-0 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600" />
            <span className="text-sm text-emerald-700 font-medium">You have signed this document</span>
          </div>
        )}
      </div>
    </div>
  );
};
