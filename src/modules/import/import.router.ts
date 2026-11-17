import { Router } from 'express';
import { upload } from '../../middlewares/upload';
import { importExcelHandler } from './import.controller';

export const importRouter = Router();
importRouter.post('/excel', upload.single('file'), importExcelHandler);