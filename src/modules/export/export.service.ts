import ExcelJS from 'exceljs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../../prisma/db.js';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
const templateDirectory = resolve(appRoot, 'other');
const subjectRegisterTemplate = 'Ведомость по дисциплине, предмету.xlsx';

export type DisciplineRegisterInput = {
  groupId: number;
  semesterNumber: number;
  disciplineId: number;
  specialty: string;
  qualification: string;
  controlForm: string;
  date: string;
  teacher: string;
};

export class ExportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExportValidationError';
  }
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function safeFilenamePart(value: string): string {
  return value.normalize('NFC').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').trim();
}

function uniqueNames(values: Array<string | null>): string {
  return [...new Set(values.map((value) => value?.replace(/^_+/, '').trim()).filter(nonEmpty))].join(', ');
}

export async function getExportOptions() {
  const [groups, records, disciplines] = await Promise.all([
    db.orm.public.StudyGroup
      .include('suborganization', (suborganization) => suborganization.select('name'))
      .include('studyProgram', (program) => program.select('specialtyCode', 'name', 'qualification'))
      .orderBy((group) => group.name.asc())
      .all(),
    db.orm.public.AcademicPerformance.select('semesterId').all(),
    db.orm.public.Discipline
      .include('suborganization', (suborganization) => suborganization.select('name'))
      .orderBy((discipline) => discipline.code.asc())
      .all(),
  ]);

  return {
    groups: groups.flatMap(({ id, name, suborganization, studyProgram }) => suborganization
      ? [{
        id,
        label: `${name} — ${suborganization.name}`,
        specialty: studyProgram ? `${studyProgram.specialtyCode} ${studyProgram.name}` : '',
        qualification: studyProgram?.qualification ?? '',
      }]
      : []),
    semesters: [...new Set(records.map(({ semesterId }) => semesterId))]
      .sort((left, right) => left - right)
      .map((semesterNumber) => ({ id: semesterNumber, name: `Семестр ${semesterNumber}` })),
    disciplines: disciplines.flatMap(({ id, code, name, suborganization }) => suborganization
      ? [{ id, label: `${code} — ${name} (${suborganization.name})` }]
      : []),
  };
}

export async function readExportTemplate(name: string): Promise<Buffer> {
  const files = await readdir(templateDirectory);
  const templateFile = files.find((file) => file.normalize('NFC') === name.normalize('NFC'));
  if (!templateFile) throw new Error(`Не найден шаблон «${name}» в папке other`);
  return readFile(resolve(templateDirectory, templateFile));
}

export function clearYellowFill(sheet: ExcelJS.Worksheet) {
  sheet.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      const fill = cell.fill;
      const color = fill?.type === 'pattern' ? fill.fgColor : undefined;
      if (color && 'indexed' in color && color.indexed === 5) {
        cell.style = { ...cell.style, fill: { type: 'pattern', pattern: 'none' } };
      }
    });
  });
}

