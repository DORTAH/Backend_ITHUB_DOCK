#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/ca2e954e1af16b073300d2ec55c98491667e880739065f4c37181a7cc1feb879/contract';
import startContract from '../../snapshots/ca2e954e1af16b073300d2ec55c98491667e880739065f4c37181a7cc1feb879/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f9918dd934502adbfaca545acd0820ebc68d5266b1b2a85ecc8807597e81e149/contract';
import endContract from '../../snapshots/f9918dd934502adbfaca545acd0820ebc68d5266b1b2a85ecc8807597e81e149/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'study_group_plan_semesters',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('semesterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studyGroupId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studyPlanSemesterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'study_plan_assessments',
        columns: [
          col('controlForm', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studyPlanDisciplineId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'study_plan_assessment_form_1d4d2127',
            sql`length(btrim("controlForm")) > 0`,
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee_discipline_assignments',
        column: col('academicYear', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'students',
        constraint: 'student_admission_base_eae35d61',
        expression: sql`"admissionBase" IN (9, 11)`,
      }),
      this.addUnique({
        schema: 'public',
        table: 'study_group_plan_semesters',
        constraint: 'group_plan_calendar_semester_key',
        columns: ['studyGroupId', 'semesterId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'study_plan_assessments',
        constraint: 'study_plan_assessment_form_key',
        columns: ['studyPlanDisciplineId', 'controlForm'],
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'study_plan_semesters',
        constraint: 'study_plan_semester_number_2ea74590',
        expression: sql`number BETWEEN 1 AND 8`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'study_plans',
        constraint: 'study_plan_admission_base_eae35d61',
        expression: sql`"admissionBase" IN (9, 11)`,
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_discipline_year_idx',
        columns: ['disciplineId', 'academicYear'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_group_plan_semesters',
        index: 'study_group_plan_semesters_semesterId_idx_c8bca8d0',
        columns: ['semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_group_plan_semesters',
        index: 'study_group_plan_semesters_studyGroupId_idx_b7300630',
        columns: ['studyGroupId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_group_plan_semesters',
        index: 'study_group_plan_semesters_studyPlanSemesterId_idx_53cb93a2',
        columns: ['studyPlanSemesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_plan_assessments',
        index: 'study_plan_assessments_studyPlanDisciplineId_idx_dde5ce2b',
        columns: ['studyPlanDisciplineId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_group_plan_semesters',
        foreignKey: {
          name: 'study_group_plan_semesters_studyGroupId_fkey',
          columns: ['studyGroupId'],
          references: { schema: 'public', table: 'study_groups', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_group_plan_semesters',
        foreignKey: {
          name: 'study_group_plan_semesters_semesterId_fkey',
          columns: ['semesterId'],
          references: { schema: 'public', table: 'semesters', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_group_plan_semesters',
        foreignKey: {
          name: 'study_group_plan_semesters_studyPlanSemesterId_fkey',
          columns: ['studyPlanSemesterId'],
          references: { schema: 'public', table: 'study_plan_semesters', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_plan_assessments',
        foreignKey: {
          name: 'study_plan_assessments_studyPlanDisciplineId_fkey',
          columns: ['studyPlanDisciplineId'],
          references: { schema: 'public', table: 'study_plan_disciplines', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
