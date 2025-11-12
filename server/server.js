import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PRODUCT_UPLOADS_DIR = path.join(UPLOADS_DIR, 'products');
fs.mkdirSync(PRODUCT_UPLOADS_DIR, { recursive: true });

// Static serving for uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// CORS for Vite dev and preview
app.use(cors({
  origin: [
    'http://localhost:5173', // default Vite
    'http://localhost:5174', // current dev server
    'http://localhost:4173', // preview
  ],
  credentials: true,
}));

app.use(express.json());

// LowDB for persistence (JSON file)
const DB_FILE = path.join(__dirname, 'server', 'data', 'products.json');
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter, { products: [] });
await db.read();
if (!db.data) db.data = { products: [] };

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRODUCT_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  },
});
const fileFilter = (req, file, cb) => {
  const ok = /^image\/(jpe?g|png|webp|gif)$/i.test(file.mimetype);
  cb(null, ok);
};
const uploadProductImage = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single('image');

// Helpers
function nextId() {
  const arr = db.data.products || [];
  const max = arr.reduce((m, p) => Math.max(m, Number(p.id || 0)), 0);
  return max + 1;
}

// Create product (multipart/form-data)
app.post('/api/products', (req, res) => {
  uploadProductImage(req, res, async (err) => {
    try {
      if (err) {
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'Imagen demasiado grande (máx 5MB)' : 'Error subiendo imagen';
        return res.status(400).json({ message });
      }
      if (!req.file) return res.status(400).json({ message: 'Falta imagen' });

      const { name, price, category, categoriaId, nombre, precio } = req.body;
      const finalName = (name || nombre || '').trim();
      const finalPrice = Number(price ?? precio ?? 0);
      const finalCategory = (category || categoriaId || '').toString().trim();

      if (!finalName || !finalPrice) {
        return res.status(400).json({ message: 'Datos inválidos: nombre y precio son requeridos' });
      }

      const imagePath = `/uploads/products/${req.file.filename}`;
      const product = {
        id: nextId(),
        name: finalName,
        price: finalPrice,
        category: finalCategory || null,
        imagePath,
        createdAt: Date.now(),
      };

      db.data.products.push(product);
      await db.write();

      const base = `${req.protocol}://${req.get('host')}`;
      return res.status(201).json({ ...product, imageUrl: `${base}${imagePath}` });
    } catch (e) {
      console.error('Error creando producto', e);
      return res.status(500).json({ message: 'Error creando producto' });
    }
  });
});

// List products with absolute imageUrl
app.get('/api/products', async (req, res) => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const rows = (db.data.products || []).map((p) => ({
      ...p,
      imageUrl: p.imagePath ? `${base}${p.imagePath}` : null,
    }));
    return res.json(rows);
  } catch (e) {
    console.error('Error listing products', e);
    return res.status(500).json({ message: 'Error listando productos' });
  }
});

// Optional: delete product (and image file)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const idx = (db.data.products || []).findIndex((p) => Number(p.id) === id);
    if (idx === -1) return res.status(404).json({ message: 'Producto no encontrado' });
    const [removed] = db.data.products.splice(idx, 1);
    await db.write();

    if (removed?.imagePath) {
      const fileFull = path.join(__dirname, removed.imagePath.replace(/^\//, ''));
      fs.unlink(fileFull, (err) => { if (err) console.warn('No se pudo borrar imagen:', err?.message); });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error('Error eliminando producto', e);
    return res.status(500).json({ message: 'Error eliminando producto' });
  }
});

app.listen(PORT, () => {
  console.log(`Products API running on http://localhost:${PORT}`);
});