import type { Request, Response } from 'express';
import { importExcel } from './import.service';

export async function importExcelHandler(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  const result = await importExcel(req.file.buffer, req.file.originalname);
  res.json(result);
}