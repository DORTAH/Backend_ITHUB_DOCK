import ExcelJS from 'exceljs';
import { missing, type DocumentData } from './document-data.js';

type Sheet = ExcelJS.Worksheet;

function write(sheet: Sheet, values: Record<string, string | number | null>) {
  for (const [address, value] of Object.entries(values)) sheet.getCell(address).value = value;
}

function clearRows(sheet: Sheet, start: number, end: number, firstColumn: number, lastColumn: number) {
  for (let row = start; row <= end; row += 1) {
    for (let col = firstColumn; col <= lastColumn; col += 1) {
      const cell = sheet.getCell(row, col);
      if (cell.master.address === cell.address) cell.value = null;
    }
  }
}

function configurePrint(sheet: Sheet, endColumn: string, endRow: number) {
  sheet.pageSetup.printArea = `A1:${endColumn}${endRow}`;
  sheet.pageSetup.fitToPage = true;
  sheet.pageSetup.fitToWidth = 1;
  sheet.pageSetup.fitToHeight = 0;
}

function markRoster(data: DocumentData) {
  return data.hasEnrollment ? null : missing('полный состав группы');
}

function summary(sheet: Sheet, data: DocumentData) {
  for (const address of ['D12', 'G12', 'O12', 'S12', 'C35', 'C36', 'C52']) sheet.unMergeCells(address);
  clearRows(sheet, 12, sheet.rowCount, 2, sheet.columnCount);
  const rowStyles = [2, 3, 4].map((col) => ({ ...sheet.getCell(14, col).style }));
  write(sheet, {
    B6: `Учебный год: ${data.academicYear ?? missing('учебный год')}`,
    D6: `Семестр: ${data.semesterName ?? missing('семестр')}`,
    B7: `Специальность: ${data.specialty ?? missing('специальность')}`,
    B8: `Квалификация: ${data.qualification ?? missing('квалификация')}`,
    B9: `Курс: ${data.course ?? missing('курс')}`,
    B10: `Группа: ${data.groupName ?? missing('группа')}`,
    B12: missing('учебный план, формы контроля и номер семестра по плану'),
    B13: '№', C13: 'ФИО студента',
  });
  if (data.disciplines.length === 0) sheet.getCell('D13').value = missing('дисциплины и оценки');
  if (data.students.length === 0) sheet.getCell('C14').value = missing('состав группы');
  for (const [index, source] of data.disciplines.entries()) {
    const col = 4 + index;
    const header = sheet.getCell(13, col);
    header.style = { ...sheet.getCell('D13').style, alignment: { wrapText: true, vertical: 'middle' } };
    header.value = source.name;
    sheet.getColumn(col).width = 25;
    for (const [row, student] of data.students.entries()) {
      const cell = sheet.getCell(14 + row, col);
      cell.style = { ...rowStyles[2], alignment: { wrapText: true, horizontal: 'center', vertical: 'middle' } };
      cell.value = data.grade(student.id, source.id) ?? missing('оценка');
    }
  }
  for (const [index, student] of data.students.entries()) {
    const number = sheet.getCell(14 + index, 2);
    const name = sheet.getCell(14 + index, 3);
    number.style = { ...rowStyles[0] };
    name.style = { ...rowStyles[1] };
    number.value = index + 1;
    name.value = student.name;
  }
  sheet.getRow(13).height = 80;
  const footer = 15 + Math.max(data.students.length, 1);
  const categories = ['Неудовлетворительно', 'Удовлетворительно', 'Хорошо и отлично'];
  categories.forEach((label, index) => { sheet.getCell(footer + index, 3).value = label; });
  sheet.getCell(footer + 3, 3).value = 'Преподаватели';
  data.disciplines.forEach(({ id, teacher }, index) => {
    const counts = [0, 0, 0];
    for (const student of data.students) {
      const grade = data.grade(student.id, id);
      if (grade === 2) counts[0]! += 1;
      if (grade === 3) counts[1]! += 1;
      if (grade === 4 || grade === 5) counts[2]! += 1;
    }
    counts.forEach((count, row) => { sheet.getCell(footer + row, 4 + index).value = count; });
    sheet.getCell(footer + 3, 4 + index).value = teacher || missing('преподаватель');
  });
  sheet.getCell(footer + 4, 3).value = markRoster(data);
  sheet.getCell(footer + 5, 3).value = missing('проценты успеваемости и качества, реквизиты подписания');
  const endColumn = sheet.getColumn(Math.max(17, 3 + data.disciplines.length)).letter;
  configurePrint(sheet, endColumn, footer + 5);
}

