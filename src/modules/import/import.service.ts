import { basename } from 'node:path';
import { db } from '../../prisma/db.js';
import { ImportValidationError, parseExcelFile } from './parsers/excel.parser.js';

const INSERT_CHUNK_SIZE = 300;

type ImportRow = Awaited<ReturnType<typeof parseExcelFile>> extends AsyncGenerator<infer T> ? T : never;

function createLookup<T>() {
  return new Map<string, T>();
}

function academicYearFromSemester(semester: string): string | null {
  const match = semester.match(/(?:^|\s)(\d{2})[-/](\d{2})(?:\s|$)/);
  return match ? `20${match[1]}/20${match[2]}` : null;
}

export type ImportResult = {
  batchId: number;
  sourceFileName: string;
  semester: string;
  importedRows: number;
};

export async function importExcel(filePath: string, originalName: string): Promise<ImportResult> {
  const iterator = parseExcelFile(filePath)[Symbol.asyncIterator]();
  const firstRow = await iterator.next();

  if (firstRow.done) {
    throw new ImportValidationError('В листе «Отчет» нет строк с данными');
  }

  const sourceFileName = basename(originalName);

  return db.transaction(async (tx) => {
    const batch = await tx.orm.public.ImportBatch.create({
      sourceFileName,
      semester: firstRow.value.semester,
      rowCount: 0,
    });

    let importedRows = 0;
    let chunk = [firstRow.value];
    const organizations = createLookup<number>();
    const suborganizations = createLookup<number>();
    const students = createLookup<number>();
    const groups = createLookup<number>();
    const disciplines = createLookup<number>();
    const enrollments = new Set<string>();

    const resolveId = async <T extends { id: number }>(
      cache: Map<string, number>,
      key: string,
      find: () => Promise<T | null>,
      create: () => Promise<T>,
    ): Promise<number> => {
      const cachedId = cache.get(key);
      if (cachedId !== undefined) return cachedId;
      const existing = await find();
      const id = existing?.id ?? (await create()).id;
      cache.set(key, id);
      return id;
    };

    const toRecord = async (row: ImportRow) => {
      const organizationId = await resolveId(
        organizations, row.organization,
        () => tx.orm.public.Organization.where({ name: row.organization }).first(),
        () => tx.orm.public.Organization.create({ name: row.organization }),
      );
      const suborganizationKey = `${row.organization}\u0000${row.suborganization}`;
      const suborganizationId = await resolveId(
        suborganizations, suborganizationKey,
        () => tx.orm.public.Suborganization.where({ organizationId, name: row.suborganization }).first(),
        () => tx.orm.public.Suborganization.create({ organizationId, name: row.suborganization }),
      );
      const email = row.studentEmail.toLowerCase();
      const studentId = await resolveId(
        students, email,
        () => tx.orm.public.Student.where({ email }).first(),
        () => tx.orm.public.Student.create({
          email,
          lastName: row.studentLastName,
          firstName: row.studentFirstName,
          patronymic: row.studentPatronymic,
        }),
      );
      const groupKey = `${suborganizationId}\u0000${row.groupName}`;
      const groupId = await resolveId(
        groups, groupKey,
        () => tx.orm.public.StudyGroup.where({ suborganizationId, name: row.groupName }).first(),
        () => tx.orm.public.StudyGroup.create({ suborganizationId, name: row.groupName }),
      );
      const groupPeriod = await tx.orm.public.StudyGroupPlanSemester
        .where({ studyGroupId: groupId, semesterLabel: row.semester })
        .first();
      if (!groupPeriod) {
        throw new ImportValidationError(`Для группы «${row.groupName}» не настроено соответствие семестра «${row.semester}» учебному плану`);
      }
      const semesterNumber = groupPeriod.semesterNumber;
      const academicYear = academicYearFromSemester(row.semester);
      const enrollmentKey = `${studentId}\u0000${row.semester}`;
      if (!enrollments.has(enrollmentKey)) {
        const existingEnrollment = await tx.orm.public.StudentEnrollment
          .where({ studentId, semesterLabel: row.semester })
          .first();

        if (existingEnrollment) {
          if (existingEnrollment.studyGroupId !== groupId ||
              existingEnrollment.academicYear !== academicYear ||
              existingEnrollment.semesterNumber !== semesterNumber) {
            await tx.orm.public.StudentEnrollment
              .where({ id: existingEnrollment.id })
              .update({ studyGroupId: groupId, academicYear, semesterNumber });
          }
        } else {
          await tx.orm.public.StudentEnrollment.create({
            studentId,
            semesterLabel: row.semester,
            semesterNumber,
            studyGroupId: groupId,
            academicYear,
          });
        }
        enrollments.add(enrollmentKey);
      }
      const disciplineKey = `${suborganizationId}\u0000${row.disciplineCode}\u0000${row.disciplineName}`;
      const disciplineId = await resolveId(
        disciplines, disciplineKey,
        () => tx.orm.public.Discipline.where({
          suborganizationId,
          code: row.disciplineCode,
          name: row.disciplineName,
        }).first(),
        () => tx.orm.public.Discipline.create({
          suborganizationId,
          code: row.disciplineCode,
          name: row.disciplineName,
        }),
      );
      const {
        sourceRowNumber,
        organization: _organization,
        suborganization: _suborganization,
        semester: _semester,
        studentEmail: _studentEmail,
        studentLastName: _studentLastName,
        studentFirstName: _studentFirstName,
        studentPatronymic: _studentPatronymic,
        groupName: _groupName,
        disciplineCode: _disciplineCode,
        disciplineName: _disciplineName,
        ...scores
      } = row;

      return {
        ...scores,
        importBatchId: batch.id,
        sourceRowNumber,
        organizationId,
        suborganizationId,
        // Keep the legacy column name, but it stores the semester ordinal and has no FK.
        semesterId: semesterNumber,
        studentId,
        studyGroupId: groupId,
        disciplineId,
      };
    };

    while (chunk.length > 0) {
      while (chunk.length < INSERT_CHUNK_SIZE) {
        const nextRow = await iterator.next();
        if (nextRow.done) break;
        chunk.push(nextRow.value);
      }

      const normalizedRecords = [];
      for (const row of chunk) normalizedRecords.push(await toRecord(row));
      await tx.orm.public.AcademicPerformance.createAll(normalizedRecords);
      importedRows += chunk.length;

      if (chunk.length < INSERT_CHUNK_SIZE) break;
      const nextRow = await iterator.next();
      if (nextRow.done) break;
      chunk = [nextRow.value];
    }

    await tx.orm.public.ImportBatch
      .where({ id: batch.id })
      .update({ rowCount: importedRows });

    return {
      batchId: batch.id,
      sourceFileName,
      semester: firstRow.value.semester,
      importedRows,
    };
  });
}
