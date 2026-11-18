#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/19b67fc8d24f307fe324cfcc5e2477edf1ba79c56e182287d668bd1391686222/contract';
import endContract from '../../snapshots/19b67fc8d24f307fe324cfcc5e2477edf1ba79c56e182287d668bd1391686222/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/4aadc3c5f8776c549d84318c38fc68f54ccc8b47c414137b2888e460ca243a53/contract';
import startContract from '../../snapshots/4aadc3c5f8776c549d84318c38fc68f54ccc8b47c414137b2888e460ca243a53/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'attestation_commission_members',
        columns: [
          col('commissionId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('position', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'attestation_commissions',
        columns: [
          col('disciplineId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('semesterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studyGroupId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('studyProgramId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
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
        table: 'attestation_commission_members',
        index: 'att_comm_member_order_idx',
        columns: ['commissionId', 'sortOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commission_members',
        index: 'attestation_commission_members_commissionId_idx_5ca7b813',
        columns: ['commissionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'att_comm_group_sem_idx',
        columns: ['studyGroupId', 'semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'att_comm_prog_sem_idx',
        columns: ['studyProgramId', 'semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'attestation_commissions_disciplineId_idx_e8c0205f',
        columns: ['disciplineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'attestation_commissions_semesterId_idx_c8bca8d0',
        columns: ['semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'attestation_commissions_studyGroupId_idx_b7300630',
        columns: ['studyGroupId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'attestation_commissions_studyProgramId_idx_4b5996c5',
        columns: ['studyProgramId'],
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
        table: 'attestation_commission_members',
        foreignKey: {
          name: 'attestation_commission_members_commissionId_fkey',
          columns: ['commissionId'],
          references: { schema: 'public', table: 'attestation_commissions', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attestation_commissions',
        foreignKey: {
          name: 'attestation_commissions_studyProgramId_fkey',
          columns: ['studyProgramId'],
          references: { schema: 'public', table: 'study_programs', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attestation_commissions',
        foreignKey: {
          name: 'attestation_commissions_semesterId_fkey',
          columns: ['semesterId'],
          references: { schema: 'public', table: 'semesters', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attestation_commissions',
        foreignKey: {
          name: 'attestation_commissions_studyGroupId_fkey',
          columns: ['studyGroupId'],
          references: { schema: 'public', table: 'study_groups', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'attestation_commissions',
        foreignKey: {
          name: 'attestation_commissions_disciplineId_fkey',
          columns: ['disciplineId'],
          references: { schema: 'public', table: 'disciplines', columns: ['id'] },
        },
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
