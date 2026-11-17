#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/883498eba607dcc50ea808c27046da31d2850a180097b60ed6ed74b44099b03e/contract';
import endContract from '../../snapshots/883498eba607dcc50ea808c27046da31d2850a180097b60ed6ed74b44099b03e/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e08bfbcda0e265e1228d54f9712805c87408adcbc589eda890717d9a36b0712a/contract';
import startContract from '../../snapshots/e08bfbcda0e265e1228d54f9712805c87408adcbc589eda890717d9a36b0712a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey, rawSql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'ap_course_semester_idx',
      }),
      this.dropIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'ap_email_semester_idx',
      }),
      this.createTable({
        schema: 'public',
        table: 'disciplines',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('suborganizationId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'organizations',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'semesters',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'students',
        columns: [
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('firstName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lastName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('patronymic', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'study_groups',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('suborganizationId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'suborganizations',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('organizationId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: col('disciplineId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: col('organizationId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: col('semesterId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: col('studentId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: col('studyGroupId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'academic_performance_records',
        column: col('suborganizationId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'disciplines',
        constraint: 'disciplines_suborganizationId_code_name_key',
        columns: ['suborganizationId', 'code', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'organizations',
        constraint: 'organizations_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'semesters',
        constraint: 'semesters_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'students',
        constraint: 'students_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'study_groups',
        constraint: 'study_groups_suborganizationId_name_key',
        columns: ['suborganizationId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'suborganizations',
        constraint: 'suborganizations_organizationId_name_key',
        columns: ['organizationId', 'name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_disciplineId_idx_e8c0205f',
        columns: ['disciplineId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_organizationId_idx_2e17ef41',
        columns: ['organizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_semesterId_idx_c8bca8d0',
        columns: ['semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_studentId_idx_bf255322',
        columns: ['studentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_studyGroupId_idx_b7300630',
        columns: ['studyGroupId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'academic_performance_records_suborganizationId_idx_0edb9417',
        columns: ['suborganizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'ap_discipline_semester_idx',
        columns: ['disciplineId', 'semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'academic_performance_records',
        index: 'ap_student_semester_idx',
        columns: ['studentId', 'semesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'disciplines',
        index: 'disciplines_suborganizationId_idx_0edb9417',
        columns: ['suborganizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'study_groups',
        index: 'study_groups_suborganizationId_idx_0edb9417',
        columns: ['suborganizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'suborganizations',
        index: 'suborganizations_organizationId_idx_2e17ef41',
        columns: ['organizationId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'disciplines',
        foreignKey: {
          name: 'disciplines_suborganizationId_fkey',
          columns: ['suborganizationId'],
          references: { schema: 'public', table: 'suborganizations', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'academic_performance_records',
        foreignKey: {
          name: 'academic_performance_records_disciplineId_fkey',
          columns: ['disciplineId'],
          references: { schema: 'public', table: 'disciplines', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'academic_performance_records',
        foreignKey: {
          name: 'academic_performance_records_organizationId_fkey',
          columns: ['organizationId'],
          references: { schema: 'public', table: 'organizations', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'academic_performance_records',
        foreignKey: {
          name: 'academic_performance_records_semesterId_fkey',
          columns: ['semesterId'],
          references: { schema: 'public', table: 'semesters', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'academic_performance_records',
        foreignKey: {
          name: 'academic_performance_records_studentId_fkey',
          columns: ['studentId'],
          references: { schema: 'public', table: 'students', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'study_groups',
        foreignKey: {
          name: 'study_groups_suborganizationId_fkey',
          columns: ['suborganizationId'],
          references: { schema: 'public', table: 'suborganizations', columns: ['id'] },
        },
      }),
      rawSql({
        id: 'data.backfill_academic_performance_dimensions',
        label: 'Backfill normalized academic performance dimensions',
        operationClass: 'data',
        target: { id: 'postgres' },
        precheck: [],
        execute: [
          {
            description: 'Backfill organizations',
            sql: `INSERT INTO "public"."organizations" ("name") SELECT DISTINCT "organization" FROM "public"."academic_performance_records" ON CONFLICT ("name") DO NOTHING`,
          },
          {
            description: 'Backfill suborganizations',
            sql: `INSERT INTO "public"."suborganizations" ("name", "organizationId") SELECT DISTINCT ap."suborganization", org."id" FROM "public"."academic_performance_records" ap JOIN "public"."organizations" org ON org."name" = ap."organization" ON CONFLICT ("organizationId", "name") DO NOTHING`,
          },
          {
            description: 'Backfill semesters',
            sql: `INSERT INTO "public"."semesters" ("name") SELECT DISTINCT "semester" FROM "public"."academic_performance_records" ON CONFLICT ("name") DO NOTHING`,
          },
          {
            description: 'Backfill students',
            sql: `INSERT INTO "public"."students" ("email", "lastName", "firstName", "patronymic") SELECT DISTINCT ON (lower(btrim("studentEmail"))) lower(btrim("studentEmail")), "studentLastName", "studentFirstName", "studentPatronymic" FROM "public"."academic_performance_records" ORDER BY lower(btrim("studentEmail")), "id" ON CONFLICT ("email") DO NOTHING`,
          },
          {
            description: 'Backfill study groups',
            sql: `INSERT INTO "public"."study_groups" ("name", "suborganizationId") SELECT DISTINCT ap."groupName", sub."id" FROM "public"."academic_performance_records" ap JOIN "public"."organizations" org ON org."name" = ap."organization" JOIN "public"."suborganizations" sub ON sub."name" = ap."suborganization" AND sub."organizationId" = org."id" ON CONFLICT ("suborganizationId", "name") DO NOTHING`,
          },
          {
            description: 'Backfill disciplines',
            sql: `INSERT INTO "public"."disciplines" ("code", "name", "suborganizationId") SELECT DISTINCT ap."disciplineCode", ap."disciplineName", sub."id" FROM "public"."academic_performance_records" ap JOIN "public"."organizations" org ON org."name" = ap."organization" JOIN "public"."suborganizations" sub ON sub."name" = ap."suborganization" AND sub."organizationId" = org."id" ON CONFLICT ("suborganizationId", "code", "name") DO NOTHING`,
          },
          {
            description: 'Link records to normalized dimensions',
            sql: `UPDATE "public"."academic_performance_records" ap SET "organizationId" = org."id", "suborganizationId" = sub."id", "semesterId" = sem."id", "studentId" = stu."id", "studyGroupId" = grp."id", "disciplineId" = dis."id" FROM "public"."organizations" org, "public"."suborganizations" sub, "public"."semesters" sem, "public"."students" stu, "public"."study_groups" grp, "public"."disciplines" dis WHERE org."name" = ap."organization" AND sub."name" = ap."suborganization" AND sub."organizationId" = org."id" AND sem."name" = ap."semester" AND stu."email" = lower(btrim(ap."studentEmail")) AND grp."name" = ap."groupName" AND grp."suborganizationId" = sub."id" AND dis."code" = ap."disciplineCode" AND dis."name" = ap."disciplineName" AND dis."suborganizationId" = sub."id"`,
          },
        ],
        postcheck: [
          {
            description: 'Verify all records are linked to dimensions',
            sql: `SELECT NOT EXISTS (SELECT 1 FROM "public"."academic_performance_records" WHERE "organizationId" IS NULL OR "suborganizationId" IS NULL OR "semesterId" IS NULL OR "studentId" IS NULL OR "studyGroupId" IS NULL OR "disciplineId" IS NULL)`,
          },
        ],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'academic_performance_records',
        foreignKey: {
          name: 'academic_performance_records_studyGroupId_fkey',
          columns: ['studyGroupId'],
          references: { schema: 'public', table: 'study_groups', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'suborganizations',
        foreignKey: {
          name: 'suborganizations_organizationId_fkey',
          columns: ['organizationId'],
          references: { schema: 'public', table: 'organizations', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'academic_performance_records',
        foreignKey: {
          name: 'academic_performance_records_suborganizationId_fkey',
          columns: ['suborganizationId'],
          references: { schema: 'public', table: 'suborganizations', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
