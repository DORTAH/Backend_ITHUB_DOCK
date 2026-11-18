#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/19b67fc8d24f307fe324cfcc5e2477edf1ba79c56e182287d668bd1391686222/contract';
import startContract from '../../snapshots/19b67fc8d24f307fe324cfcc5e2477edf1ba79c56e182287d668bd1391686222/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/99d0eaa8638305a6ab3c48f27ea1e99b4b0450806867694ea34c6a8ee1591ea0/contract';
import endContract from '../../snapshots/99d0eaa8638305a6ab3c48f27ea1e99b4b0450806867694ea34c6a8ee1591ea0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'employee_discipline_assignments',
        columns: [
          col('disciplineId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('employeeId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('semesterId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('studyPlanSemesterId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employee_positions',
        columns: [
          col('employeeId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employees',
        columns: [
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'study_plan_assessments',
        columns: [
          col('controlForm', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studyPlanItemId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studyPlanSemesterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'study_plan_items',
        columns: [
          col('fgosDisciplineId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('indexCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('studyPlanId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'study_plan_semesters',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('number', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studyPlanId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'study_plans',
        columns: [
          col('admissionBase', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('admissionYear', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('sourceFileName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('studyProgramId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'students',
        column: col('admissionBase', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'students',
        column: col('admissionYear', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'study_groups',
        column: col('studyPlanId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'employee_positions',
        constraint: 'employee_position_key',
        columns: ['employeeId', 'title'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'study_plan_assessments',
        constraint: 'study_plan_assessment_key',
        columns: ['studyPlanItemId', 'studyPlanSemesterId', 'controlForm'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'study_plan_items',
        constraint: 'study_plan_item_index_key',
        columns: ['studyPlanId', 'indexCode'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'study_plan_semesters',
        constraint: 'study_plan_semester_number_key',
        columns: ['studyPlanId', 'number'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'study_plans',
        constraint: 'study_plan_program_cohort_key',
        columns: ['studyProgramId', 'admissionBase', 'admissionYear'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_discipline_assignments_disciplineId_idx_e8c0205f',
        columns: ['disciplineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_discipline_assignments_employeeId_idx_087dd4a6',
        columns: ['employeeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_discipline_assignments_semesterId_idx_c8bca8d0',
        columns: ['semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_discipline_assignments_studyPlanSemesterId_id_53cb93a2',
        columns: ['studyPlanSemesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_discipline_semester_idx',
        columns: ['disciplineId', 'semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_plan_semester_idx',
        columns: ['employeeId', 'studyPlanSemesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_positions',
        index: 'employee_positions_employeeId_idx_087dd4a6',
        columns: ['employeeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_groups',
        index: 'study_groups_studyPlanId_idx_5ee30651',
        columns: ['studyPlanId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_plan_assessments',
        index: 'study_plan_assessments_studyPlanItemId_idx_e0b6c586',
        columns: ['studyPlanItemId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_plan_assessments',
        index: 'study_plan_assessments_studyPlanSemesterId_idx_53cb93a2',
        columns: ['studyPlanSemesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_plan_items',
        index: 'study_plan_items_fgosDisciplineId_idx_94293b20',
        columns: ['fgosDisciplineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_plan_items',
        index: 'study_plan_items_studyPlanId_idx_5ee30651',
        columns: ['studyPlanId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_plan_semesters',
        index: 'study_plan_semesters_studyPlanId_idx_5ee30651',
        columns: ['studyPlanId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_plans',
        index: 'study_plans_studyProgramId_idx_4b5996c5',
        columns: ['studyProgramId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employee_discipline_assignments',
        foreignKey: {
          name: 'employee_discipline_assignments_employeeId_fkey',
          columns: ['employeeId'],
          references: { schema: 'public', table: 'employees', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employee_discipline_assignments',
        foreignKey: {
          name: 'employee_discipline_assignments_disciplineId_fkey',
          columns: ['disciplineId'],
          references: { schema: 'public', table: 'disciplines', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employee_discipline_assignments',
        foreignKey: {
          name: 'employee_discipline_assignments_studyPlanSemesterId_fkey',
          columns: ['studyPlanSemesterId'],
          references: { schema: 'public', table: 'study_plan_semesters', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employee_discipline_assignments',
        foreignKey: {
          name: 'employee_discipline_assignments_semesterId_fkey',
          columns: ['semesterId'],
          references: { schema: 'public', table: 'semesters', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employee_positions',
        foreignKey: {
          name: 'employee_positions_employeeId_fkey',
          columns: ['employeeId'],
          references: { schema: 'public', table: 'employees', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_plan_assessments',
        foreignKey: {
          name: 'study_plan_assessments_studyPlanItemId_fkey',
          columns: ['studyPlanItemId'],
          references: { schema: 'public', table: 'study_plan_items', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_plan_assessments',
        foreignKey: {
          name: 'study_plan_assessments_studyPlanSemesterId_fkey',
          columns: ['studyPlanSemesterId'],
          references: { schema: 'public', table: 'study_plan_semesters', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_plan_items',
        foreignKey: {
          name: 'study_plan_items_studyPlanId_fkey',
          columns: ['studyPlanId'],
          references: { schema: 'public', table: 'study_plans', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_plan_items',
        foreignKey: {
          name: 'study_plan_items_fgosDisciplineId_fkey',
          columns: ['fgosDisciplineId'],
          references: { schema: 'public', table: 'fgos_disciplines', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_plan_semesters',
        foreignKey: {
          name: 'study_plan_semesters_studyPlanId_fkey',
          columns: ['studyPlanId'],
          references: { schema: 'public', table: 'study_plans', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_plans',
        foreignKey: {
          name: 'study_plans_studyProgramId_fkey',
          columns: ['studyProgramId'],
          references: { schema: 'public', table: 'study_programs', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_groups',
        foreignKey: {
          name: 'study_groups_studyPlanId_fkey',
          columns: ['studyPlanId'],
          references: { schema: 'public', table: 'study_plans', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