function rosterRegister(sheet: Sheet, data: DocumentData, module: boolean) {
  const start = module ? 14 : 18;
  const originalEnd = module ? 23 : 28;
  const note = module ? 'результат экзамена по ПМ' : 'оценка за защиту';
  clearRows(sheet, start, sheet.rowCount, 2, sheet.columnCount);
  if (module) {
    write(sheet, {
      B5: `Зачётно-экзаменационная ведомость — ${data.semesterName ?? missing('семестр')}`,
      B6: `Специальность: ${data.specialty ?? missing('специальность')}`,
      B7: `Группа: ${data.groupName ?? missing('группа')}, квалификация: ${data.qualification ?? missing('квалификация')}`,
      B8: 'Форма контроля: экзамен по модулю', B9: data.discipline ?? missing('профессиональный модуль'),
      J2: null, E11: data.teacher || missing('преподаватель'),
    });
  } else {
    write(sheet, {
      B7: `Учебный год: ${data.academicYear ?? missing('учебный год')}`,
      D7: `Семестр: ${data.semesterName ?? missing('семестр')}`,
      B8: `Специальность: ${data.specialty ?? missing('специальность')}`,
      B9: `Квалификация: ${data.qualification ?? missing('квалификация')}`,
      B10: `Курс: ${data.course ?? missing('курс')}`, B11: `Группа: ${data.groupName ?? missing('группа')}`,
      B12: `Дисциплина: ${data.discipline ?? missing('дисциплина')}`,
      B14: missing('дата защиты'), D14: missing('преподаватель на защите'),
    });
  }
  for (let row = originalEnd + 1; row < start + data.students.length; row += 1) {
    for (let col = 2; col <= 5; col += 1) {
      const cell = sheet.getCell(row, col);
      if (cell.isMerged) sheet.unMergeCells(cell.master.address);
      cell.style = { ...sheet.getCell(originalEnd, col).style };
    }
  }
  for (const [index, student] of data.students.entries()) {
    const row = start + index;
    sheet.getCell(row, 2).value = index + 1;
    sheet.getCell(row, 3).value = student.name;
    sheet.getCell(row, 4).value = missing(note);
  }
  if (!data.students.length) sheet.getCell(start, 3).value = missing('состав группы');
  const footer = Math.max(originalEnd, start + data.students.length - 1) + 2;
  const details = [
    markRoster(data),
    module ? missing('дата экзамена по модулю') : null,
    module ? data.commission.map((member) => `${member.role} — ${member.fullName}`).join('; ') ||
      missing('состав комиссии') : missing('руководители защиты'),
    missing('реквизиты подписания'),
  ].filter((value): value is string => Boolean(value));
  details.forEach((detail, index) => {
    const cell = sheet.getCell(footer + index, 2);
    if (cell.isMerged) sheet.unMergeCells(cell.master.address);
    cell.value = detail;
  });
  configurePrint(sheet, 'E', footer + details.length);
}

function journal(workbook: ExcelJS.Workbook, sheet: Sheet, data: DocumentData) {
  const [, lessons, ...samples] = workbook.worksheets;
  if (!lessons) throw new Error('В шаблоне журнала отсутствует лист учёта занятий');
  for (const sample of samples) workbook.removeWorksheet(sample.id);
  sheet.name = 'Посещаемость и оценки';
  lessons.name = 'Учёт занятий';
  clearRows(sheet, 9, 9, 4, 37);
  clearRows(sheet, 10, sheet.rowCount, 2, 38);
  write(sheet, {
    D3: data.discipline ?? missing('дисциплина'),
    D5: data.teacher || missing('преподаватель'),
    B7: `Группа: ${data.groupName ?? missing('группа')} — ${data.semesterName ?? missing('семестр')}`,
    D8: missing('даты, посещаемость и оценки по занятиям'),
  });
  for (const [index, student] of data.students.entries()) {
    const row = 10 + index;
    sheet.getCell(row, 2).value = index + 1;
    sheet.getCell(row, 3).value = student.name;
    sheet.getCell(row, 38).value = (data.selectedDisciplineId === undefined
      ? undefined : data.grade(student.id, data.selectedDisciplineId)) ?? missing('оценка');
  }
  if (!data.students.length) sheet.getCell('C10').value = missing('состав группы');
  sheet.getCell(11 + data.students.length, 3).value = markRoster(data);
  clearRows(lessons, 4, lessons.rowCount, 1, lessons.columnCount);
  write(lessons, { A4: missing('дата'), B4: missing('тема занятия'), C4: missing('часы') });
}

function schedule(sheet: Sheet, data: DocumentData) {
  write(sheet, {
    B8: data.semesterName ?? missing('семестр'),
    G6: missing('дата утверждения'),
    J9: null,
  });
  for (const row of [9, 22, 35, 48, 61]) {
    clearRows(sheet, row, row + 11, 5, 7);
    sheet.getCell(row, 5).value = data.groupName ?? missing('группа');
    sheet.getCell(row + 1, 5).value = missing('занятия, преподаватели и аудитории');
  }
  configurePrint(sheet, 'G', 72);
}

export const spreadsheetRenderers = {
  'summary-register': (workbook: ExcelJS.Workbook, sheet: Sheet, data: DocumentData) => summary(sheet, data),
  'module-register': (workbook: ExcelJS.Workbook, sheet: Sheet, data: DocumentData) => rosterRegister(sheet, data, true),
  'project-register': (workbook: ExcelJS.Workbook, sheet: Sheet, data: DocumentData) => rosterRegister(sheet, data, false),
  'lesson-journal': journal,
  'lesson-schedule': (workbook: ExcelJS.Workbook, sheet: Sheet, data: DocumentData) => schedule(sheet, data),
};
