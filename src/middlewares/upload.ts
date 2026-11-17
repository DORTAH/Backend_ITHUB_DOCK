import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { extname } from 'node:path';

export const upload = multer({
  storage: multer.diskStorage({
    destination: tmpdir(),
    filename: (_req, _file, cb) => cb(null, `${randomUUID()}.xlsx`),
  }),
  fileFilter: (_req, file, cb) => {
    const ok = extname(file.originalname).toLowerCase() === '.xlsx';
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только файлы .xlsx'));
    }
  },
});
