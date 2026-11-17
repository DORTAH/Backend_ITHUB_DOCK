#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/e08bfbcda0e265e1228d54f9712805c87408adcbc589eda890717d9a36b0712a/contract';
import endContract from '../../snapshots/e08bfbcda0e265e1228d54f9712805c87408adcbc589eda890717d9a36b0712a/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'academic_performance_records',
        columns: [
          col('allDisciplineTeachers', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('availableControlPoints', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('currentDisciplinePercent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('currentPointsFivePointScale', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('currentStudentAveragePercent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('disciplineCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('disciplineName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('finalPoints', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('finalPointsFivePointScale', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('groupName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('importBatchId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('maxAvailableControlPoints', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('maxDisciplinePoints', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('maxPointsByTopics', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('organization', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('retakePoints', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('retakePointsNew', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('semester', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sourceRowNumber', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studentEmail', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('studentFirstName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('studentLastName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('studentPatronymic', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('suborganization', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('taskAndTestPoints', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('teachersFromWorkload', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('teachersWhoGraded', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'import_batches',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('importedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('rowCount', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('semester', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('sourceFileName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'academic_performance_records',
        constraint: 'ap_batch_row_key',
        columns: ['importBatchId', 'sourceRowNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_importBatchId_idx_172660b3',
        columns: ['importBatchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'ap_course_semester_idx',
        columns: ['disciplineCode', 'semester'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'ap_email_semester_idx',
        columns: ['studentEmail', 'semester'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'import_batches',
        index: 'import_batches_semester_importedAt_idx_87a6ccc8',
        columns: ['semester', 'importedAt'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'academic_performance_records',
        foreignKey: {
          name: 'academic_performance_records_importBatchId_fkey',
          columns: ['importBatchId'],
          references: { schema: 'public', table: 'import_batches', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
