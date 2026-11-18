#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/19b67fc8d24f307fe324cfcc5e2477edf1ba79c56e182287d668bd1391686222/contract';
import endContract from '../../snapshots/19b67fc8d24f307fe324cfcc5e2477edf1ba79c56e182287d668bd1391686222/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/19c07fc3523471fda4f843a70b57cb6a13b822a37a3215977c12577adf9d8143/contract';
import startContract from '../../snapshots/19c07fc3523471fda4f843a70b57cb6a13b822a37a3215977c12577adf9d8143/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'student_enrollments',
        columns: [
          col('academicYear', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('courseNumber', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('semesterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studyGroupId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'student_enrollments',
        constraint: 'student_enrollment_student_semester_key',
        columns: ['studentId', 'semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_enrollments',
        index: 'student_enrollment_group_semester_idx',
        columns: ['studyGroupId', 'semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_enrollments',
        index: 'student_enrollments_semesterId_idx_c8bca8d0',
        columns: ['semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_enrollments',
        index: 'student_enrollments_studentId_idx_bf255322',
        columns: ['studentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_enrollments',
        index: 'student_enrollments_studyGroupId_idx_b7300630',
        columns: ['studyGroupId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_enrollments',
        foreignKey: {
          name: 'student_enrollments_studentId_fkey',
          columns: ['studentId'],
          references: { schema: 'public', table: 'students', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_enrollments',
        foreignKey: {
          name: 'student_enrollments_semesterId_fkey',
          columns: ['semesterId'],
          references: { schema: 'public', table: 'semesters', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_enrollments',
        foreignKey: {
          name: 'student_enrollments_studyGroupId_fkey',
          columns: ['studyGroupId'],
          references: { schema: 'public', table: 'study_groups', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
