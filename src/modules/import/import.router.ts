import { Router } from 'express';
import { upload } from '../../middlewares/upload.js';
import { importExcelHandler } from './import.controller.js';

export const importRouter = Router();
importRouter.post('/excel', upload.single('file'), (req, res, next) => {
  importExcelHandler(req, res).catch(next);
});
