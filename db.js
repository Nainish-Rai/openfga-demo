import fs from 'fs/promises';
import path from 'path';

const dataPath = path.resolve('data/files.json');

/**
 *
 * @returns {Promise<{ id: string; filename: string }[]>} records
 */
export async function getAllFileRecords() {
  const records = await fs.readFile(dataPath, 'utf-8');
  return records ? JSON.parse(records) : [];
}

/**
 *
 * @param {string} id
 * @returns {Promise<{ id: string; filename: string } | undefined>}
 */
export async function getFileRecordById(id) {
  const existingRecords = await getAllFileRecords();
  return existingRecords.find((e) => e.id === id);
}

/**
 *
 * @param {{ id: string; filename: string }} payload
 */
export async function createFileRecord(payload) {
  const { id, filename } = payload;
  const existingRecords = await getAllFileRecords();
  existingRecords.push({ id, filename });
  await fs.writeFile(dataPath, JSON.stringify(existingRecords), 'utf-8');
}
