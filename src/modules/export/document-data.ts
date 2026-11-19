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
  const [group, period, selectedDiscipline, enrollments, results] = await Promise.all([
    groupId === undefined ? undefined : orm.StudyGroup.include('studyProgram').where({ id: groupId }).first(),
    groupId === undefined || semesterNumber === undefined ? undefined : orm.StudyGroupPlanSemester
      .where({ studyGroupId: groupId, semesterNumber }).first(),
    disciplineId === undefined ? undefined : orm.Discipline.where({ id: disciplineId }).first(),
    groupId === undefined || semesterNumber === undefined ? [] : orm.StudentEnrollment
      .where({ studyGroupId: groupId, semesterNumber }).include('student').all(),
    groupId === undefined || semesterNumber === undefined ? [] : orm.AcademicPerformance
      .where({ studyGroupId: groupId, semesterId: semesterNumber }).include('student').include('discipline').include('importBatch').all(),
  ]);

  if ((groupId !== undefined && !group) || (groupId !== undefined && semesterNumber !== undefined && !period) ||
      (disciplineId !== undefined && !selectedDiscipline)) {
    throw new ExportValidationError('Группа, семестр или дисциплина не найдены');
  }
  if (group && selectedDiscipline && group.suborganizationId !== selectedDiscipline.suborganizationId) {
    throw new ExportValidationError('Дисциплина не относится к подразделению группы');
  }

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
  for (const entry of enrollments) {
    if (entry.student) roster.set(entry.studentId, studentName(entry.student));
  }
  const enrolledCount = roster.size;
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

  const groupCommissions = withCommission && program && groupId && semesterNumber !== undefined
    ? await orm.AttestationCommission.where({ studyProgramId: program.id, semesterNumber }).include('members').all()
    : [];
  const candidates = groupCommissions
    .filter((commission) => (commission.studyGroupId === groupId || commission.studyGroupId === null) &&
      (commission.academicYear === null || period?.academicYear == null || commission.academicYear === period.academicYear) &&
      (commission.disciplineId === disciplineId || commission.disciplineId === null))
    .map((commission) => ({ commission, priority: Number(commission.studyGroupId !== null) + 2 * Number(commission.disciplineId !== null) }))
    .sort((a, b) => b.priority - a.priority);
  const commission = candidates[0] && candidates[0].priority !== candidates[1]?.priority
    ? [...candidates[0].commission.members].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    : [];

  const courses = new Set(enrollments.flatMap(({ courseNumber }) => courseNumber == null ? [] : [courseNumber]));
  const years = new Set(enrollments.flatMap(({ academicYear }) => academicYear ? [academicYear] : []));
  const yearFromName = period?.semesterLabel.match(/\b(\d{2}|\d{4})\s*[-/]\s*(\d{2}|\d{4})\b/);
  const academicYear = years.size === 1 ? [...years][0] : yearFromName?.slice(1)
    .map((year) => year.length === 2 ? `20${year}` : year).join('–');
  const teachers = (id: number) => [...new Set([...latest.values()]
    .filter((row) => row.disciplineId === id)
    .flatMap((row) => [row.teachersWhoGraded, row.teachersFromWorkload])
    .map((value) => value?.replace(/^_+/, '').trim()).filter(Boolean))].join(', ');
  return {
    groupName: group?.name,
    semesterName: period?.semesterLabel,
    academicYear,
    course: courses.size === 1 ? [...courses][0] : undefined,
    specialty: program ? `${program.specialtyCode} ${program.name}` : undefined,
    qualification: program?.qualification,
    discipline: selectedDiscipline ? disciplineName(selectedDiscipline) : undefined,
    teacher: disciplineId === undefined ? undefined : teachers(disciplineId),
    student: studentId === undefined ? undefined : roster.get(studentId),
    students,
    hasEnrollment: enrolledCount > 0 && enrolledCount === roster.size,
    disciplines: [...disciplines].map(([id, name]) => ({ id, name, teacher: teachers(id) }))
      .sort((left, right) => left.name.localeCompare(right.name, 'ru')),
    grade: (personId: number, subjectId: number) => latest.get(`${personId}/${subjectId}`)?.finalPointsFivePointScale,
    commission,
    selectedDisciplineId: disciplineId,
  };
}

export type DocumentData = Awaited<ReturnType<typeof readDocumentData>>;
