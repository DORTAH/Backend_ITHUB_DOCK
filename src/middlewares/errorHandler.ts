import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { ImportValidationError } from '../modules/import/parsers/excel.parser.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof ImportValidationError || (err instanceof Error && err.message === 'Разрешены только файлы .xlsx')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal error' });
};
