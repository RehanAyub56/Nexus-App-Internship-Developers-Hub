import { ChamberDocument, SignatureEntry } from '../types/videocall';

export let chamberDocuments: ChamberDocument[] = [
  {
    id: 'doc-1',
    name: 'Series A Term Sheet - TechWave AI.pdf',
    type: 'term_sheet',
    status: 'in_review',
    size: '1.2 MB',
    uploadedBy: 'i1',
    uploaderName: 'James Wilson',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    sharedWith: ['e1', 'i1'],
    signatures: [
      {
        signerId: 'i1',
        signerName: 'James Wilson',
        signerRole: 'Investor',
        signedAt: new Date(Date.now() - 86400000).toISOString(),
        signatureDataUrl: '',
      },
    ],
    description: 'Series A investment term sheet outlining the $1.5M round for TechWave AI.',
    tags: ['investment', 'series-a', 'term-sheet'],
  },
  {
    id: 'doc-2',
    name: 'Non-Disclosure Agreement.pdf',
    type: 'nda',
    status: 'signed',
    size: '480 KB',
    uploadedBy: 'e1',
    uploaderName: 'Sarah Johnson',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    sharedWith: ['e1', 'i1', 'i2'],
    signatures: [
      {
        signerId: 'e1',
        signerName: 'Sarah Johnson',
        signerRole: 'Entrepreneur',
        signedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        signatureDataUrl: '',
      },
      {
        signerId: 'i1',
        signerName: 'James Wilson',
        signerRole: 'Investor',
        signedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        signatureDataUrl: '',
      },
    ],
    description: 'Mutual NDA for sharing sensitive business information.',
    tags: ['nda', 'confidentiality'],
  },
  {
    id: 'doc-3',
    name: 'TechWave AI Pitch Deck 2024.pdf',
    type: 'pitch_deck',
    status: 'draft',
    size: '4.8 MB',
    uploadedBy: 'e1',
    uploaderName: 'Sarah Johnson',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    sharedWith: ['e1'],
    signatures: [],
    description: 'Latest pitch deck for investor presentations.',
    tags: ['pitch', '2024'],
  },
  {
    id: 'doc-4',
    name: 'Financial Projections 2024-2026.pdf',
    type: 'financial',
    status: 'in_review',
    size: '2.1 MB',
    uploadedBy: 'e1',
    uploaderName: 'Sarah Johnson',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    sharedWith: ['e1', 'i1'],
    signatures: [],
    description: 'Three-year financial model with revenue projections and burn rate.',
    tags: ['financials', 'projections'],
  },
  {
    id: 'doc-5',
    name: 'Investment Partnership Agreement.pdf',
    type: 'contract',
    status: 'draft',
    size: '3.4 MB',
    uploadedBy: 'i2',
    uploaderName: 'Emily Rodriguez',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    sharedWith: ['e1', 'i2'],
    signatures: [],
    description: 'Full investment partnership agreement for the seed round.',
    tags: ['contract', 'partnership'],
  },
];

// ──────────── CRUD ────────────

export const getDocumentsForUser = (userId: string): ChamberDocument[] =>
  chamberDocuments.filter(
    (d) => d.uploadedBy === userId || d.sharedWith.includes(userId)
  );

export const addDocument = (doc: ChamberDocument): void => {
  chamberDocuments = [doc, ...chamberDocuments];
};

export const updateDocumentStatus = (
  docId: string,
  status: ChamberDocument['status']
): void => {
  chamberDocuments = chamberDocuments.map((d) =>
    d.id === docId ? { ...d, status, updatedAt: new Date().toISOString() } : d
  );
};

export const addSignature = (docId: string, signature: SignatureEntry): void => {
  chamberDocuments = chamberDocuments.map((d) => {
    if (d.id !== docId) return d;
    const sigs = d.signatures.filter((s) => s.signerId !== signature.signerId);
    const newStatus: ChamberDocument['status'] =
      sigs.length + 1 >= d.sharedWith.length ? 'signed' : 'in_review';
    return {
      ...d,
      signatures: [...sigs, signature],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
  });
};

export const deleteDocument = (docId: string): void => {
  chamberDocuments = chamberDocuments.filter((d) => d.id !== docId);
};
