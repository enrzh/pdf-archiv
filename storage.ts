import { FileItem } from './types';

const DATA_DIR = 'data';
const PDF_DIR = 'pdfs';
const DB_FILE = 'db.sqlite.json';
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

const supportsFileSystem = () =>
  typeof navigator !== 'undefined' &&
  'storage' in navigator &&
  typeof navigator.storage.getDirectory === 'function';

const getDataDir = async () => {
  const root = await navigator.storage.getDirectory();
  const dataDir = await root.getDirectoryHandle(DATA_DIR, { create: true });
  await dataDir.getDirectoryHandle(PDF_DIR, { create: true });
  return dataDir;
};

const writeJsonFile = async (data: StoredState) => {
  const dataDir = await getDataDir();
  const handle = await dataDir.getFileHandle(DB_FILE, { create: true });
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(data, null, 2));
  await writable.close();
};

const readJsonFile = async (): Promise<StoredState | null> => {
  const dataDir = await getDataDir();
  try {
    const handle = await dataDir.getFileHandle(DB_FILE, { create: false });
    const file = await handle.getFile();
    const text = await file.text();
    return JSON.parse(text) as StoredState;
  } catch (error) {
    return null;
  }
};

const getPdfDir = async () => {
  const dataDir = await getDataDir();
  return dataDir.getDirectoryHandle(PDF_DIR, { create: true });
};

export const savePdfFile = async (id: string, file: File) => {
  if (!supportsFileSystem()) return `${id}.pdf`;
  const pdfDir = await getPdfDir();
  const fileName = `${id}.pdf`;
  const handle = await pdfDir.getFileHandle(fileName, { create: true });
  const writable = await handle.createWritable();
  await writable.write(file);
  await writable.close();
  return fileName;
};

export const deletePdfFile = async (storagePath: string) => {
  if (!supportsFileSystem()) return;
  const pdfDir = await getPdfDir();
  try {
    await pdfDir.removeEntry(storagePath);
  } catch (error) {
    return;
  }
};

export const saveAppState = async (files: FileItem[], availableTags: string[]) => {
  if (!supportsFileSystem()) return;
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
    storagePath: file.storagePath ?? `${file.id}.pdf`,
  }));
  const payload: StoredState = {
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    availableTags,
    files: storedFiles,
  };
  await writeJsonFile(payload);
};

export const loadAppState = async (): Promise<{
  files: FileItem[];
  availableTags: string[];
} | null> => {
  if (!supportsFileSystem()) return null;
  const stored = await readJsonFile();
  if (!stored) return null;
  const pdfDir = await getPdfDir();
  const files: FileItem[] = [];
  for (const record of stored.files ?? []) {
    try {
      const fileHandle = await pdfDir.getFileHandle(record.storagePath, { create: false });
      const fileBlob = await fileHandle.getFile();
      const fileUrl = URL.createObjectURL(fileBlob);
      files.push({
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
        fileUrl,
        storagePath: record.storagePath,
      });
    } catch (error) {
      continue;
    }
  }
  return {
    files,
    availableTags: stored.availableTags ?? [],
  };
};
