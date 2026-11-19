import ExcelJS from 'exceljs';
import { readDocumentData, type DocumentSelection } from './document-data.js';
import { clearYellowFill, ExportValidationError, readExportTemplate, safeFilenamePart } from './export.service.js';
import { spreadsheetRenderers } from './spreadsheet-documents.js';
import { renderWord, wordTemplates } from './word-documents.js';

const excelFiles = {
  'summary-register': 'Сводная зачетно-экзаменационная ведомость.xlsx',
  'module-register': 'Ведомость по ПМ.xlsx',
  'project-register': 'Ведомость защиты курсовых проектов.xlsx',
  'lesson-journal': 'Журнал занятий.xlsx',
  'lesson-schedule': 'Расписание занятий.xlsx',
} satisfies Record<keyof typeof spreadsheetRenderers, string>;

const wordFiles = {
  'practice-calendar': 'График ПП на учебный год.docx',
  'practice-contract': 'Договор на производственную практику.docx',
  'module-admission': 'Допуск к экзамену по ПМ.docx',
  'project-order': 'Приказ о закреплении тем и защ.курсовых.docx',
  'commission-order': 'Приказ Об утверждении состава экзаменационной комиссии для проведения экзамена по модулю.docx',
  'department-minutes': 'Протокол заседания кафедры.docx',
  'project-schedule': 'Расписание защит курсовых проектов.docx',
  'assessment-schedule': 'Расписание промежуточной аттестации.docx',
  'module-summary': 'Сводная ведомость экзамена по ПМ.docx',
  'practice-assessment': 'Шаблон Аттестационный лист.docx',
  'library-access': 'Шаблон Ведомости выдачи доступа к ЭБС.docx',
  'practice-diary': 'Шаблон Дневник по произв.практике.docx',
  'course-project': 'Шаблон Курсовой Проект.docx',
  'practice-report': 'Шаблон отчет по учебной и производственной практике.docx',
  'practice-order': 'Шаблон Приказ о направлении на произв.практику.docx',
} satisfies Record<keyof typeof wordTemplates, string>;

const personalDocuments = new Set(['course-project', 'practice-report', 'practice-assessment', 'practice-diary']);
const commissionDocuments = new Set(['module-register', 'module-admission', 'module-summary', 'commission-order']);

export const documentOptions = Object.entries({ ...excelFiles, ...wordFiles }).map(([id, filename]) => ({
  id,
  filename: filename.replace(/^Шаблон /, ''),
  personal: personalDocuments.has(id),
}));

export function parseDocumentSelection(input: unknown): DocumentSelection {
  if (input == null) return {};
  if (typeof input !== 'object' || Array.isArray(input)) throw new ExportValidationError('Ожидается объект параметров');
  const selection: DocumentSelection = {};
  for (const key of ['groupId', 'semesterNumber', 'disciplineId', 'studentId'] as const) {
    const value = (input as Record<string, unknown>)[key];
    if (value == null || value === '') continue;
    const id = typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value)) ? Number(value) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) throw new ExportValidationError(`Некорректный параметр ${key}`);
    selection[key] = id;
  }
  return selection;
}

function hasKey<T extends object>(object: T, name: PropertyKey): name is keyof T {
  return Object.hasOwn(object, name);
}

export async function exportDocument(key: string, selection: DocumentSelection) {
  const option = documentOptions.find(({ id }) => id === key);
  if (!option) throw new ExportValidationError('Неизвестный шаблон документа');
  const data = await readDocumentData(selection, commissionDocuments.has(key));
  const scope = [data.groupName, data.semesterName].filter(Boolean).map((part) => safeFilenamePart(part!));
  const filename = [...scope, option.filename].join(' — ');
  if (hasKey(excelFiles, key)) {
    const workbook = new ExcelJS.Workbook();
    const template = await readExportTemplate(excelFiles[key]);
    const bytes = new ArrayBuffer(template.byteLength);
    new Uint8Array(bytes).set(template);
    await workbook.xlsx.load(bytes);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error('В шаблоне Excel отсутствует рабочий лист');
    clearYellowFill(sheet);
    spreadsheetRenderers[key](workbook, sheet, data);
    const buffer = Buffer.from(new Uint8Array(await workbook.xlsx.writeBuffer()));
    return { filename, buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
  }
  if (!hasKey(wordFiles, key)) throw new Error('Для документа отсутствует шаблон');
  const buffer = await renderWord(await readExportTemplate(wordFiles[key]), key, data);
  return { filename, buffer, contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
}
