import { FileItem } from './types';

const API_BASE = '/api';
const STORAGE_VERSION = 1;

type StoredFileRecord = {
  id: string;
  name: string;
  size: string;
  date: string;
  uploadedAt: string;
  type: 'pdf';
  tags: string[];
  isSigned?: boolean;
  isStarred?: boolean;
  isRead: boolean;
  color: string;
  storagePath: string;
};

type StoredState = {
  version: number;
  updatedAt: string;
  availableTags: string[];
  files: StoredFileRecord[];
};

type PdfUploadResponse = {
  storagePath: string;
  fileUrl: string;
};

export const savePdfFile = async (id: string, file: File, folder = 'pdfs') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('id', id);
  formData.append('folder', folder);
  const response = await fetch(`${API_BASE}/pdfs`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to save PDF');
  }
  const data = (await response.json()) as PdfUploadResponse;
  return data;
};

export const deletePdfFile = async (storagePath: string) => {
  await fetch(`${API_BASE}/pdfs/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storagePath }),
  });
};

export const saveAppState = async (files: FileItem[], availableTags: string[]) => {
  const storedFiles: StoredFileRecord[] = files.map((file) => ({
    id: file.id,
    name: file.name,
    size: file.size,
    date: file.date.toISOString(),
    uploadedAt: file.uploadedAt.toISOString(),
    type: file.type,
    tags: file.tags,
    isSigned: file.isSigned,
    isStarred: file.isStarred,
    isRead: file.isRead,
    color: file.color,
    storagePath: file.storagePath ?? `data/pdfs/${file.id}.pdf`,
  }));
  const payload: StoredState = {
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    availableTags,
    files: storedFiles,
  };
  await fetch(`${API_BASE}/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const loadAppState = async (): Promise<{
  files: FileItem[];
  availableTags: string[];
} | null> => {
  const response = await fetch(`${API_BASE}/state`);
  if (!response.ok) return null;
  const stored = (await response.json()) as StoredState;
  const files: FileItem[] = (stored.files ?? []).map((record) => ({
    id: record.id,
    name: record.name,
    size: record.size,
    date: new Date(record.date),
    uploadedAt: new Date(record.uploadedAt),
    type: record.type,
    tags: record.tags,
    isSigned: record.isSigned,
    isStarred: record.isStarred,
    isRead: record.isRead,
    color: record.color,
    fileUrl: `/${record.storagePath}`,
    storagePath: record.storagePath,
  }));
  return {
    files,
    availableTags: stored.availableTags ?? [],
  };
};
