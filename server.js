import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const app = express();
const upload = multer({ dest: 'data/tmp' });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DEFAULT_DB = {
  version: 1,
  updatedAt: '',
  availableTags: [],
  files: [],
};

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const readDb = async () => {
  const dbPath = path.join(DATA_DIR, 'db.sqlite.json');
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    await ensureDir(DATA_DIR);
    await fs.writeFile(dbPath, JSON.stringify(DEFAULT_DB, null, 2));
    return DEFAULT_DB;
  }
};

const writeDb = async (payload) => {
  const dbPath = path.join(DATA_DIR, 'db.sqlite.json');
  await ensureDir(DATA_DIR);
  await fs.writeFile(dbPath, JSON.stringify(payload, null, 2));
};

app.use(express.json());
app.use('/data', express.static(DATA_DIR));

void ensureDir(path.join(DATA_DIR, 'tmp'));

app.get('/api/state', async (_req, res) => {
  try {
    const data = await readDb();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read state' });
  }
});

app.post('/api/state', async (req, res) => {
  await writeDb(req.body);
  res.json({ ok: true });
});

app.post('/api/pdfs', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Missing file' });
    return;
  }
  const folder = req.body?.folder || 'pdfs';
  const id = req.body?.id || path.parse(req.file.originalname).name;
  const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '');
  const targetDir = path.join(DATA_DIR, safeFolder);
  await ensureDir(targetDir);
  const fileName = `${id}.pdf`;
  const targetPath = path.join(targetDir, fileName);
  await fs.rename(req.file.path, targetPath);
  const storagePath = path.join('data', safeFolder, fileName).replace(/\\/g, '/');
  res.json({
    storagePath,
    fileUrl: `/${storagePath}`,
  });
});

app.post('/api/pdfs/delete', async (req, res) => {
  const { storagePath } = req.body ?? {};
  if (!storagePath) {
    res.status(400).json({ error: 'Missing storagePath' });
    return;
  }
  const fullPath = path.join(__dirname, storagePath);
  try {
    await fs.unlink(fullPath);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  res.json({ ok: true });
});

const PORT = process.env.PORT || 9002;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
