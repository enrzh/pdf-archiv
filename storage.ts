import { Category, FileItem, Language } from './types';

const getApiBase = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8089/api';
  }
  return `http://${window.location.hostname}:8089/api`;
};

const getFileBase = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8089';
  }
  return `http://${window.location.hostname}:8089`;
};

const toAbsoluteFileUrl = (fileUrl: string) => {
  if (!fileUrl) return fileUrl;
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  if (fileUrl.startsWith('/')) {
    return `${getFileBase()}${fileUrl}`;
  }
  return `${getFileBase()}/${fileUrl}`;
};
const STORAGE_VERSION = 2;

type StoredCategory = {
  name: string;
  color: string;
};

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
  language?: Language;
  availableTags?: string[];
  categories?: StoredCategory[];
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
  const response = await fetch(`${getApiBase()}/pdfs`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to save PDF');
  }
  const data = (await response.json()) as PdfUploadResponse;
  return {
    ...data,
    fileUrl: toAbsoluteFileUrl(data.fileUrl),
  };
};

export const deletePdfFile = async (storagePath: string) => {
  await fetch(`${getApiBase()}/pdfs/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storagePath }),
  });
};

export const saveAppState = async (
  files: FileItem[],
  categories: Category[],
  language?: Language,
) => {
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
    language,
    categories,
    files: storedFiles,
  };
  await fetch(`${getApiBase()}/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const loadAppState = async (): Promise<{
  files: FileItem[];
  availableTags?: string[];
  categories?: Category[];
  language?: Language;
} | null> => {
  const response = await fetch(`${getApiBase()}/state`);
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
    fileUrl: toAbsoluteFileUrl(`/${record.storagePath}`),
    storagePath: record.storagePath,
  }));
  return {
    files,
    availableTags: stored.availableTags ?? [],
    categories: stored.categories ?? [],
    language: stored.language,
  };
};

export const resolvePdfFileUrl = (fileUrl: string) => toAbsoluteFileUrl(fileUrl);
