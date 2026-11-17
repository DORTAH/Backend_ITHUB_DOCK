import type { Request, Response } from 'express';
import { unlink } from 'node:fs/promises';
import { importExcel } from './import.service.js';

export async function importExcelHandler(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({ error: 'Выберите файл .xlsx' });

  try {
    const result = await importExcel(req.file.path, req.file.originalname);
    res.json(result);
  } finally {
    await unlink(req.file.path).catch(() => undefined);
  }
}
