#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5f0660d95852aac462ad97a8337d65ab13cfc8a9e45d031924c42d82714b623f/contract';
import endContract from '../../snapshots/5f0660d95852aac462ad97a8337d65ab13cfc8a9e45d031924c42d82714b623f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f9918dd934502adbfaca545acd0820ebc68d5266b1b2a85ecc8807597e81e149/contract';
import startContract from '../../snapshots/f9918dd934502adbfaca545acd0820ebc68d5266b1b2a85ecc8807597e81e149/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'academic_performance_records',
        constraint: 'academic_performance_records_semesterId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'attestation_commissions',
        constraint: 'attestation_commissions_semesterId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'employee_discipline_assignments',
        constraint: 'employee_discipline_assignments_semesterId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'employee_discipline_assignments',
        constraint: 'employee_discipline_assignments_studyPlanSemesterId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'student_enrollments',
        constraint: 'student_enrollments_semesterId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'student_licenses',
        constraint: 'student_licenses_semesterId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'study_group_plan_semesters',
        constraint: 'study_group_plan_semesters_semesterId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'study_group_plan_semesters',
        constraint: 'study_group_plan_semesters_studyPlanSemesterId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'study_plan_disciplines',
        constraint: 'study_plan_disciplines_studyPlanSemesterId_fkey',
        kind: 'foreignKey',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'student_enrollments',
        constraint: 'student_enrollment_student_semester_key',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'student_licenses',
        constraint: 'student_licenses_studentId_semesterId_key',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'study_group_plan_semesters',
        constraint: 'group_plan_calendar_semester_key',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'study_plan_disciplines',
        constraint: 'study_plan_discipline_key',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_semesterId_idx_c8bca8d0',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'att_comm_group_sem_idx',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'att_comm_prog_sem_idx',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'attestation_commissions_semesterId_idx_c8bca8d0',
      }),
      this.dropColumn({ schema: 'public', table: 'attestation_commissions', column: 'semesterId' }),
      this.dropIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_discipline_assignments_semesterId_idx_c8bca8d0',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_discipline_assignments_studyPlanSemesterId_id_53cb93a2',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_discipline_semester_idx',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'employee_discipline_assignments',
        column: 'semesterId',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_plan_semester_idx',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'employee_discipline_assignments',
        column: 'studyPlanSemesterId',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'student_enrollments',
        index: 'student_enrollment_group_semester_idx',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'student_enrollments',
        index: 'student_enrollments_semesterId_idx_c8bca8d0',
      }),
      this.dropColumn({ schema: 'public', table: 'student_enrollments', column: 'semesterId' }),
      this.dropIndex({
        schema: 'public',
        table: 'student_licenses',
        index: 'student_licenses_semesterId_idx_c8bca8d0',
      }),
      this.dropColumn({ schema: 'public', table: 'student_licenses', column: 'semesterId' }),
      this.dropTable({ schema: 'public', table: 'semesters' }),
      this.dropIndex({
        schema: 'public',
        table: 'study_group_plan_semesters',
        index: 'study_group_plan_semesters_semesterId_idx_c8bca8d0',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'study_group_plan_semesters',
        index: 'study_group_plan_semesters_studyPlanSemesterId_idx_53cb93a2',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'study_group_plan_semesters',
        column: 'studyPlanSemesterId',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'study_group_plan_semesters',
        column: 'semesterId',
      }),
      this.dropTable({ schema: 'public', table: 'study_plan_assessments' }),
      this.dropIndex({
        schema: 'public',
        table: 'study_plan_disciplines',
        index: 'study_plan_disciplines_studyPlanSemesterId_idx_53cb93a2',
      }),
      this.dropColumn({
        schema: 'public',
        table: 'study_plan_disciplines',
        column: 'studyPlanSemesterId',
      }),
      this.dropTable({ schema: 'public', table: 'study_plan_semesters' }),
      this.createTable({
        schema: 'public',
        table: 'student_discipline_grades',
        columns: [
          col('academicPerformanceId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('admissionYear', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('date', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('disciplineId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('employeeId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('grade', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('semesterNumber', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'student_license_history',
        columns: [
          col('academicYear', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('semesterLabel', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('semesterNumber', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('studentLicenseId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'attestation_commissions',
        column: col('academicYear', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'attestation_commissions',
        column: col('semesterLabel', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'attestation_commissions',
        column: col('semesterNumber', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee_discipline_assignments',
        column: col('semesterLabel', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee_discipline_assignments',
        column: col('semesterNumber', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'student_enrollments',
        column: col('semesterNumber', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'study_group_plan_semesters',
        column: col('academicYear', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'student_enrollments',
        column: 'semesterLabel',
        type: 'text',
      }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'study_group_plan_semesters',
        column: 'semesterLabel',
        type: 'text',
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'study_group_plan_semesters',
        column: 'semesterNumber',
        type: 'int4',
        temporaryDefault: sql`0`,
      }),
      this.addColumnWithTemporaryDefault({
        schema: 'public',
        table: 'study_plan_disciplines',
        column: 'semesterNumber',
        type: 'int4',
        temporaryDefault: sql`0`,
      }),
      this.addRequiredColumnToEmptyTable({
        schema: 'public',
        table: 'study_plan_disciplines',
        column: 'studyPlanId',
        type: 'int4',
      }),
      this.addUnique({
        schema: 'public',
        table: 'student_enrollments',
        constraint: 'student_enrollment_student_semester_key',
        columns: ['studentId', 'semesterLabel'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'study_group_plan_semesters',
        constraint: 'group_plan_calendar_semester_key',
        columns: ['studyGroupId', 'semesterLabel'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'att_comm_group_term_idx',
        columns: ['studyGroupId', 'academicYear', 'semesterNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'attestation_commissions',
        index: 'att_comm_prog_term_idx',
        columns: ['studyProgramId', 'academicYear', 'semesterNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_discipline_term_idx',
        columns: ['disciplineId', 'semesterNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee_discipline_assignments',
        index: 'employee_year_term_idx',
        columns: ['employeeId', 'academicYear', 'semesterNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_discipline_grades',
        index: 'student_discipline_grades_disciplineId_idx_e8c0205f',
        columns: ['disciplineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_discipline_grades',
        index: 'student_discipline_grades_employeeId_idx_087dd4a6',
        columns: ['employeeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_discipline_grades',
        index: 'student_discipline_grades_studentId_idx_bf255322',
        columns: ['studentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_discipline_grades',
        index: 'student_grade_discipline_term_idx',
        columns: ['disciplineId', 'admissionYear', 'semesterNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_discipline_grades',
        index: 'student_grade_performance_idx',
        columns: ['academicPerformanceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_discipline_grades',
        index: 'student_grade_student_term_idx',
        columns: ['studentId', 'admissionYear', 'semesterNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_enrollments',
        index: 'student_enrollment_group_term_idx',
        columns: ['studyGroupId', 'academicYear', 'semesterNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_license_history',
        index: 'student_license_history_studentLicenseId_idx_1232b097',
        columns: ['studentLicenseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_license_history',
        index: 'student_license_history_term_idx',
        columns: ['studentLicenseId', 'academicYear', 'semesterNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_plan_disciplines',
        index: 'study_plan_discipline_term_idx',
        columns: ['studyPlanId', 'semesterNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_plan_disciplines',
        index: 'study_plan_disciplines_studyPlanId_idx_5ee30651',
        columns: ['studyPlanId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_discipline_grades',
        foreignKey: {
          name: 'student_discipline_grades_studentId_fkey',
          columns: ['studentId'],
          references: { schema: 'public', table: 'students', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_discipline_grades',
        foreignKey: {
          name: 'student_discipline_grades_disciplineId_fkey',
          columns: ['disciplineId'],
          references: { schema: 'public', table: 'disciplines', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_discipline_grades',
        foreignKey: {
          name: 'student_discipline_grades_employeeId_fkey',
          columns: ['employeeId'],
          references: { schema: 'public', table: 'employees', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_discipline_grades',
        foreignKey: {
          name: 'student_discipline_grades_academicPerformanceId_fkey',
          columns: ['academicPerformanceId'],
          references: { schema: 'public', table: 'academic_performance_records', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_license_history',
        foreignKey: {
          name: 'student_license_history_studentLicenseId_fkey',
          columns: ['studentLicenseId'],
          references: { schema: 'public', table: 'student_licenses', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_plan_disciplines',
        foreignKey: {
          name: 'study_plan_disciplines_studyPlanId_fkey',
          columns: ['studyPlanId'],
          references: { schema: 'public', table: 'study_plans', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