export async function exportDisciplineRegister(input: DisciplineRegisterInput) {
  if (!Number.isSafeInteger(input.groupId) || !Number.isSafeInteger(input.semesterNumber) || !Number.isSafeInteger(input.disciplineId)) {
    throw new ExportValidationError('Выберите группу, семестр и дисциплину');
  }
  if (!nonEmpty(input.controlForm)) throw new ExportValidationError('Укажите форму контроля');

  const [group, discipline, rawRows] = await Promise.all([
    db.orm.public.StudyGroup
      .include('suborganization', (suborganization) => suborganization.select('id', 'name'))
      .include('studyProgram', (program) => program.select('specialtyCode', 'name', 'qualification'))
      .where({ id: input.groupId })
      .first(),
    db.orm.public.Discipline
      .include('suborganization', (suborganization) => suborganization.select('id', 'name'))
      .where({ id: input.disciplineId })
      .first(),
    db.orm.public.AcademicPerformance
      .where({
        studyGroupId: input.groupId,
        semesterId: input.semesterNumber,
        disciplineId: input.disciplineId,
      })
      .orderBy((record) => record.sourceRowNumber.asc())
      .all(),
  ]);

  if (!group || !discipline) {
    throw new ExportValidationError('Выбранные группа, семестр или дисциплина не найдены');
  }
  if (!group.suborganization || !discipline.suborganization) {
    throw new ExportValidationError('Для выбранной группы или дисциплины не задано учебное подразделение');
  }
  if (group.suborganization.id !== discipline.suborganization.id) {
    throw new ExportValidationError('Дисциплина не относится к выбранному учебному подразделению');
  }
  const specialty = group.studyProgram
    ? `${group.studyProgram.specialtyCode} ${group.studyProgram.name}`
    : input.specialty.trim();
  const qualification = group.studyProgram?.qualification ?? input.qualification.trim();
  if (!specialty || !qualification) {
    throw new ExportValidationError('Для этой группы не заполнены специальность и квалификация');
  }
  if (rawRows.length === 0) {
    throw new ExportValidationError('Для выбранной группы, семестра и дисциплины нет импортированных оценок');
  }

  const rowsWithRelations = await Promise.all(rawRows.map(async (row) => {
    const [student, importBatch] = await Promise.all([
      db.orm.public.Student.where({ id: row.studentId }).first(),
      db.orm.public.ImportBatch.where({ id: row.importBatchId }).first(),
    ]);
    if (!student || !importBatch) throw new Error('В части записей отсутствует студент или исходная загрузка');
    return { ...row, student, importBatch };
  }));
  const latestByStudent = new Map<number, (typeof rowsWithRelations)[number]>();
  for (const row of rowsWithRelations) {
    const previous = latestByStudent.get(row.studentId);
    if (!previous || row.importBatch.importedAt > previous.importBatch.importedAt) {
      latestByStudent.set(row.studentId, row);
    }
  }
  const students = [...latestByStudent.values()].sort((left, right) => {
    const lastName = left.student.lastName.localeCompare(right.student.lastName, 'ru');
    if (lastName !== 0) return lastName;
    return left.student.firstName.localeCompare(right.student.firstName, 'ru');
  });

  const workbook = new ExcelJS.Workbook();
  const templateBytes = new Uint8Array(await readExportTemplate(subjectRegisterTemplate));
  const templateArrayBuffer = new ArrayBuffer(templateBytes.byteLength);
  new Uint8Array(templateArrayBuffer).set(templateBytes);
  await workbook.xlsx.load(templateArrayBuffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('В шаблоне не найден лист для ведомости');

  for (const address of ['G5', 'B47', 'C49', 'C50', 'C66']) {
    sheet.getCell(address).value = null;
  }
  clearYellowFill(sheet);

  const teacher = nonEmpty(input.teacher)
    ? input.teacher.trim()
    : uniqueNames(rowsWithRelations.flatMap((row) => [row.teachersWhoGraded, row.teachersFromWorkload]));
  const periodLabel = rowsWithRelations[0]?.importBatch.semester ?? `Семестр ${input.semesterNumber}`;
  const academicYear = periodLabel.match(/(\d{2})\s*[-/]\s*(\d{2})/)?.slice(1)
    .map((year) => `20${year}`).join('/');
  const yearLabel = academicYear ? `${academicYear.replace('/', '-')} г.` : '';
  const semesterName = periodLabel.toLocaleLowerCase('ru');
  const halfYear = semesterName.includes('осенн')
    ? 'I полугодие'
    : semesterName.includes('весенн')
      ? 'II полугодие'
      : '';

  sheet.getCell('B5').value = `Зачетно-экзаменационная ведомость за ${[halfYear, yearLabel].filter(Boolean).join(' ') || periodLabel}`;
  sheet.getCell('B6').value = `Специальность – ${specialty}`;
  sheet.getCell('B7').value = `Группа ${group.name}, квалификация: ${qualification}`;
  sheet.getCell('B8').value = `Форма контроля: ${input.controlForm.trim()}`;
  sheet.getCell('B9').value = `по дисциплине: ${discipline.code} ${discipline.name}`;
  sheet.getCell('B11').value = `Дата проведения: ${input.date.trim() || '________________'}`;
  sheet.getCell('D11').value = `Преподаватель: ${teacher || '________________'}`;

  const firstStudentRow = 15;
  const originalStudentSlots = 28;
  const extraRows = Math.max(0, students.length - originalStudentSlots);
  if (extraRows > 0) sheet.duplicateRow(firstStudentRow + originalStudentSlots - 1, extraRows, true);

  const lastStudentRow = firstStudentRow + students.length - 1;
  for (let rowNumber = firstStudentRow; rowNumber <= Math.max(firstStudentRow + originalStudentSlots - 1, lastStudentRow); rowNumber += 1) {
    for (const column of ['B', 'C', 'D', 'E']) sheet.getCell(`${column}${rowNumber}`).value = null;
  }

  students.forEach((record, index) => {
    const rowNumber = firstStudentRow + index;
    const fullName = [record.student.lastName, record.student.firstName, record.student.patronymic]
      .filter(nonEmpty)
      .join(' ');
    sheet.getCell(`B${rowNumber}`).value = index + 1;
    sheet.getCell(`C${rowNumber}`).value = fullName;
    sheet.getCell(`D${rowNumber}`).value = record.finalPointsFivePointScale;
  });

  sheet.pageSetup.printArea = `A1:E${Math.max(45, lastStudentRow + 4)}`;
  sheet.pageSetup.fitToPage = true;
  sheet.pageSetup.fitToWidth = 1;
  sheet.pageSetup.fitToHeight = 0;

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = [group.name, periodLabel, discipline.code, 'ведомость']
    .map(safeFilenamePart)
    .filter(Boolean)
    .join('_') + '.xlsx';

  return { buffer: Buffer.from(new Uint8Array(buffer)) as unknown as Buffer, filename };
}
