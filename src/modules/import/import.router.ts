import { Router } from 'express';
import { upload } from '../../middlewares/upload.js';
import { importExcelHandler } from './import.controller.js';
import { importStudyPlan, parseStudyPlan } from './study-plan.service.js';

export const importRouter = Router();
importRouter.post('/excel', upload.single('file'), (req, res, next) => {
  importExcelHandler(req, res).catch(next);
});

importRouter.post('/study-plan', async (req, res, next) => {
  try {
    res.json(await importStudyPlan(parseStudyPlan(req.body)));
  } catch (error) {
    next(error);
  }
});
