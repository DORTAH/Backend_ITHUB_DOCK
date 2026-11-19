import { db } from '../../prisma/db.js';
import { ImportValidationError } from './parsers/excel.parser.js';

type PlanDiscipline = {
  code: string;
  name: string;
  semester: number;
  controlForms: string[];
  plannedHours?: number;
};

type PlanInput = {
  studyProgramId: number;
  admissionBase: 9 | 11;
  admissionYear: number;
  semesterCount: number;
  name?: string;
  sourceFileName?: string;
  disciplines: PlanDiscipline[];
  studyGroupIds: number[];
};

function object(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ImportValidationError(`${field}: ожидается объект`);
  }
  return value as Record<string, unknown>;
}

function integer(value: unknown, field: string, min: number, max = 2147483647): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new ImportValidationError(`${field}: ожидается целое число от ${min} до ${max}`);
  }
  return value;
}

function text(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength || value.includes('\u0000')) {
    throw new ImportValidationError(`${field}: ожидается строка длиной от 1 до ${maxLength}`);
  }
  return value.trim().normalize('NFC');
}

export function parseStudyPlan(value: unknown): PlanInput {
  const input = object(value, 'Учебный план');
  const admissionBase = input['admissionBase'];
  if (admissionBase !== 9 && admissionBase !== 11) {
    throw new ImportValidationError('admissionBase: укажите 9 или 11 класс');
  }
  const semesterCount = admissionBase === 9 ? 8 : 6;
  if (!Array.isArray(input['disciplines']) || input['disciplines'].length === 0) {
    throw new ImportValidationError('disciplines: укажите строки учебного плана');
  }
  const namesByCode = new Map<string, string>();
  const disciplineKeys = new Set<string>();
  const disciplines = input['disciplines'].map((value, index) => {
    const field = `disciplines[${index}]`;
    const row = object(value, field);
    const code = text(row['code'], `${field}.code`, 100);
    const name = text(row['name'], `${field}.name`, 500);
    const semester = integer(row['semester'], `${field}.semester`, 1, semesterCount);
    const existingName = namesByCode.get(code);
    if (existingName !== undefined && existingName !== name) {
      throw new ImportValidationError(`${field}: у индекса ${code} два разных названия`);
    }
    namesByCode.set(code, name);
    const key = `${semester}/${code}`;
    if (disciplineKeys.has(key)) throw new ImportValidationError(`${field}: дисциплина повторяется в семестре ${semester}`);
    disciplineKeys.add(key);
    if (!Array.isArray(row['controlForms'])) {
      throw new ImportValidationError(`${field}.controlForms: ожидается массив форм контроля`);
    }
    const controlForms = [...new Set(row['controlForms'].map((form) => text(form, `${field}.controlForms`, 150)))];
    const plannedHours = row['plannedHours'] === undefined ? undefined :
      integer(row['plannedHours'], `${field}.plannedHours`, 0);
    return { code, name, semester, controlForms, plannedHours };
  });
  const rawGroupIds = input['studyGroupIds'] ?? [];
  if (!Array.isArray(rawGroupIds)) throw new ImportValidationError('studyGroupIds: ожидается массив идентификаторов групп');
  const studyGroupIds = [...new Set(rawGroupIds.map((id, index) => integer(id, `studyGroupIds[${index}]`, 1)))];
  return {
    studyProgramId: integer(input['studyProgramId'], 'studyProgramId', 1),
    admissionBase,
    admissionYear: integer(input['admissionYear'], 'admissionYear', 1900, 9999),
    semesterCount,
    name: input['name'] === undefined ? undefined : text(input['name'], 'name', 500),
    sourceFileName: input['sourceFileName'] === undefined ? undefined :
      text(input['sourceFileName'], 'sourceFileName', 255),
    disciplines,
    studyGroupIds,
  };
}

export async function importStudyPlan(input: PlanInput) {
  return db.transaction(async (tx) => {
    const orm = tx.orm.public;
    const program = await orm.StudyProgram.where({ id: input.studyProgramId }).first();
    if (!program) throw new ImportValidationError('Образовательная программа не найдена');
    const cohort = {
      studyProgramId: input.studyProgramId,
      admissionBase: input.admissionBase,
      admissionYear: input.admissionYear,
    };
    const metadata = {
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.sourceFileName === undefined ? {} : { sourceFileName: input.sourceFileName }),
    };
    const plan = await orm.StudyPlan.upsert({
      conflictOn: cohort,
      create: { ...cohort, ...metadata },
      update: { admissionYear: cohort.admissionYear, ...metadata },
    });
    const previousDisciplines = await orm.StudyPlanDiscipline.where({ studyPlanId: plan.id })
      .include('fgosDiscipline').all();
    const knownNames = new Map(input.disciplines.map(({ code, name }) => [code, name]));
    for (const entry of previousDisciplines) {
      const discipline = entry.fgosDiscipline;
      if (!discipline) continue;
      const name = knownNames.get(discipline.code);
      if (name !== undefined && name !== discipline.name) {
        throw new ImportValidationError(`Индекс ${discipline.code} уже сохранён с другим названием в этом учебном плане`);
      }
    }

    const fgosIds = new Map<string, number>();
    for (const row of input.disciplines) {
      let fgosDisciplineId = fgosIds.get(row.code);
      if (fgosDisciplineId === undefined) {
        const identity = { studyProgramId: program.id, code: row.code, name: row.name };
        const fgos = await orm.FgosDiscipline.upsert({
          conflictOn: identity,
          create: identity,
          update: { name: row.name },
        });
        fgosDisciplineId = fgos.id;
        fgosIds.set(row.code, fgosDisciplineId);
      }
      const forms: Array<string | null> = row.controlForms.length > 0 ? row.controlForms : [null];
      for (const controlForm of forms) {
        const identity = {
          studyPlanId: plan.id,
          fgosDisciplineId,
          semesterNumber: row.semester,
          controlForm,
        };
        const existing = await orm.StudyPlanDiscipline.where(identity).first();
        const plannedHours = row.plannedHours ?? null;
        if (existing) {
          await orm.StudyPlanDiscipline.where({ id: existing.id }).update({ plannedHours });
        } else {
          await orm.StudyPlanDiscipline.create({ ...identity, plannedHours });
        }
      }
    }

    const groupIds = [...input.studyGroupIds].sort((a, b) => a - b);
    for (const studyGroupId of groupIds) {
      const group = await orm.StudyGroup.where({ id: studyGroupId }).first();
      if (!group || group.suborganizationId !== program.suborganizationId ||
          (group.studyProgramId != null && group.studyProgramId !== program.id) ||
          (group.studyPlanId != null && group.studyPlanId !== plan.id)) {
        throw new ImportValidationError(`Группа ${studyGroupId} не найдена или относится к другой программе или учебному плану`);
      }
      const updated = await orm.StudyGroup.where({
        id: studyGroupId,
        studyPlanId: group.studyPlanId,
        studyProgramId: group.studyProgramId,
      }).updateAndCount({ studyPlanId: plan.id, studyProgramId: program.id });
      if (updated !== 1) throw new ImportValidationError(`Привязка группы ${studyGroupId} изменилась, повторите импорт`);
    }

    return {
      studyPlanId: plan.id,
      semesterCount: input.semesterCount,
      disciplineRows: input.disciplines.length,
      groupsLinked: groupIds.length,
    };
  });
}

