import { Router } from 'express';
import { exportDisciplineRegisterHandler, getExportOptionsHandler } from './export.controller.js';

export const exportRouter = Router();

exportRouter.get('/options', (req, res, next) => {
  getExportOptionsHandler(req, res).catch(next);
});

exportRouter.post('/discipline-register', (req, res, next) => {
  exportDisciplineRegisterHandler(req, res).catch(next);
});
