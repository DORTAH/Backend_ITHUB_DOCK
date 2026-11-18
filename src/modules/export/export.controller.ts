import type { Request, Response } from 'express';
import {
  ExportValidationError,
  exportDisciplineRegister,
  getExportOptions,
  type DisciplineRegisterInput,
} from './export.service.js';

export async function getExportOptionsHandler(_req: Request, res: Response) {
  res.json(await getExportOptions());
}

export async function exportDisciplineRegisterHandler(req: Request, res: Response) {
  const body = req.body as Record<string, unknown>;
  const parseId = (value: unknown): number => typeof value === 'number' ? value : Number(value);
  const optionalText = (value: unknown): string => typeof value === 'string' ? value.trim() : '';
  const input: DisciplineRegisterInput = {
    groupId: parseId(body['groupId']),
    semesterId: parseId(body['semesterId']),
    disciplineId: parseId(body['disciplineId']),
    specialty: optionalText(body['specialty']),
    qualification: optionalText(body['qualification']),
    controlForm: optionalText(body['controlForm']),
    date: optionalText(body['date']),
    teacher: optionalText(body['teacher']),
  };

  try {
    const result = await exportDisciplineRegister(input);
    const encodedName = encodeURIComponent(result.filename);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    res.send(result.buffer);
  } catch (error) {
    if (error instanceof ExportValidationError) {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
}
