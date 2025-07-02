import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './middlewares/auth.js';
import {
  createFileRecord,
  getAllFileRecords,
  getFileRecordById,
} from './db.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use(express.static(path.resolve('./public')));
app.use(authMiddleware);

app.get('/files', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Please login' });

  const files = await getAllFileRecords();

  return res.status(200).json({ files });
});

app.post('/share-file', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Please login' });

  const { id, username } = req.body;

  return res
    .status(400)
    .json({ error: 'Sorry! We do not have this feature yet' });
});

app.post('/create-file', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Please login' });

  const { id, filename } = req.body;

  const existingFile = await getFileRecordById(id);

  if (existingFile) {
    return res
      .status(400)
      .json({ error: `file with id ${id} already exists!` });
  }

  await createFileRecord({ id, filename });

  return res.status(201).json({ message: 'File created success!' });
});

app.post('/signup', (req, res) => {
  const { username, email } = req.body;

  const token = jwt.sign({ username, email }, 'mysupersecret');

  return res.json({ username, token });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT :${PORT}`);
});
