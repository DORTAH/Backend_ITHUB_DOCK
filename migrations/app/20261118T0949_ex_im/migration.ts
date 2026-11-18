#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/4aadc3c5f8776c549d84318c38fc68f54ccc8b47c414137b2888e460ca243a53/contract';
import endContract from '../../snapshots/4aadc3c5f8776c549d84318c38fc68f54ccc8b47c414137b2888e460ca243a53/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/87817ca322c093fad0e51d443f9137234191785b39b30ad54f65e1b604b26d5e/contract';
import startContract from '../../snapshots/87817ca322c093fad0e51d443f9137234191785b39b30ad54f65e1b604b26d5e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'fgos_discipline_mappings',
        columns: [
          col('disciplineId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('fgosDisciplineId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'fgos_disciplines',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('studyProgramId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'licenses',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'student_licenses',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('licenseId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('semesterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('studentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'study_programs',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('qualification', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('specialtyCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('suborganizationId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'study_groups',
        column: col('studyProgramId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'fgos_discipline_mappings',
        constraint: 'fgos_discipline_mappings_disciplineId_fgosDisciplineId_key',
        columns: ['disciplineId', 'fgosDisciplineId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'fgos_disciplines',
        constraint: 'fgos_disciplines_studyProgramId_code_name_key',
        columns: ['studyProgramId', 'code', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'licenses',
        constraint: 'licenses_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'student_licenses',
        constraint: 'student_licenses_studentId_semesterId_key',
        columns: ['studentId', 'semesterId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'study_programs',
        constraint: 'study_programs_suborganizationId_specialtyCode_key',
        columns: ['suborganizationId', 'specialtyCode'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'fgos_discipline_mappings',
        index: 'fgos_discipline_mappings_disciplineId_idx_e8c0205f',
        columns: ['disciplineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'fgos_discipline_mappings',
        index: 'fgos_discipline_mappings_fgosDisciplineId_idx_94293b20',
        columns: ['fgosDisciplineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'fgos_disciplines',
        index: 'fgos_disciplines_studyProgramId_idx_4b5996c5',
        columns: ['studyProgramId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_licenses',
        index: 'student_licenses_licenseId_idx_bd8730e9',
        columns: ['licenseId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_licenses',
        index: 'student_licenses_semesterId_idx_c8bca8d0',
        columns: ['semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'student_licenses',
        index: 'student_licenses_studentId_idx_bf255322',
        columns: ['studentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_groups',
        index: 'study_groups_studyProgramId_idx_4b5996c5',
        columns: ['studyProgramId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_programs',
        index: 'study_programs_suborganizationId_idx_0edb9417',
        columns: ['suborganizationId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'fgos_discipline_mappings',
        foreignKey: {
          name: 'fgos_discipline_mappings_disciplineId_fkey',
          columns: ['disciplineId'],
          references: { schema: 'public', table: 'disciplines', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'fgos_discipline_mappings',
        foreignKey: {
          name: 'fgos_discipline_mappings_fgosDisciplineId_fkey',
          columns: ['fgosDisciplineId'],
          references: { schema: 'public', table: 'fgos_disciplines', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'fgos_disciplines',
        foreignKey: {
          name: 'fgos_disciplines_studyProgramId_fkey',
          columns: ['studyProgramId'],
          references: { schema: 'public', table: 'study_programs', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_licenses',
        foreignKey: {
          name: 'student_licenses_studentId_fkey',
          columns: ['studentId'],
          references: { schema: 'public', table: 'students', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_licenses',
        foreignKey: {
          name: 'student_licenses_licenseId_fkey',
          columns: ['licenseId'],
          references: { schema: 'public', table: 'licenses', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'student_licenses',
        foreignKey: {
          name: 'student_licenses_semesterId_fkey',
          columns: ['semesterId'],
          references: { schema: 'public', table: 'semesters', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_programs',
        foreignKey: {
          name: 'study_programs_suborganizationId_fkey',
          columns: ['suborganizationId'],
          references: { schema: 'public', table: 'suborganizations', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_groups',
        foreignKey: {
          name: 'study_groups_studyProgramId_fkey',
          columns: ['studyProgramId'],
          references: { schema: 'public', table: 'study_programs', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
