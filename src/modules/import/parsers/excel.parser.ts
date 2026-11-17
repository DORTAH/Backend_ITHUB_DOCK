import ExcelJS from 'exceljs';

export type AcademicPerformanceRow = {
  sourceRowNumber: number;
  organization: string;
  suborganization: string;
  semester: string;
  studentLastName: string;
  studentFirstName: string;
  studentPatronymic: string | null;
  studentEmail: string;
  groupName: string;
  disciplineCode: string;
  disciplineName: string;
  teachersWhoGraded: string | null;
  teachersFromWorkload: string | null;
  allDisciplineTeachers: string | null;
  maxDisciplinePoints: number;
  maxPointsByTopics: number;
  availableControlPoints: number;
  taskAndTestPoints: number;
  currentPointsFivePointScale: number;
  retakePoints: number | null;
  retakePointsNew: number | null;
  finalPoints: number;
  finalPointsFivePointScale: number;
  currentDisciplinePercent: string | null;
  currentStudentAveragePercent: string | null;
  maxAvailableControlPoints: number;
};

type ColumnDefinition = {
  header: string;
  key: Exclude<keyof AcademicPerformanceRow, 'sourceRowNumber'>;
  kind: 'text' | 'number';
  optional?: boolean;
};

const columns: readonly ColumnDefinition[] = [
  { header: 'Организация', key: 'organization', kind: 'text' },
  { header: 'Подорганизация', key: 'suborganization', kind: 'text' },
  { header: 'Семестр', key: 'semester', kind: 'text' },
  { header: 'Фамилия студента', key: 'studentLastName', kind: 'text' },
  { header: 'Имя студента', key: 'studentFirstName', kind: 'text' },
  { header: 'Отчество студента', key: 'studentPatronymic', kind: 'text', optional: true },
  { header: 'EMAIL студента', key: 'studentEmail', kind: 'text' },
  { header: 'Группа', key: 'groupName', kind: 'text' },
  { header: 'Код дисциплины', key: 'disciplineCode', kind: 'text' },
  { header: 'Название дисциплины', key: 'disciplineName', kind: 'text' },
  { header: 'Преподаватели которые ставили оценки', key: 'teachersWhoGraded', kind: 'text', optional: true },
  { header: 'Преподаватели из нагрузки', key: 'teachersFromWorkload', kind: 'text', optional: true },
  { header: 'Все преподаватели дисциплины', key: 'allDisciplineTeachers', kind: 'text', optional: true },
  { header: 'Макс. баллы в дисциплине', key: 'maxDisciplinePoints', kind: 'number' },
  { header: 'Макс. баллы в дисциплине (сумма по темам)', key: 'maxPointsByTopics', kind: 'number' },
  { header: 'Доступные баллы за КТ на момент выгрузки', key: 'availableControlPoints', kind: 'number' },
  { header: 'Баллы за задания/тесты', key: 'taskAndTestPoints', kind: 'number' },
  { header: 'Текущие баллы (5-зн система)', key: 'currentPointsFivePointScale', kind: 'number' },
  { header: 'Баллы за пересдачу', key: 'retakePoints', kind: 'number', optional: true },
  { header: 'Баллы за пересдачу (новые)', key: 'retakePointsNew', kind: 'number', optional: true },
  { header: 'Конечные баллы', key: 'finalPoints', kind: 'number' },
  { header: 'Конечные баллы (5-зн система)', key: 'finalPointsFivePointScale', kind: 'number' },
  { header: 'Текущий процент успеваемости по дисциплине', key: 'currentDisciplinePercent', kind: 'text', optional: true },
  { header: 'Текущий средний процент успеваемости студента', key: 'currentStudentAveragePercent', kind: 'text', optional: true },
  { header: 'Максимально доступные баллы за КТ по дисциплине на момент выгрузки', key: 'maxAvailableControlPoints', kind: 'number' },
];

export class ImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportValidationError';
  }
}

function primitiveValue(value: ExcelJS.CellValue): unknown {
  if (!value || typeof value !== 'object' || value instanceof Date) return value;

  if ('result' in value) return value.result ?? null;
  if ('richText' in value) return value.richText.map((part) => part.text).join('');
  if ('text' in value) return value.text;

  return value;
}

function readText(value: unknown, rowNumber: number, header: string, optional = false): string | null {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    if (optional) return null;
    throw new ImportValidationError(`Строка ${rowNumber}: не заполнено поле «${header}»`);
  }

  const result = String(value).trim();
  if (!result && !optional) {
    throw new ImportValidationError(`Строка ${rowNumber}: не заполнено поле «${header}»`);
  }
  return result || null;
}

function readNumber(value: unknown, rowNumber: number, header: string, optional = false): number | null {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    if (optional) return null;
    throw new ImportValidationError(`Строка ${rowNumber}: не заполнено числовое поле «${header}»`);
  }

  const parsed = typeof value === 'number'
    ? value
    : Number(String(value).trim().replace(',', '.'));

  if (!Number.isSafeInteger(parsed)) {
    throw new ImportValidationError(`Строка ${rowNumber}: в поле «${header}» ожидалось целое число`);
  }
  return parsed;
}

function readHeaderMap(row: ExcelJS.Row): Map<string, number> {
  const headerMap = new Map<string, number>();
  row.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
    const value = primitiveValue(cell.value);
    const header = typeof value === 'string' ? value.trim() : '';
    if (header) headerMap.set(header, columnNumber);
  });

  const missing = columns
    .filter((column) => !headerMap.has(column.header))
    .map((column) => column.header);

  if (missing.length > 0) {
    throw new ImportValidationError(`В листе «Отчет» отсутствуют столбцы: ${missing.join(', ')}`);
  }

  return headerMap;
}

function parseDataRow(row: ExcelJS.Row, headerMap: Map<string, number>): AcademicPerformanceRow | null {
  if (!row.hasValues) return null;

  const result: Record<string, unknown> = { sourceRowNumber: row.number };
  let hasData = false;

  for (const column of columns) {
    const value = primitiveValue(row.getCell(headerMap.get(column.header)!).value);
    if (value !== null && value !== undefined && value !== '') hasData = true;

    result[column.key] = column.kind === 'number'
      ? readNumber(value, row.number, column.header, column.optional)
      : readText(value, row.number, column.header, column.optional);
  }

  return hasData ? result as AcademicPerformanceRow : null;
}

export async function* parseExcelFile(filePath: string): AsyncGenerator<AcademicPerformanceRow> {
  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
    hyperlinks: 'ignore',
    styles: 'ignore',
    sharedStrings: 'cache',
    worksheets: 'emit',
  });

  let reportFound = false;

  try {
    for await (const worksheet of workbook) {
      if (reportFound) continue;
      reportFound = true;
      let headerMap: Map<string, number> | null = null;

      for await (const row of worksheet) {
        if (!row.hasValues) continue;
        if (!headerMap) {
          headerMap = readHeaderMap(row);
          continue;
        }

        const parsed = parseDataRow(row, headerMap);
        if (parsed) yield parsed;
      }
    }
  } catch (error) {
    if (error instanceof ImportValidationError) throw error;
    throw new ImportValidationError('Не удалось прочитать XLSX-файл. Проверьте, что файл не повреждён и сохранён в формате .xlsx.');
  }

  if (!reportFound) {
    throw new ImportValidationError('В книге не найден лист «Отчет»');
  }
}
