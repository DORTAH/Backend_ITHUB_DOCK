#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/5f0660d95852aac462ad97a8337d65ab13cfc8a9e45d031924c42d82714b623f/contract';
import startContract from '../../snapshots/5f0660d95852aac462ad97a8337d65ab13cfc8a9e45d031924c42d82714b623f/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/8f2593065a4ad9cdc9c42239d5b726b9ddee6c51fc40b0cf3d597dfb2cd8afc9/contract';
import endContract from '../../snapshots/8f2593065a4ad9cdc9c42239d5b726b9ddee6c51fc40b0cf3d597dfb2cd8afc9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'academic_performance_records',
        constraint: 'academic_performance_records_disciplineId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'academic_performance_records',
        constraint: 'academic_performance_records_importBatchId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'academic_performance_records',
        constraint: 'academic_performance_records_organizationId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'academic_performance_records',
        constraint: 'academic_performance_records_studentId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'academic_performance_records',
        constraint: 'academic_performance_records_studyGroupId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'academic_performance_records',
        constraint: 'academic_performance_records_suborganizationId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'employee_positions',
        constraint: 'employee_position_key',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_disciplineId_idx_e8c0205f',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_importBatchId_idx_172660b3',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_organizationId_idx_2e17ef41',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_studentId_idx_bf255322',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_studyGroupId_idx_b7300630',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_suborganizationId_idx_0edb9417',
      }),
      this.dropTable({ schema: 'public', table: 'employee_discipline_assignments' }),
      this.dropColumn({ schema: 'public', table: 'employee_positions', column: 'title' }),
      this.dropTable({ schema: 'public', table: 'student_enrollments' }),
      this.dropTable({ schema: 'public', table: 'study_group_plan_semesters' }),
      this.createTable({
        schema: 'public',
        table: 'positions',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'employee_positions',
        column: 'positionId',
        type: 'int4',
      }),
      this.addUnique({
        schema: 'public',
        table: 'employee_positions',
        constraint: 'employee_position_key',
        columns: ['employeeId', 'positionId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'positions',
        constraint: 'positions_title_key',
        columns: ['title'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_positions',
        index: 'employee_positions_positionId_idx_f0417710',
        columns: ['positionId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employee_positions',
        foreignKey: {
          name: 'employee_positions_positionId_fkey',
          columns: ['positionId'],
          references: { schema: 'public', table: 'positions', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
