import { db } from '../../prisma/db.js';
import { ExportValidationError } from './export.service.js';

export type DocumentSelection = {
  groupId?: number;
  semesterNumber?: number;
  disciplineId?: number;
  studentId?: number;
};

export const missing = (field: string) => `[Нет данных: ${field}]`;

function studentName(student: { firstName: string; lastName: string; patronymic: string | null }) {
  return [student.lastName, student.firstName, student.patronymic].filter(Boolean).join(' ');
}

export async function readDocumentData({ groupId, semesterNumber, disciplineId, studentId }: DocumentSelection, withCommission = false) {
  const orm = db.orm.public;
  const [group, selectedDiscipline, rawResults] = await Promise.all([
    groupId === undefined ? undefined : orm.StudyGroup.include('studyProgram').where({ id: groupId }).first(),
    disciplineId === undefined ? undefined : orm.Discipline.where({ id: disciplineId }).first(),
    groupId === undefined || semesterNumber === undefined ? [] : orm.AcademicPerformance
      .where({ studyGroupId: groupId, semesterId: semesterNumber }).all(),
  ]);

  if ((groupId !== undefined && !group) || (disciplineId !== undefined && !selectedDiscipline)) {
    throw new ExportValidationError('Группа, семестр или дисциплина не найдены');
  }
  if (group && selectedDiscipline && group.suborganizationId !== selectedDiscipline.suborganizationId) {
    throw new ExportValidationError('Дисциплина не относится к подразделению группы');
  }

  const results = await Promise.all(rawResults.map(async (row) => {
    const [student, discipline, importBatch] = await Promise.all([
      orm.Student.where({ id: row.studentId }).first(),
      orm.Discipline.where({ id: row.disciplineId }).first(),
      orm.ImportBatch.where({ id: row.importBatchId }).first(),
    ]);
    return { ...row, student, discipline, importBatch };
  }));
  const period = [...results].sort((a, b) =>
    (b.importBatch?.importedAt.getTime() ?? 0) - (a.importBatch?.importedAt.getTime() ?? 0),
  ).find((row) => row.importBatch)?.importBatch;

  const program = group?.studyProgram;
  const officialDisciplines = program
    ? await orm.FgosDiscipline.where({ studyProgramId: program.id }).include('mappings').all()
    : [];
  const official = new Map<number, Set<string>>();
  for (const discipline of officialDisciplines) {
    for (const mapping of discipline.mappings) {
      const names = official.get(mapping.disciplineId) ?? new Set<string>();
      names.add(`${discipline.code} ${discipline.name}`);
      official.set(mapping.disciplineId, names);
    }
  }
  const disciplineName = (discipline: { id: number; code: string; name: string }) => {
    const matches = official.get(discipline.id);
    return matches?.size === 1
      ? [...matches][0]!
      : `${discipline.code} ${discipline.name} — ${missing(matches ? 'однозначное соответствие ФГОС' : 'индекс ФГОС')}`;
  };

  const roster = new Map<number, string>();
  const latest = new Map<string, (typeof results)[number]>();
  const disciplines = new Map<number, string>();
  for (const row of results) {
    if (!row.student || !row.discipline || !row.importBatch) continue;
    roster.set(row.studentId, studentName(row.student));
    disciplines.set(row.disciplineId, disciplineName(row.discipline));
    const key = `${row.studentId}/${row.disciplineId}`;
    const previous = latest.get(key);
    const importedAt = row.importBatch.importedAt.getTime();
    const previousAt = previous?.importBatch?.importedAt.getTime();
    if (previousAt === undefined || importedAt > previousAt ||
        (importedAt === previousAt && row.importBatchId > previous!.importBatchId)) {
      latest.set(key, row);
    }
  }

  const students = [...roster].map(([id, name]) => ({ id, name }))
    .sort((left, right) => left.name.localeCompare(right.name, 'ru'));
  if (studentId !== undefined && !roster.has(studentId)) {
    throw new ExportValidationError('Студент не найден в выбранной группе за этот семестр');
  }

  const periodLabel = period?.semester ?? (semesterNumber === undefined ? undefined : `Семестр ${semesterNumber}`);
  const academicYearMatch = periodLabel?.match(/\b(\d{2}|\d{4})\s*[-/](\d{2}|\d{4})\b/);
  const academicYear = academicYearMatch?.slice(1)
    .map((year) => year.length === 2 ? `20${year}` : year).join('–');
  const groupCommissions = withCommission && program && groupId && semesterNumber !== undefined
    ? await orm.AttestationCommission.where({ studyProgramId: program.id, semesterNumber }).include('members').all()
    : [];
  const candidates = groupCommissions
    .filter((commission) => (commission.studyGroupId === groupId || commission.studyGroupId === null) &&
      (commission.academicYear === null || academicYear == null || commission.academicYear === academicYear) &&
      (commission.disciplineId === disciplineId || commission.disciplineId === null))
    .map((commission) => ({ commission, priority: Number(commission.studyGroupId !== null) + 2 * Number(commission.disciplineId !== null) }))
    .sort((a, b) => b.priority - a.priority);
  const commission = candidates[0] && candidates[0].priority !== candidates[1]?.priority
    ? [...candidates[0].commission.members].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    : [];

  const teachers = (id: number) => [...new Set([...latest.values()]
    .filter((row) => row.disciplineId === id)
    .flatMap((row) => [row.teachersWhoGraded, row.teachersFromWorkload])
    .map((value) => value?.replace(/^_+/, '').trim()).filter(Boolean))].join(', ');
  return {
    groupName: group?.name,
    semesterName: periodLabel,
    academicYear,
    course: undefined,
    specialty: program ? `${program.specialtyCode} ${program.name}` : undefined,
    qualification: program?.qualification,
    discipline: selectedDiscipline ? disciplineName(selectedDiscipline) : undefined,
    teacher: disciplineId === undefined ? undefined : teachers(disciplineId),
    student: studentId === undefined ? undefined : roster.get(studentId),
    students,
    hasEnrollment: students.length > 0,
    disciplines: [...disciplines].map(([id, name]) => ({ id, name, teacher: teachers(id) }))
      .sort((left, right) => left.name.localeCompare(right.name, 'ru')),
    grade: (personId: number, subjectId: number) => latest.get(`${personId}/${subjectId}`)?.finalPointsFivePointScale,
    commission,
    selectedDisciplineId: disciplineId,
  };
}

export type DocumentData = Awaited<ReturnType<typeof readDocumentData>>;
