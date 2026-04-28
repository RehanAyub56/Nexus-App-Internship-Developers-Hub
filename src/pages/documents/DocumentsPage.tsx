import React, { useState, useCallback, useRef } from 'react';
import {
  FileText, Upload, Search, Grid, List, Plus,
  CheckCircle, Clock, Edit3, XCircle, MoreVertical,
  Trash2, Share2, Download, Eye, Pen, Shield, TrendingUp,
  Briefcase, BookOpen, File, X, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChamberDocument } from '../../types/videocall';
import { getDocumentsForUser, addDocument, deleteDocument } from '../../data/documentChamber';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | ChamberDocument['status'];

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: <Edit3 size={13} />, badge: 'bg-gray-100 text-gray-600 border-gray-200' },
  in_review: { label: 'In Review', icon: <Clock size={13} />, badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  signed: { label: 'Signed', icon: <CheckCircle size={13} />, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', icon: <XCircle size={13} />, badge: 'bg-red-50 text-red-600 border-red-200' },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  contract: <Briefcase size={18} />, nda: <Shield size={18} />, term_sheet: <TrendingUp size={18} />,
  pitch_deck: <BookOpen size={18} />, financial: <FileText size={18} />, other: <File size={18} />,
};

const TYPE_COLORS: Record<string, string> = {
  contract: 'bg-purple-50 text-purple-600', nda: 'bg-blue-50 text-blue-600',
  term_sheet: 'bg-emerald-50 text-emerald-600', pitch_deck: 'bg-orange-50 text-orange-600',
  financial: 'bg-primary-50 text-primary-600', other: 'bg-gray-50 text-gray-600',
};

const TYPE_LABELS: Record<string, string> = {
  contract: 'Contract', nda: 'NDA', term_sheet: 'Term Sheet',
  pitch_deck: 'Pitch Deck', financial: 'Financial', other: 'Other',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<ChamberDocument | null>(null);
  const [tick, setTick] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<ChamberDocument['type']>('other');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  if (!user) return null;

  const allDocs = getDocumentsForUser(user.id);

  const filtered = allDocs.filter(doc => {
    const matchStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchSearch = !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const stats = {
    total: allDocs.length,
    draft: allDocs.filter(d => d.status === 'draft').length,
    in_review: allDocs.filter(d => d.status === 'in_review').length,
    signed: allDocs.filter(d => d.status === 'signed').length,
  };

  const handleFileDrop = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const newDoc: ChamberDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: uploadType,
        status: 'draft',
        size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
        uploadedBy: user.id,
        uploaderName: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sharedWith: [user.id],
        signatures: [],
        description: '',
        tags: [uploadType],
      };
      addDocument(newDoc);
    });
    refresh();
    setShowUpload(false);
    setIsDragging(false);
    toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded!`);
  };

  const handleDelete = (docId: string) => {
    deleteDocument(docId);
    refresh();
    setOpenMenuId(null);
    toast.success('Document deleted.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            Document Chamber
          </h1>
          <p className="text-gray-500 text-sm mt-1">Secure deal documents, contracts &amp; e-signatures</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-2xl transition-colors shadow-sm"
        >
          <Plus size={18} /> Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, filter: 'all' as FilterStatus, dotColor: 'bg-gray-400', cardColor: 'bg-gray-50 border-gray-200', textColor: 'text-gray-700' },
          { label: 'Draft', value: stats.draft, filter: 'draft' as FilterStatus, dotColor: 'bg-gray-400', cardColor: 'bg-gray-50 border-gray-200', textColor: 'text-gray-600' },
          { label: 'In Review', value: stats.in_review, filter: 'in_review' as FilterStatus, dotColor: 'bg-amber-400', cardColor: 'bg-amber-50 border-amber-100', textColor: 'text-amber-700' },
          { label: 'Signed', value: stats.signed, filter: 'signed' as FilterStatus, dotColor: 'bg-emerald-500', cardColor: 'bg-emerald-50 border-emerald-100', textColor: 'text-emerald-700' },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setFilterStatus(s.filter)}
            className={`relative p-4 rounded-2xl border ${s.cardColor} text-left transition-all hover:shadow-sm hover:-translate-y-0.5 ${filterStatus === s.filter ? 'ring-2 ring-primary-300' : ''}`}
          >
            <div className={`w-2 h-2 rounded-full ${s.dotColor} mb-3`} />
            <p className={`text-2xl font-bold ${s.textColor}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search documents, tags…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as FilterStatus)}
            className="appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="signed">Signed</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}><Grid size={16} /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}><List size={16} /></button>
        </div>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 transition-colors text-center ${isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); handleFileDrop(e.dataTransfer.files); }}
        >
          <button onClick={() => setShowUpload(false)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-200 text-gray-400"><X size={16} /></button>
          <Upload size={32} className={`mx-auto mb-3 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
          <p className="text-gray-700 font-medium mb-1">Drag &amp; drop files here</p>
          <p className="text-gray-400 text-sm mb-4">Supports PDF, DOC, DOCX, XLS, XLSX</p>
          <div className="flex justify-center gap-2 flex-wrap mb-4">
            {(Object.keys(TYPE_LABELS) as ChamberDocument['type'][]).map(t => (
              <button
                key={t}
                onClick={() => setUploadType(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${uploadType === t ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}
              >
                <span className={`w-4 h-4 flex items-center justify-center ${TYPE_COLORS[t]} rounded`}>{TYPE_ICONS[t]}</span>
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">Browse Files</button>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={e => handleFileDrop(e.target.files)} />
        </div>
      )}

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText size={48} className="mb-4 opacity-20" />
          <p className="font-medium text-gray-600">No documents found</p>
          <p className="text-sm mt-1">{searchQuery ? 'Try a different search' : 'Upload your first document'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <DocCard key={doc.id} doc={doc} userId={user.id} onPreview={() => setPreviewDoc(doc)} onDelete={() => handleDelete(doc.id)} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map(doc => (
              <DocRow key={doc.id} doc={doc} userId={user.id} onPreview={() => setPreviewDoc(doc)} onDelete={() => handleDelete(doc.id)} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => { setPreviewDoc(null); refresh(); }}
          onUpdate={() => {
            refresh();
            const updated = getDocumentsForUser(user.id).find(d => d.id === previewDoc.id);
            if (updated) setPreviewDoc({ ...updated });
          }}
        />
      )}
    </div>
  );
};

// ── Card ──
interface DocActionsProps {
  doc: ChamberDocument; userId: string; onPreview: () => void; onDelete: () => void;
  openMenuId: string | null; setOpenMenuId: (id: string | null) => void;
}

const DocCard: React.FC<DocActionsProps> = ({ doc, userId, onPreview, onDelete, openMenuId, setOpenMenuId }) => {
  const cfg = STATUS_CONFIG[doc.status];
  const needsSig = doc.status !== 'signed' && doc.status !== 'rejected' && !doc.signatures.some(s => s.signerId === userId);
  const stripeColor = doc.status === 'signed' ? 'bg-emerald-400' : doc.status === 'in_review' ? 'bg-amber-400' : doc.status === 'rejected' ? 'bg-red-400' : 'bg-gray-300';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden">
      <div className={`h-1.5 ${stripeColor}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${TYPE_COLORS[doc.type]}`}>{TYPE_ICONS[doc.type]}</div>
          <div className="relative">
            <button onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><MoreVertical size={16} /></button>
            {openMenuId === doc.id && (
              <div className="absolute right-0 top-8 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                <button onClick={onPreview} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye size={14} /> Preview</button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Download size={14} /> Download</button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Share2 size={14} /> Share</button>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"><Trash2 size={14} /> Delete</button>
              </div>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">{doc.name}</h3>
        <p className="text-xs text-gray-400 mb-3">{TYPE_LABELS[doc.type]} · {doc.size}</p>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.badge}`}>{cfg.icon} {cfg.label}</span>
          {needsSig && <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full border border-primary-200"><Pen size={10} /> Sign required</span>}
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full" style={{ width: `${(doc.signatures.length / Math.max(doc.sharedWith.length, 1)) * 100}%` }} />
          </div>
          <span className="text-xs text-gray-400 shrink-0">{doc.signatures.length}/{doc.sharedWith.length} signed</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">Updated {fmtDate(doc.updatedAt)}</p>
        <button onClick={onPreview} className="w-full py-2 text-sm font-medium bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-700 rounded-xl transition-colors border border-gray-200 hover:border-primary-200 flex items-center justify-center gap-2">
          <Eye size={14} />{needsSig ? 'Review & Sign' : 'Open Document'}
        </button>
      </div>
    </div>
  );
};

// ── Row ──
const DocRow: React.FC<DocActionsProps> = ({ doc, userId, onPreview, onDelete, openMenuId, setOpenMenuId }) => {
  const cfg = STATUS_CONFIG[doc.status];
  const needsSig = doc.status !== 'signed' && doc.status !== 'rejected' && !doc.signatures.some(s => s.signerId === userId);
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[doc.type]}`}>{TYPE_ICONS[doc.type]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
          {needsSig && <span className="text-xs text-primary-600 font-medium shrink-0">· Sign required</span>}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{TYPE_LABELS[doc.type]} · {doc.size} · {fmtDate(doc.updatedAt)}</p>
      </div>
      <span className={`hidden md:inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border shrink-0 ${cfg.badge}`}>{cfg.icon} {cfg.label}</span>
      <span className="hidden lg:block text-xs text-gray-400 shrink-0">{doc.signatures.length}/{doc.sharedWith.length}</span>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onPreview} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors"><Eye size={16} /></button>
        <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><Download size={16} /></button>
        <div className="relative">
          <button onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><MoreVertical size={16} /></button>
          {openMenuId === doc.id && (
            <div className="absolute right-0 top-9 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Share2 size={13} /> Share</button>
              <button onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"><Trash2 size={13} /> Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
