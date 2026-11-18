import { Router } from 'express';
import { exportDisciplineRegisterHandler, getExportOptionsHandler } from './export.controller.js';
import { documentOptions, exportDocument, parseDocumentSelection } from './document-export.js';
import { readDocumentData } from './document-data.js';
import { ExportValidationError } from './export.service.js';

export const exportRouter = Router();

exportRouter.get('/options', (req, res, next) => {
  getExportOptionsHandler(req, res).catch(next);
});

exportRouter.post('/discipline-register', (req, res, next) => {
  exportDisciplineRegisterHandler(req, res).catch(next);
});

exportRouter.get('/documents', (_req, res) => {
  res.json(documentOptions);
});

exportRouter.get('/document-students', async (req, res, next) => {
  try {
    const selection = parseDocumentSelection(req.query);
    if (!selection.groupId || !selection.semesterId) {
      res.json([]);
      return;
    }
    res.json((await readDocumentData({ groupId: selection.groupId, semesterId: selection.semesterId })).students);
  } catch (error) {
    if (error instanceof ExportValidationError) res.status(400).json({ error: error.message });
    else next(error);
  }
});

exportRouter.post('/documents/:id', async (req, res, next) => {
  try {
    const result = await exportDocument(req.params.id!, parseDocumentSelection(req.body));
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(result.filename)}`);
    res.send(result.buffer);
  } catch (error) {
    if (error instanceof ExportValidationError) res.status(400).json({ error: error.message });
    else next(error);
  }
});
